// backend/server.js
const express = require('express');
const cors = require('cors');
const { Op } = require('sequelize');
const { sequelize, testConnection } = require('./config/database');
const { syncDatabase } = require('./models');
const Complaint = require('./models/Complaint');
const Admin = require('./models/Admin');
const Staff = require('./models/Staff');

// Note: bcryptjs is optional - we'll handle both cases
let bcrypt;
try {
    bcrypt = require('bcryptjs');
} catch (e) {
    console.log('⚠️ bcryptjs not installed, using plain text password comparison');
    bcrypt = null;
}

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========== HEALTH CHECK ENDPOINT ==========
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

// ========== SUBMIT COMPLAINT ==========
app.post('/api/complaints/submit', async (req, res) => {
    try {
        const {
            natureOfComplaint,
            name,
            description,
            email,
            phone,
            state,
            district,
            municipality,
            wardNo,
            streetAddress,
            subject,
            priority,
            address,
            landmark,
            preferredContact,
            referenceNumber,
            complaintCategory
        } = req.body;
        
        console.log('📝 Received complaint:', { name, email, phone, complaintCategory });
        
        if (!name || !phone || !description) {
            return res.status(400).json({ 
                success: false, 
                message: 'Name, phone, and description are required' 
            });
        }
        
        const timestamp = Date.now();
        const randomNum = Math.floor(Math.random() * 1000);
        const complaintNumber = `NTC-${timestamp}-${randomNum}`;
        const complaintNumberNp = `एनटीसी-${timestamp}-${randomNum}`;
        const trackingPassword = Math.floor(Math.random() * 9000 + 1000).toString();
        
        let complaintData = {
            complaintNumber,
            complaintNumberNp,
            name,
            email: email || '',
            phone,
            description,
            trackingPassword,
            status: 'Pending',
            statusNp: 'विचाराधीन',
            submittedDate: new Date()
        };
        
        if (complaintCategory === 'complaint_regarding') {
            complaintData = {
                ...complaintData,
                complaintCategory: 'complaint_regarding',
                natureOfComplaint: natureOfComplaint || '',
                subject: subject || '',
                priority: priority || 'medium',
                address: address || '',
                landmark: landmark || '',
                preferredContact: preferredContact || 'phone',
                referenceNumber: referenceNumber || ''
            };
        } else {
            complaintData = {
                ...complaintData,
                complaintCategory: 'general',
                natureOfComplaint: natureOfComplaint || '',
                state: state || '',
                district: district || '',
                municipality: municipality || '',
                wardNo: wardNo || '',
                streetAddress: streetAddress || ''
            };
        }
        
        const complaint = await Complaint.create(complaintData);
        
        console.log('✅ Complaint saved with ID:', complaint.id);
        
        res.status(201).json({
            success: true,
            message: 'Complaint submitted successfully',
            data: {
                id: complaint.id,
                complaintNumber,
                complaintNumberNp,
                trackingPassword,
                status: 'Pending'
            }
        });
        
    } catch (error) {
        console.error('❌ Error submitting complaint:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to submit complaint',
            error: error.message 
        });
    }
});

// ========== GET ALL COMPLAINTS ==========
app.get('/api/complaints', async (req, res) => {
    try {
        const complaints = await Complaint.findAll({
            order: [['submittedDate', 'DESC']]
        });
        res.json({ success: true, data: complaints });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ========== TRACK COMPLAINT ==========
app.get('/api/complaints/track/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { password } = req.query;
        
        let complaint;
        if (!isNaN(id)) {
            complaint = await Complaint.findByPk(parseInt(id));
        } else {
            complaint = await Complaint.findOne({ where: { complaintNumber: id } });
        }
        
        if (!complaint) {
            return res.status(404).json({ success: false, message: 'Complaint not found' });
        }
        
        if (password && complaint.trackingPassword !== password) {
            return res.status(403).json({ success: false, message: 'Invalid tracking password' });
        }
        
        res.json({ success: true, data: complaint });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ========== UPDATE COMPLAINT STATUS ==========
app.put('/api/complaints/:id', async (req, res) => {
    try {
        const complaint = await Complaint.findByPk(req.params.id);
        if (!complaint) {
            return res.status(404).json({ success: false, error: 'Complaint not found' });
        }
        
        const { status, resolution } = req.body;
        
        if (status) {
            complaint.status = status;
            const statusMap = {
                'Pending': 'विचाराधीन',
                'In Progress': 'प्रगतिमा',
                'Resolved': 'समाधान भयो',
                'Closed': 'बन्द',
                'Rejected': 'अस्वीकृत'
            };
            complaint.statusNp = statusMap[status] || complaint.statusNp;
        }
        
        if (resolution) complaint.resolution = resolution;
        if (status === 'Resolved' && !complaint.resolvedDate) {
            complaint.resolvedDate = new Date();
        }
        
        await complaint.save();
        res.json({ success: true, message: 'Complaint updated successfully', data: complaint });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ========== GET STATISTICS ==========
app.get('/api/statistics', async (req, res) => {
    try {
        const total = await Complaint.count();
        const pending = await Complaint.count({ where: { status: 'Pending' } });
        const inProgress = await Complaint.count({ where: { status: 'In Progress' } });
        const resolved = await Complaint.count({ where: { status: 'Resolved' } });
        
        res.json({
            success: true,
            total,
            pending,
            inProgress,
            resolved,
            resolutionRate: total > 0 ? ((resolved / total) * 100).toFixed(2) : 0
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ========== ADMIN AUTHENTICATION ==========

// Admin Login endpoint
app.post('/api/admin/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        console.log('📝 Admin login attempt:', email);
        
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }
        
        const admin = await Admin.findOne({
            where: {
                [Op.or]: [
                    { email: email },
                    { username: email }
                ],
                isActive: true
            }
        });
        
        if (!admin) {
            console.log('❌ Admin not found:', email);
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
        
        // Check password (support both plain text and bcrypt)
        let isPasswordValid = false;
        if (admin.password.startsWith('$2a$') || admin.password.startsWith('$2b$')) {
            if (bcrypt) {
                isPasswordValid = await bcrypt.compare(password, admin.password);
            } else {
                isPasswordValid = false;
            }
        } else {
            isPasswordValid = admin.password === password;
        }
        
        if (!isPasswordValid) {
            console.log('❌ Invalid password for:', email);
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
        
        await admin.update({ lastLogin: new Date() });
        const token = Buffer.from(`${admin.id}-${Date.now()}`).toString('base64');
        
        console.log('✅ Admin login successful:', admin.email);
        
        res.json({
            success: true,
            message: 'Login successful',
            token: token,
            user: {
                id: admin.id,
                email: admin.email,
                username: admin.username,
                fullName: admin.fullName,
                role: admin.role || 'admin'
            }
        });
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed. Please try again.'
        });
    }
});

// Admin Logout endpoint
app.post('/api/admin/logout', async (req, res) => {
    res.json({ success: true, message: 'Logout successful' });
});

// ========== STAFF AUTHENTICATION ==========

// Staff Login endpoint
app.post('/api/staff/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        console.log('📝 Staff login attempt:', email);
        
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }
        
        const staff = await Staff.findOne({
            where: {
                [Op.or]: [
                    { email: email },
                    { username: email }
                ],
                isActive: true
            }
        });
        
        if (!staff) {
            console.log('❌ Staff not found:', email);
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
        
        // Check password (support both plain text and bcrypt)
        let isPasswordValid = false;
        if (staff.password && (staff.password.startsWith('$2a$') || staff.password.startsWith('$2b$'))) {
            if (bcrypt) {
                isPasswordValid = await bcrypt.compare(password, staff.password);
            } else {
                isPasswordValid = false;
            }
        } else {
            isPasswordValid = staff.password === password;
        }
        
        if (!isPasswordValid) {
            console.log('❌ Invalid password for staff:', email);
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
        
        await staff.update({ lastLogin: new Date() });
        const token = Buffer.from(`${staff.id}-${Date.now()}`).toString('base64');
        
        console.log('✅ Staff login successful:', staff.email);
        
        res.json({
            success: true,
            message: 'Login successful',
            token: token,
            user: {
                id: staff.id,
                email: staff.email,
                username: staff.username,
                fullName: staff.fullName,
                role: staff.role || 'staff',
                department: staff.department,
                phone: staff.phone
            }
        });
        
    } catch (error) {
        console.error('Staff login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed. Please try again.'
        });
    }
});

// Staff Logout endpoint
app.post('/api/staff/logout', async (req, res) => {
    res.json({ success: true, message: 'Logout successful' });
});

// ========== STAFF MANAGEMENT (Admin only) ==========

// Get all staff members
app.get('/api/admin/staff', async (req, res) => {
    try {
        const staff = await Staff.findAll({
            attributes: ['id', 'username', 'email', 'fullName', 'phone', 'department', 'role', 'isActive', 'lastLogin'],
            order: [['createdAt', 'DESC']]
        });
        res.json({ success: true, data: staff });
    } catch (error) {
        console.error('Error fetching staff:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create new staff member (Admin only)
app.post('/api/admin/staff', async (req, res) => {
    try {
        const { username, email, password, fullName, phone, department } = req.body;
        
        // Check if staff already exists
        const existingStaff = await Staff.findOne({
            where: {
                [Op.or]: [
                    { email: email },
                    { username: username }
                ]
            }
        });
        
        if (existingStaff) {
            return res.status(400).json({
                success: false,
                message: 'Staff with this email or username already exists'
            });
        }
        
        // Hash password if bcrypt is available
        let finalPassword = password;
        if (bcrypt) {
            finalPassword = await bcrypt.hash(password, 10);
        }
        
        const staff = await Staff.create({
            username,
            email,
            password: finalPassword,
            fullName,
            phone,
            department: department || 'General',
            role: 'staff',
            isActive: true
        });
        
        res.json({
            success: true,
            message: 'Staff member created successfully',
            data: {
                id: staff.id,
                username: staff.username,
                email: staff.email,
                fullName: staff.fullName
            }
        });
        
    } catch (error) {
        console.error('Error creating staff:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update staff member
app.put('/api/admin/staff/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { fullName, phone, department, isActive } = req.body;
        
        const staff = await Staff.findByPk(id);
        if (!staff) {
            return res.status(404).json({ success: false, message: 'Staff not found' });
        }
        
        await staff.update({
            fullName: fullName || staff.fullName,
            phone: phone || staff.phone,
            department: department || staff.department,
            isActive: isActive !== undefined ? isActive : staff.isActive
        });
        
        res.json({
            success: true,
            message: 'Staff updated successfully',
            data: staff
        });
        
    } catch (error) {
        console.error('Error updating staff:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete staff member
app.delete('/api/admin/staff/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const staff = await Staff.findByPk(id);
        if (!staff) {
            return res.status(404).json({ success: false, message: 'Staff not found' });
        }
        
        await staff.destroy();
        res.json({ success: true, message: 'Staff deleted successfully' });
        
    } catch (error) {
        console.error('Error deleting staff:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ========== STAFF DASHBOARD ENDPOINTS ==========

// Get staff statistics
app.get('/api/staff/stats', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        
        // Decode token to get staff ID
        const staffId = parseInt(Buffer.from(token, 'base64').toString().split('-')[0]);
        const staff = await Staff.findByPk(staffId);
        
        if (!staff) {
            return res.status(404).json({ success: false, message: 'Staff not found' });
        }
        
        // Get assigned complaints
        const assignedComplaints = await Complaint.findAll({
            where: { assignedTo: staff.email }
        });
        
        const totalAssigned = assignedComplaints.length;
        const pending = assignedComplaints.filter(c => c.status === 'Pending').length;
        const inProgress = assignedComplaints.filter(c => c.status === 'In Progress').length;
        const resolved = assignedComplaints.filter(c => c.status === 'Resolved').length;
        
        res.json({
            success: true,
            data: {
                totalAssigned,
                pending,
                inProgress,
                resolved,
                completionRate: totalAssigned > 0 ? (resolved / totalAssigned) * 100 : 0
            }
        });
        
    } catch (error) {
        console.error('Error fetching staff stats:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get assigned complaints for staff
app.get('/api/staff/complaints', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        
        const staffId = parseInt(Buffer.from(token, 'base64').toString().split('-')[0]);
        const staff = await Staff.findByPk(staffId);
        
        if (!staff) {
            return res.status(404).json({ success: false, message: 'Staff not found' });
        }
        
        const complaints = await Complaint.findAll({
            where: { assignedTo: staff.email },
            order: [['submittedDate', 'DESC']]
        });
        
        res.json({ success: true, data: complaints });
        
    } catch (error) {
        console.error('Error fetching assigned complaints:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update complaint status (staff)
app.patch('/api/staff/complaints/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, feedback, satisfactionRating } = req.body;
        
        const complaint = await Complaint.findByPk(id);
        if (!complaint) {
            return res.status(404).json({ success: false, message: 'Complaint not found' });
        }
        
        complaint.status = status;
        const statusMap = {
            'Pending': 'विचाराधीन',
            'In Progress': 'प्रगतिमा',
            'Resolved': 'समाधान भयो',
            'Closed': 'बन्द'
        };
        complaint.statusNp = statusMap[status] || complaint.statusNp;
        
        if (feedback) complaint.feedback = feedback;
        if (satisfactionRating) complaint.satisfactionRating = satisfactionRating;
        
        if (status === 'Resolved' && !complaint.resolvedDate) {
            complaint.resolvedDate = new Date();
            // Calculate resolution days
            const submitted = new Date(complaint.submittedDate);
            const resolved = new Date();
            complaint.resolutionDays = Math.ceil((resolved - submitted) / (1000 * 60 * 60 * 24));
        }
        
        await complaint.save();
        
        res.json({ success: true, message: 'Complaint status updated', data: complaint });
        
    } catch (error) {
        console.error('Error updating complaint status:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ========== START SERVER ==========
const startServer = async () => {
    try {
        await testConnection();
        await syncDatabase();
        
        // Create default admin if not exists
        const adminCount = await Admin.count();
        if (adminCount === 0) {
            await Admin.create({
                username: 'admin',
                email: 'admin@ntc.com',
                password: 'admin123', // Plain text password
                fullName: 'Administrator',
                role: 'admin',
                isActive: true
            });
            console.log('✅ Default admin user created: admin@ntc.com / admin123');
        }
        
        // Create default staff if not exists
        const staffCount = await Staff.count();
        if (staffCount === 0) {
            let staffPassword = 'staff123';
            if (bcrypt) {
                staffPassword = await bcrypt.hash('staff123', 10);
            }
            await Staff.create({
                username: 'staff',
                email: 'staff@ntc.com',
                password: staffPassword,
                fullName: 'Staff User',
                phone: '9841000001',
                department: 'Customer Support',
                role: 'staff',
                isActive: true
            });
            console.log('✅ Default staff user created: staff@ntc.com / staff123');
        }
        
        app.listen(PORT, () => {
            console.log(`\n🚀 Server running on http://localhost:${PORT}`);
            console.log(`📡 API: http://localhost:${PORT}/api`);
            console.log(`\n🔐 Admin Login Credentials:`);
            console.log(`   📧 Email: admin@ntc.com`);
            console.log(`   🔑 Password: admin123`);
            console.log(`\n👥 Staff Login Credentials:`);
            console.log(`   📧 Email: staff@ntc.com`);
            console.log(`   🔑 Password: staff123`);
            console.log(`\n✅ Ready to accept requests!\n`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();