const express = require('express');
const cors = require('cors');
const { sequelize, testConnection } = require('./config/database');
const Complaint = require('./models/Complaint');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// ========== API ENDPOINTS ==========

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

// Submit complaint
app.post('/api/complaints/submit', async (req, res) => {
    try {
        const { 
            name, email, phone, natureOfComplaint, description, 
            state, district, municipality, wardNo, streetAddress 
        } = req.body;
        
        console.log('Received complaint:', { name, email, phone });
        
        // Validate required fields
        if (!name || !email || !phone || !description) {
            return res.status(400).json({ 
                success: false, 
                message: 'Name, email, phone, and description are required' 
            });
        }
        
        // Generate complaint number
        const complaintNumber = `NTC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const complaintNumberNp = `एनटीसी-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const trackingPassword = Math.floor(Math.random() * 9000 + 1000).toString();
        
        // Create complaint
        const complaint = await Complaint.create({
            complaintNumber,
            complaintNumberNp,
            name,
            email,
            phone,
            natureOfComplaint: natureOfComplaint || '',
            description,
            state: state || '',
            district: district || '',
            municipality: municipality || '',
            wardNo: wardNo || '',
            streetAddress: streetAddress || '',
            trackingPassword,
            status: 'Pending',
            statusNp: 'विचाराधीन'
        });
        
        console.log('Complaint saved with ID:', complaint.id);
        
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
        console.error('Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to submit complaint',
            error: error.message 
        });
    }
});

// Get all complaints (for display)
app.get('/api/complaints', async (req, res) => {
    try {
        const complaints = await Complaint.findAll({
            order: [['createdAt', 'DESC']]
        });
        res.json({ success: true, data: complaints });
    } catch (error) {
        console.error('Error fetching complaints:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Track complaint by ID
app.get('/api/complaints/track/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { password } = req.query;
        
        const complaint = await Complaint.findOne({
            where: { complaintNumber: id }
        });
        
        if (!complaint) {
            return res.status(404).json({ 
                success: false, 
                message: 'Complaint not found' 
            });
        }
        
        if (complaint.trackingPassword !== password) {
            return res.status(403).json({ 
                success: false, 
                message: 'Invalid password' 
            });
        }
        
        res.json({ success: true, data: complaint });
    } catch (error) {
        console.error('Error tracking complaint:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ========== START SERVER ==========
const startServer = async () => {
    try {
        await testConnection();
        
        // Use force: true to recreate tables (only in development)
        await sequelize.sync({ force: true });
        console.log('✅ Database synced and tables created');
        
        app.listen(PORT, () => {
            console.log(`\n🚀 Server running on http://localhost:${PORT}`);
            console.log(`📡 API: http://localhost:${PORT}/api`);
            console.log(`✅ Ready to accept complaints!\n`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();