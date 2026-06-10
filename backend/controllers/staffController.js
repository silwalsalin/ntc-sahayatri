const Staff = require('../models/Staff');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production_2024';
const JWT_EXPIRE = '7d';

// Generate JWT Token
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, JWT_SECRET, { expiresIn: JWT_EXPIRE });
};

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

        // Find staff user from users table (since staff are stored in users table)
        const user = await new Promise((resolve, reject) => {
            db.get(
                `SELECT id, name, name_en, email, phone, password, role, status, created_at, last_login 
                 FROM users 
                 WHERE email = ? AND (role = 'staff' OR role = 'admin')`,
                [email.toLowerCase()],
                (err, row) => {
                    if (err) reject(err);
                    resolve(row);
                }
            );
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check if account is active
        if (user.status !== 'active') {
            return res.status(401).json({
                success: false,
                message: 'Your account is inactive. Please contact administrator.'
            });
        }

        // Verify password using bcrypt
        const bcrypt = require('bcryptjs');
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Update last login
        await new Promise((resolve, reject) => {
            db.run(
                `UPDATE users SET last_login = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
                [user.id],
                (err) => {
                    if (err) reject(err);
                    resolve();
                }
            );
        });

        // Generate token
        const token = generateToken(user.id, user.role);

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
            data: {
                token,
                ...userData
            }
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
        const stats = await new Promise((resolve, reject) => {
            db.get(
                `SELECT 
                    COUNT(*) as total_assigned,
                    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count,
                    SUM(CASE WHEN status = 'in-progress' THEN 1 ELSE 0 END) as in_progress_count,
                    SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved_count,
                    SUM(CASE WHEN status = 'review' THEN 1 ELSE 0 END) as review_count
                 FROM complaints 
                 WHERE assigned_to = ?`,
                [req.user.email],
                (err, row) => {
                    if (err) reject(err);
                    resolve(row || {
                        total_assigned: 0,
                        pending_count: 0,
                        in_progress_count: 0,
                        resolved_count: 0,
                        review_count: 0
                    });
                }
            );
        });
        
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
        const { limit = 50, status, search } = req.query;
        
        let sql = `SELECT * FROM complaints WHERE assigned_to = ?`;
        const params = [req.user.email];
        
        if (status && status !== 'all') {
            sql += ` AND status = ?`;
            params.push(status);
        }
        
        if (search) {
            sql += ` AND (name LIKE ? OR email LIKE ? OR phone LIKE ? OR complaint_number LIKE ?)`;
            const searchPattern = `%${search}%`;
            params.push(searchPattern, searchPattern, searchPattern, searchPattern);
        }
        
        sql += ` ORDER BY created_at DESC LIMIT ?`;
        params.push(parseInt(limit));
        
        const complaints = await new Promise((resolve, reject) => {
            db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                resolve(rows || []);
            });
        });
        
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
        const { status, resolution, feedback, satisfactionRating } = req.body;

        const validStatuses = ['pending', 'in-progress', 'resolved', 'rejected', 'closed', 'review'];
        if (!status || !validStatuses.includes(status.toLowerCase())) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Valid statuses: pending, in-progress, resolved, rejected, closed, review'
            });
        }

        const normalizedStatus = status.toLowerCase();
        
        // Check if complaint exists and is assigned to this staff
        const complaint = await new Promise((resolve, reject) => {
            db.get(
                `SELECT id, assigned_to FROM complaints WHERE id = ?`,
                [id],
                (err, row) => {
                    if (err) reject(err);
                    resolve(row);
                }
            );
        });
        
        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: 'Complaint not found'
            });
        }
        
        if (complaint.assigned_to !== req.user.email) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to update this complaint'
            });
        }
        
        let sql = `UPDATE complaints SET status = ?, updated_at = CURRENT_TIMESTAMP`;
        const params = [normalizedStatus];
        
        if (resolution) {
            sql += `, resolution = ?`;
            params.push(resolution);
        }
        
        if (feedback) {
            sql += `, staff_feedback = ?`;
            params.push(feedback);
        }
        
        if (satisfactionRating) {
            sql += `, satisfaction_rating = ?`;
            params.push(satisfactionRating);
        }
        
        if (normalizedStatus === 'resolved') {
            sql += `, resolved_at = CURRENT_TIMESTAMP`;
        }
        
        sql += ` WHERE id = ? AND assigned_to = ?`;
        params.push(id, req.user.email);
        
        await new Promise((resolve, reject) => {
            db.run(sql, params, function(err) {
                if (err) reject(err);
                if (this.changes === 0) reject(new Error('No changes made'));
                resolve();
            });
        });

        res.json({
            success: true,
            message: 'Complaint status updated successfully'
        });
    } catch (error) {
        console.error('Error updating complaint status:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to update complaint status'
        });
    }
};

// Get complaint details
const getComplaintDetails = async (req, res) => {
    try {
        const { id } = req.params;
        
        const complaint = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM complaints WHERE id = ?', [id], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: 'Complaint not found'
            });
        }
        
        // Check if complaint is assigned to this staff or they are admin
        if (complaint.assigned_to !== req.user.email && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to view this complaint'
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

// Get staff profile
const getStaffProfile = async (req, res) => {
    try {
        const staff = await new Promise((resolve, reject) => {
            db.get(
                `SELECT id, name, name_en, email, phone, role, status, created_at, last_login 
                 FROM users 
                 WHERE id = ? AND (role = 'staff' OR role = 'admin')`,
                [req.user.id],
                (err, row) => {
                    if (err) reject(err);
                    resolve(row);
                }
            );
        });
        
        if (!staff) {
            return res.status(404).json({
                success: false,
                message: 'Staff not found'
            });
        }
        
        res.json({
            success: true,
            data: staff
        });
    } catch (error) {
        console.error('Error getting staff profile:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch profile'
        });
    }
};

// Update staff profile
const updateStaffProfile = async (req, res) => {
    try {
        const { name, nameEn, phone } = req.body;
        
        await new Promise((resolve, reject) => {
            db.run(
                `UPDATE users SET name = ?, name_en = ?, phone = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
                [name, nameEn, phone, req.user.id],
                function(err) {
                    if (err) reject(err);
                    if (this.changes === 0) reject(new Error('No changes made'));
                    resolve();
                }
            );
        });
        
        res.json({
            success: true,
            message: 'Profile updated successfully'
        });
    } catch (error) {
        console.error('Error updating staff profile:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update profile'
        });
    }
};

// Change staff password
const changeStaffPassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current password and new password are required'
            });
        }
        
        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 6 characters long'
            });
        }
        
        // Get current user with password
        const user = await new Promise((resolve, reject) => {
            db.get(
                `SELECT password FROM users WHERE id = ?`,
                [req.user.id],
                (err, row) => {
                    if (err) reject(err);
                    resolve(row);
                }
            );
        });
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        const bcrypt = require('bcryptjs');
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }
        
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        await new Promise((resolve, reject) => {
            db.run(
                `UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
                [hashedPassword, req.user.id],
                function(err) {
                    if (err) reject(err);
                    if (this.changes === 0) reject(new Error('No changes made'));
                    resolve();
                }
            );
        });
        
        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Error changing staff password:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to change password'
        });
    }
};

module.exports = {
    staffLogin,
    getStaffStats,
    getAssignedComplaints,
    updateComplaintStatus,
    getComplaintDetails,
    getStaffProfile,
    updateStaffProfile,
    changeStaffPassword
};