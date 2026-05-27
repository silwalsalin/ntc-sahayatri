// backend/server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { sequelize, Complaint, User, syncDatabase } = require('./models');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize database
const initializeDatabase = async () => {
    try {
        await syncDatabase(false);
        console.log('✅ Database connected and synced');
    } catch (error) {
        console.error('❌ Database connection failed:', error);
    }
};

// ========== API ROUTES ==========

// Health check
app.get('/api/health', async (req, res) => {
    try {
        await sequelize.authenticate();
        res.json({
            status: 'UP',
            database: 'Connected',
            message: 'Backend is running with MySQL!',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            status: 'DOWN',
            database: 'Disconnected',
            error: error.message
        });
    }
});

// Get all complaints with filters
app.get('/api/complaints', async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;
        
        const where = {};
        if (status) where.status = status;
        
        const complaints = await Complaint.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['submittedDate', 'DESC']]
        });
        
        res.json({
            total: complaints.count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(complaints.count / limit),
            data: complaints.rows
        });
    } catch (error) {
        console.error('Error fetching complaints:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get single complaint
app.get('/api/complaints/:id', async (req, res) => {
    try {
        const complaint = await Complaint.findByPk(req.params.id);
        
        if (!complaint) {
            return res.status(404).json({ error: 'Complaint not found' });
        }
        
        res.json(complaint);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Submit new complaint
app.post('/api/complaints', async (req, res) => {
    try {
        const { name, nameEn, complaint, complaintEn, phoneNumber, email, category } = req.body;
        
        // Validate required fields
        if (!name || !complaint) {
            return res.status(400).json({ error: 'Name and complaint are required' });
        }
        
        // Generate complaint number
        const complaintNumber = `NTC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        
        const newComplaint = await Complaint.create({
            complaintNumber,
            name,
            nameEn: nameEn || name,
            complaint,
            complaintEn: complaintEn || complaint,
            phoneNumber,
            email,
            category: category || 'General',
            status: 'Pending',
            statusNp: 'विचाराधीन',
            submittedDate: new Date()
        });
        
        res.status(201).json({
            success: true,
            message: 'Complaint submitted successfully',
            data: newComplaint
        });
    } catch (error) {
        console.error('Error submitting complaint:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update complaint status
app.put('/api/complaints/:id', async (req, res) => {
    try {
        const complaint = await Complaint.findByPk(req.params.id);
        
        if (!complaint) {
            return res.status(404).json({ error: 'Complaint not found' });
        }
        
        const { status, resolution, assignedTo } = req.body;
        
        // Update status
        if (status) {
            complaint.status = status;
            complaint.statusNp = getStatusNepali(status);
        }
        if (resolution) complaint.resolution = resolution;
        if (assignedTo) complaint.assignedTo = assignedTo;
        
        // Set resolved date if status is Resolved
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
        res.status(500).json({ error: error.message });
    }
});

// Delete complaint
app.delete('/api/complaints/:id', async (req, res) => {
    try {
        const complaint = await Complaint.findByPk(req.params.id);
        
        if (!complaint) {
            return res.status(404).json({ error: 'Complaint not found' });
        }
        
        await complaint.destroy();
        res.json({ success: true, message: 'Complaint deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get statistics
app.get('/api/statistics', async (req, res) => {
    try {
        const total = await Complaint.count();
        const pending = await Complaint.count({ where: { status: 'Pending' } });
        const inProgress = await Complaint.count({ where: { status: 'In Progress' } });
        const resolved = await Complaint.count({ where: { status: 'Resolved' } });
        
        // Get last 30 days complaints
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const recentComplaints = await Complaint.count({
            where: {
                submittedDate: { [Op.gte]: thirtyDaysAgo }
            }
        });
        
        res.json({
            total,
            pending,
            inProgress,
            resolved,
            recentComplaints,
            resolutionRate: total > 0 ? ((resolved / total) * 100).toFixed(2) : 0
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Landing page data
app.get('/api/landing', async (req, res) => {
    try {
        const recentComplaints = await Complaint.findAll({
            limit: 5,
            order: [['submittedDate', 'DESC']],
            attributes: ['id', 'name', 'complaint', 'status', 'submittedDate']
        });
        
        const stats = {
            total: await Complaint.count(),
            resolved: await Complaint.count({ where: { status: 'Resolved' } }),
            pending: await Complaint.count({ where: { status: 'Pending' } })
        };
        
        res.json({
            message: 'Welcome to NTC Complaint System',
            status: 'success',
            version: '1.0.0',
            statistics: stats,
            recentComplaints
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Helper function
function getStatusNepali(status) {
    const statusMap = {
        'Pending': 'विचाराधीन',
        'In Progress': 'प्रगतिमा',
        'Resolved': 'समाधान भयो',
        'Closed': 'बन्द',
        'Rejected': 'अस्वीकृत'
    };
    return statusMap[status] || 'विचाराधीन';
}

// Start server
initializeDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`✅ Backend server running on http://localhost:${PORT}`);
        console.log(`📡 API available at http://localhost:${PORT}/api`);
        console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
    });
});