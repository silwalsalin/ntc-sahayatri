// backend/server.js
const express = require('express');
const cors = require('cors');
const { sequelize, testConnection } = require('./config/database');
const Complaint = require('./models/Complaint');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========== HEALTH CHECK ENDPOINT ==========
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

// ========== SUBMIT COMPLAINT (Handles both types) ==========
app.post('/api/complaints/submit', async (req, res) => {
    try {
        const {
            natureOfComplaint,
            name,
            description,
            email,
            phone,
            // General complaint fields
            state,
            district,
            municipality,
            wardNo,
            streetAddress,
            // ComplaintRegarding fields
            subject,
            priority,
            address,
            landmark,
            preferredContact,
            referenceNumber,
            complaintCategory
        } = req.body;
        
        console.log('📝 Received complaint:', { name, email, phone, complaintCategory });
        
        // Validate required fields
        if (!name || !phone || !description) {
            return res.status(400).json({ 
                success: false, 
                message: 'Name, phone, and description are required' 
            });
        }
        
        // Generate complaint number
        const timestamp = Date.now();
        const randomNum = Math.floor(Math.random() * 1000);
        const complaintNumber = `NTC-${timestamp}-${randomNum}`;
        const complaintNumberNp = `एनटीसी-${timestamp}-${randomNum}`;
        
        // Generate tracking password
        const trackingPassword = Math.floor(Math.random() * 9000 + 1000).toString();
        
        // Prepare data based on complaint type
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
        
        // Add type-specific fields
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
        
        // Create complaint in database
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
        console.error('Error fetching complaints:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ========== GET SINGLE COMPLAINT ==========
app.get('/api/complaints/:id', async (req, res) => {
    try {
        const complaint = await Complaint.findByPk(req.params.id);
        
        if (!complaint) {
            return res.status(404).json({ success: false, error: 'Complaint not found' });
        }
        
        res.json({ success: true, data: complaint });
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
        
        // Try to find by ID or complaint number
        if (!isNaN(id)) {
            complaint = await Complaint.findByPk(parseInt(id));
        } else {
            complaint = await Complaint.findOne({ 
                where: { complaintNumber: id } 
            });
        }
        
        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: 'Complaint not found'
            });
        }
        
        // Verify password
        if (password && complaint.trackingPassword !== password) {
            return res.status(403).json({
                success: false,
                message: 'Invalid tracking password'
            });
        }
        
        res.json({
            success: true,
            data: complaint
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
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
        
        res.json({
            success: true,
            message: 'Complaint updated successfully',
            data: complaint
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ========== GET COMPLAINTS BY CATEGORY ==========
app.get('/api/complaints/category/:category', async (req, res) => {
    try {
        const { category } = req.params;
        const complaints = await Complaint.findAll({
            where: { complaintCategory: category },
            order: [['submittedDate', 'DESC']]
        });
        res.json({ success: true, data: complaints });
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
        const generalComplaints = await Complaint.count({ where: { complaintCategory: 'general' } });
        const regardingComplaints = await Complaint.count({ where: { complaintCategory: 'complaint_regarding' } });
        
        res.json({
            success: true,
            total,
            pending,
            inProgress,
            resolved,
            generalComplaints,
            regardingComplaints,
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
        const { username, password } = req.body;
        
        console.log('📝 Admin login attempt:', username);
        
        // Validate input
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username and password are required'
            });
        }
        
        // Hardcoded admin credentials (you can replace with database check)
        const admins = [
            {
                id: 1,
                username: 'admin@ntc',
                email: 'admin@ntc.com',
                password: 'admin123',
                fullName: 'System Administrator',
                role: 'super_admin'
            },
            {
                id: 2,
                username: 'support@ntc',
                email: 'support@ntc.com',
                password: 'support123',
                fullName: 'Support Staff',
                role: 'support'
            },
            {
                id: 3,
                username: 'viewer@ntc',
                email: 'viewer@ntc.com',
                password: 'viewer123',
                fullName: 'Viewer',
                role: 'viewer'
            }
        ];
        
        // Find admin
        const admin = admins.find(a => a.username === username || a.email === username);
        
        if (admin && admin.password === password) {
            // Generate simple token
            const token = Buffer.from(`${admin.username}-${Date.now()}`).toString('base64');
            
            console.log('✅ Admin login successful:', username);
            
            res.json({
                success: true,
                message: 'Login successful',
                token: token,
                user: {
                    id: admin.id,
                    username: admin.username,
                    fullName: admin.fullName,
                    email: admin.email,
                    role: admin.role
                }
            });
        } else {
            console.log('❌ Admin login failed:', username);
            res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            });
        }
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed. Please try again.'
        });
    }
});

// Verify Admin Token endpoint
app.get('/api/admin/verify', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }
        
        // Verify token (simplified - just check if it exists)
        res.json({
            success: true,
            message: 'Token valid',
            valid: true
        });
        
    } catch (error) {
        console.error('Token verification error:', error);
        res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
});

// Admin Logout endpoint
app.post('/api/admin/logout', async (req, res) => {
    try {
        res.json({
            success: true,
            message: 'Logout successful'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Logout failed'
        });
    }
});

// Get admin profile
app.get('/api/admin/profile', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }
        
        // Decode token to get user (simplified)
        // In production, you should use JWT and verify properly
        res.json({
            success: true,
            data: {
                id: 1,
                username: 'admin@ntc',
                fullName: 'System Administrator',
                email: 'admin@ntc.com',
                role: 'admin'
            }
        });
        
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch profile'
        });
    }
});

// Get all admins (super admin only)
app.get('/api/admin/users', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }
        
        // Return list of admins (without passwords)
        const adminsList = [
            {
                id: 1,
                username: 'admin@ntc',
                email: 'admin@ntc.com',
                fullName: 'System Administrator',
                role: 'super_admin',
                status: 'active',
                lastLogin: '2024-01-15T10:30:00Z'
            },
            {
                id: 2,
                username: 'support@ntc',
                email: 'support@ntc.com',
                fullName: 'Support Staff',
                role: 'support',
                status: 'active',
                lastLogin: '2024-01-14T15:45:00Z'
            },
            {
                id: 3,
                username: 'viewer@ntc',
                email: 'viewer@ntc.com',
                fullName: 'Viewer',
                role: 'viewer',
                status: 'inactive',
                lastLogin: '2024-01-10T09:00:00Z'
            }
        ];
        
        res.json({
            success: true,
            data: adminsList
        });
        
    } catch (error) {
        console.error('Fetch admins error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch admins'
        });
    }
});

// Create new admin (super admin only)
app.post('/api/admin/users', async (req, res) => {
    try {
        const { username, email, password, fullName, role } = req.body;
        
        if (!username || !email || !password || !fullName) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }
        
        // Here you would save to database
        console.log('📝 Creating new admin:', username);
        
        res.json({
            success: true,
            message: 'Admin created successfully',
            data: {
                id: Date.now(),
                username,
                email,
                fullName,
                role: role || 'viewer'
            }
        });
        
    } catch (error) {
        console.error('Create admin error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create admin'
        });
    }
});

// Update admin status (super admin only)
app.put('/api/admin/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, role } = req.body;
        
        console.log('📝 Updating admin:', id, { status, role });
        
        res.json({
            success: true,
            message: 'Admin updated successfully'
        });
        
    } catch (error) {
        console.error('Update admin error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update admin'
        });
    }
});

// Delete admin (super admin only)
app.delete('/api/admin/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        console.log('📝 Deleting admin:', id);
        
        res.json({
            success: true,
            message: 'Admin deleted successfully'
        });
        
    } catch (error) {
        console.error('Delete admin error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete admin'
        });
    }
});

// Change password
app.post('/api/admin/change-password', async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }
        
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current password and new password are required'
            });
        }
        
        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 6 characters'
            });
        }
        
        // Here you would update password in database
        console.log('📝 Password change request');
        
        res.json({
            success: true,
            message: 'Password changed successfully'
        });
        
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to change password'
        });
    }
});

// ========== START SERVER ==========
const startServer = async () => {
    try {
        await testConnection();
        
        // Sync database (force: false to preserve existing data)
        await sequelize.sync({ alter: true });
        console.log('✅ Database synced and tables ready');
        
        app.listen(PORT, () => {
            console.log(`\n🚀 Server running on http://localhost:${PORT}`);
            console.log(`📡 API: http://localhost:${PORT}/api`);
            console.log(`\n🔐 Admin Credentials:`);
            console.log(`   📧 Super Admin: admin@ntc / admin123`);
            console.log(`   📧 Support Staff: support@ntc / support123`);
            console.log(`   📧 Viewer: viewer@ntc / viewer123`);
            console.log(`\n✅ Ready to accept complaints!\n`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();