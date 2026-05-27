// backend/server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());                    // Allow React to connect
app.use(express.json());            // Parse JSON requests
app.use(express.urlencoded({ extended: true }));

// Sample data
const complaints = [
    {
        id: 1,
        name: "राम बहादुर",
        complaint: "इन्टरनेट जडान समस्या",
        status: "प्रगतिमा",
        date: "२०८०-०१-१५"
    }
];

// API Routes

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'UP', 
        message: 'Backend is running on Node.js!',
        timestamp: new Date().toISOString()
    });
});

// Get all complaints
app.get('/api/complaints', (req, res) => {
    res.json(complaints);
});

// Get single complaint
app.get('/api/complaints/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const complaint = complaints.find(c => c.id === id);
    
    if (!complaint) {
        return res.status(404).json({ error: 'Complaint not found' });
    }
    
    res.json(complaint);
});

// Submit new complaint
app.post('/api/complaints', (req, res) => {
    const { name, complaint } = req.body;
    
    if (!name || !complaint) {
        return res.status(400).json({ error: 'Name and complaint are required' });
    }
    
    const newComplaint = {
        id: complaints.length + 1,
        name: name,
        complaint: complaint,
        status: 'Pending',
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString()
    };
    
    complaints.push(newComplaint);
    res.status(201).json(newComplaint);
});

// Landing page data
app.get('/api/landing', (req, res) => {
    res.json({
        message: 'Welcome to NTC Complaint System',
        status: 'success',
        version: '1.0.0',
        features: ['Submit Complaint', 'Track Complaint', '24/7 Support']
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`✅ Backend server running on http://localhost:${PORT}`);
    console.log(`📡 API available at http://localhost:${PORT}/api`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});