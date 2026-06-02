// backend/server.js
const express = require('express');
const cors = require('cors');
const { Op } = require('sequelize');
const { sequelize, testConnection } = require('./config/database');
const { syncDatabase } = require('./models');
const Complaint = require('./models/Complaint');
const Admin = require('./models/Admin');

// Create Express app FIRST - THIS MUST BE AT THE TOP
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
        
        if (admin.password !== password) {
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
                role: admin.role
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

// ========== START SERVER ==========
const startServer = async () => {
    try {
        await testConnection();
        await syncDatabase();
        
        app.listen(PORT, () => {
            console.log(`\n🚀 Server running on http://localhost:${PORT}`);
            console.log(`📡 API: http://localhost:${PORT}/api`);
            console.log(`\n🔐 Admin Login Credentials:`);
            console.log(`   📧 Email: admin@ntc.com`);
            console.log(`   🔑 Password: admin123`);
            console.log(`\n✅ Ready to accept requests!\n`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();