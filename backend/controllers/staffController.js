const Staff = require('../models/Staff');
const jwt = require('jsonwebtoken');

// Staff Login
const staffLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Find staff user
        const user = await Staff.findByEmail(email);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check if user is staff or admin
        if (user.role !== 'staff' && user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Staff access required.'
            });
        }

        // Check if account is active
        if (user.status !== 'active') {
            return res.status(401).json({
                success: false,
                message: 'Your account is inactive. Please contact administrator.'
            });
        }

        // Verify password
        const isPasswordValid = await Staff.verifyPassword(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Update last login
        await Staff.updateLastLogin(user.id);

        // Generate token
        const token = Staff.generateToken(user);

        // Return user data (excluding password)
        const userData = {
            id: user.id,
            name: user.name,
            nameEn: user.name_en,
            email: user.email,
            phone: user.phone,
            role: user.role,
            status: user.status,
            createdAt: user.created_at,
            lastLogin: user.last_login
        };

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: userData
        });

    } catch (error) {
        console.error('Staff login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// Get staff dashboard statistics
const getStaffStats = async (req, res) => {
    try {
        const stats = await Staff.getStaffStats(req.user.email);
        
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error getting staff stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch statistics'
        });
    }
};

// Get assigned complaints for staff
const getAssignedComplaints = async (req, res) => {
    try {
        const complaints = await Staff.getAssignedComplaints(req.user.email);
        
        res.json({
            success: true,
            data: complaints
        });
    } catch (error) {
        console.error('Error getting assigned complaints:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch complaints'
        });
    }
};

// Update complaint status
const updateComplaintStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, feedback, satisfactionRating } = req.body;

        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Status is required'
            });
        }

        await Staff.updateComplaintStatus(id, status, feedback, satisfactionRating);

        res.json({
            success: true,
            message: 'Complaint status updated successfully'
        });
    } catch (error) {
        console.error('Error updating complaint status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update complaint status'
        });
    }
};

// Get complaint details
const getComplaintDetails = async (req, res) => {
    try {
        const { id } = req.params;
        
        const complaint = await new Promise((resolve, reject) => {
            const db = require('../config/database');
            db.get('SELECT * FROM complaints WHERE id = ?', [id], (err, result) => {
                if (err) reject(err);
                resolve(result);
            });
        });

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: 'Complaint not found'
            });
        }

        res.json({
            success: true,
            data: complaint
        });
    } catch (error) {
        console.error('Error getting complaint details:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch complaint details'
        });
    }
};

module.exports = {
    staffLogin,
    getStaffStats,
    getAssignedComplaints,
    updateComplaintStatus,
    getComplaintDetails
};