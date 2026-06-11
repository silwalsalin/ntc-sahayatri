// backend/server.js
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const { db, generateComplaintNumber, generateComplaintNumberNp, generateTrackingPassword, initDatabase } = require('./database/db');

const app = express();
const PORT = process.env.PORT || 5000;

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production_2024';
const JWT_EXPIRE = '7d';

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003', 'http://localhost:3004'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'application/pdf',
            'image/jpeg',
            'image/png',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF, JPG, PNG, DOC files are allowed.'));
        }
    }
});

// Serve static files
app.use('/uploads', express.static(uploadDir));

// ==================== AUTHENTICATION MIDDLEWARE ====================

// Generate JWT Token
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, JWT_SECRET, { expiresIn: JWT_EXPIRE });
};

// Verify Token middleware
const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
};

// Protect middleware - For routes that require authentication
const protect = (req, res, next) => {
    if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer')) {
        return res.status(401).json({
            success: false,
            message: 'No token provided. Please login.',
            code: 'NO_TOKEN'
        });
    }

    const token = req.headers.authorization.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'No token provided. Please login.',
            code: 'NO_TOKEN'
        });
    }

    const decoded = verifyToken(token);

    if (!decoded) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token. Please login again.',
            code: 'TOKEN_EXPIRED'
        });
    }

    db.get(
        `SELECT id, name, name_en, email, phone, role, status FROM users WHERE id = ?`,
        [decoded.id],
        (err, user) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Database error' });
            }
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found. Please login again.',
                    code: 'USER_NOT_FOUND'
                });
            }
            if (user.status !== 'active') {
                return res.status(401).json({
                    success: false,
                    message: `Your account is ${user.status}. Please contact admin.`,
                    code: 'ACCOUNT_INACTIVE'
                });
            }
            req.user = user;
            next();
        }
    );
};

// Admin only middleware
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({
            success: false,
            message: 'Access denied. Admin only.'
        });
    }
};

// Staff or Admin middleware
const staffOrAdmin = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'staff')) {
        next();
    } else {
        res.status(403).json({
            success: false,
            message: 'Access denied. Staff or Admin only.'
        });
    }
};

// ==================== HEALTH CHECK ====================
app.get('/api/health', (req, res) => {
    res.json({ success: true, status: 'OK', timestamp: new Date().toISOString() });
});

// ==================== PUBLIC ROUTES (No Authentication Required) ====================

// GET /api/complaints/public
app.get('/api/complaints/public', (req, res) => {
    try {
        const { limit = 20, status, sort = 'desc' } = req.query;
        let sql = `SELECT id, complaint_number, name, email, phone, description, status, priority, created_at, nature_of_complaint FROM complaints WHERE 1=1`;
        const params = [];

        if (status && status !== 'all') {
            sql += ` AND status = ?`;
            params.push(status);
        }

        sql += ` ORDER BY created_at ${sort === 'desc' ? 'DESC' : 'ASC'} LIMIT ?`;
        params.push(parseInt(limit));

        db.all(sql, params, (err, rows) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ success: false, error: err.message });
            }
            res.json({ success: true, data: rows || [], count: rows?.length || 0 });
        });
    } catch (error) {
        console.error('Error fetching public complaints:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/complaints/regarding/public
app.get('/api/complaints/regarding/public', (req, res) => {
    try {
        const { limit = 20, status, sort = 'desc' } = req.query;
        let sql = `SELECT id, complaint_number, name, email, phone, description, subject, complaint_type, status, priority, created_at, reference_number, address, landmark, preferred_contact FROM complaint_regarding WHERE 1=1`;
        const params = [];

        if (status && status !== 'all') {
            sql += ` AND status = ?`;
            params.push(status);
        }

        sql += ` ORDER BY created_at ${sort === 'desc' ? 'DESC' : 'ASC'} LIMIT ?`;
        params.push(parseInt(limit));

        db.all(sql, params, (err, rows) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ success: false, error: err.message });
            }
            res.json({ success: true, data: rows || [], count: rows?.length || 0 });
        });
    } catch (error) {
        console.error('Error fetching public complaint regardings:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/complaints - Submit new complaint (public)
app.post('/api/complaints', upload.single('attachment'), (req, res) => {
    try {
        const { natureOfComplaint, name, email, phone, state, district, municipality, wardNo, streetAddress, description, priority } = req.body;

        const complaintNumber = generateComplaintNumber();
        const complaintNumberNp = generateComplaintNumberNp();
        const trackingPassword = generateTrackingPassword();

        const sql = `INSERT INTO complaints (complaint_number, complaint_number_np, tracking_password, nature_of_complaint, name, email, phone, state, district, municipality, ward_no, street_address, description, priority, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        db.run(sql, [complaintNumber, complaintNumberNp, trackingPassword, natureOfComplaint, name, email, phone, state, district, municipality, wardNo, streetAddress, description, priority || 'medium', 'pending'], function(err) {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ success: false, error: err.message });
            }
            res.status(201).json({
                success: true,
                data: { id: this.lastID, complaintNumber, complaintNumberNp, trackingPassword },
                message: 'Complaint submitted successfully'
            });
        });
    } catch (error) {
        console.error('Error submitting complaint:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/complaint-regarding - Submit new complaint regarding (public)
app.post('/api/complaint-regarding', upload.array('attachments', 5), (req, res) => {
    try {
        const { complaintType, subject, description, priority, name, email, phone, address, landmark, preferredContact, referenceNumber } = req.body;

        const complaintNumber = generateComplaintNumber();
        const complaintNumberNp = generateComplaintNumberNp();
        const trackingPassword = generateTrackingPassword();

        const sql = `INSERT INTO complaint_regarding (complaint_number, complaint_number_np, tracking_password, complaint_type, subject, description, priority, name, email, phone, address, landmark, preferred_contact, reference_number, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        db.run(sql, [complaintNumber, complaintNumberNp, trackingPassword, complaintType, subject, description, priority || 'medium', name, email || null, phone, address || null, landmark || null, preferredContact || 'phone', referenceNumber || null, 'pending'], function(err) {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ success: false, error: err.message });
            }

            const complaintId = this.lastID;
            const files = req.files || [];

            if (files.length > 0) {
                files.forEach(file => {
                    const attachSql = `INSERT INTO complaint_regarding_attachments (complaint_id, filename, original_name, file_path, file_size, mime_type) VALUES (?, ?, ?, ?, ?, ?)`;
                    db.run(attachSql, [complaintId, file.filename, file.originalname, file.path, file.size, file.mimetype]);
                });
            }

            res.status(201).json({
                success: true,
                data: { id: complaintId, complaintNumber, complaintNumberNp, trackingPassword },
                message: 'Complaint submitted successfully'
            });
        });
    } catch (error) {
        console.error('Error submitting complaint regarding:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/complaints/track - Track complaint (public)
app.post('/api/complaints/track', (req, res) => {
    try {
        const { complaintNumber, password } = req.body;

        if (!complaintNumber || !password) {
            return res.status(400).json({ success: false, message: 'Complaint number and password are required' });
        }

        db.get(`SELECT * FROM complaints WHERE complaint_number = ? AND tracking_password = ?`, [complaintNumber, password], (err, row) => {
            if (err) {
                return res.status(500).json({ success: false, error: err.message });
            }
            if (!row) {
                return res.status(404).json({ success: false, message: 'Invalid complaint number or password' });
            }
            delete row.tracking_password;
            res.json({ success: true, data: row });
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==================== AUTHENTICATION ROUTES ====================

// POST /api/auth/login - Unified login for both admin and staff
app.post('/api/auth/login', (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email and password' });
        }

        db.get(`SELECT * FROM users WHERE email = ?`, [email.toLowerCase()], async (err, user) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ success: false, message: 'Database error' });
            }

            if (!user) {
                return res.status(401).json({ success: false, message: 'Invalid email or password' });
            }

            const isPasswordMatch = await bcrypt.compare(password, user.password);

            if (!isPasswordMatch) {
                return res.status(401).json({ success: false, message: 'Invalid email or password' });
            }

            if (user.status !== 'active') {
                return res.status(401).json({ success: false, message: `Your account is ${user.status}. Please contact admin.` });
            }

            db.run(`UPDATE users SET last_login = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [user.id]);

            const token = generateToken(user.id, user.role);

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
                    ...userData,
                    token
                }
            });
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Server error during login' });
    }
});

// POST /api/auth/logout
app.post('/api/auth/logout', (req, res) => {
    res.json({ success: true, message: 'Logged out successfully' });
});

// GET /api/auth/me
app.get('/api/auth/me', protect, (req, res) => {
    res.json({ success: true, data: req.user });
});

// POST /api/auth/refresh
app.post('/api/auth/refresh', protect, (req, res) => {
    try {
        const newToken = generateToken(req.user.id, req.user.role);
        res.json({
            success: true,
            token: newToken,
            message: 'Token refreshed successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to refresh token' });
    }
});

// ==================== ADMIN & STAFF COMPLAINTS API ====================

// GET /api/complaints - Get all regular complaints (staff/admin)
app.get('/api/complaints', protect, staffOrAdmin, (req, res) => {
    try {
        const { limit = 100, status, category, search } = req.query;
        let sql = `SELECT * FROM complaints WHERE 1=1`;
        const params = [];

        if (status && status !== 'all') {
            sql += ` AND status = ?`;
            params.push(status);
        }

        if (category && category !== 'all') {
            sql += ` AND nature_of_complaint = ?`;
            params.push(category);
        }

        if (search) {
            sql += ` AND (name LIKE ? OR email LIKE ? OR phone LIKE ? OR complaint_number LIKE ?)`;
            const searchPattern = `%${search}%`;
            params.push(searchPattern, searchPattern, searchPattern, searchPattern);
        }

        sql += ` ORDER BY created_at DESC`;

        if (limit && limit !== 'all') {
            sql += ` LIMIT ?`;
            params.push(parseInt(limit));
        }

        db.all(sql, params, (err, rows) => {
            if (err) {
                return res.status(500).json({ success: false, error: err.message });
            }
            res.json({ success: true, data: rows || [] });
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/complaint-regarding - Get all complaint regardings (staff/admin)
app.get('/api/complaint-regarding', protect, staffOrAdmin, (req, res) => {
    try {
        const { limit = 100, status, category, search } = req.query;
        let sql = `SELECT * FROM complaint_regarding WHERE 1=1`;
        const params = [];

        if (status && status !== 'all') {
            sql += ` AND status = ?`;
            params.push(status);
        }

        if (category && category !== 'all') {
            sql += ` AND complaint_type = ?`;
            params.push(category);
        }

        if (search) {
            sql += ` AND (name LIKE ? OR email LIKE ? OR phone LIKE ? OR complaint_number LIKE ? OR subject LIKE ?)`;
            const searchPattern = `%${search}%`;
            params.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
        }

        sql += ` ORDER BY created_at DESC`;

        if (limit && limit !== 'all') {
            sql += ` LIMIT ?`;
            params.push(parseInt(limit));
        }

        db.all(sql, params, (err, rows) => {
            if (err) {
                return res.status(500).json({ success: false, error: err.message });
            }
            res.json({ success: true, data: rows || [] });
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/complaints/assigned-to-me - Get complaints assigned to current staff
app.get('/api/complaints/assigned-to-me', protect, staffOrAdmin, (req, res) => {
    try {
        const { limit = 100, status, search } = req.query;
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

        sql += ` ORDER BY created_at DESC`;

        if (limit && limit !== 'all') {
            sql += ` LIMIT ?`;
            params.push(parseInt(limit));
        }

        db.all(sql, params, (err, rows) => {
            if (err) {
                return res.status(500).json({ success: false, error: err.message });
            }
            res.json({ success: true, data: rows || [] });
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/complaint-regarding/assigned-to-me - Get complaint regarding assigned to current staff
app.get('/api/complaint-regarding/assigned-to-me', protect, staffOrAdmin, (req, res) => {
    try {
        const { limit = 100, status, search } = req.query;
        let sql = `SELECT * FROM complaint_regarding WHERE assigned_to = ?`;
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

        sql += ` ORDER BY created_at DESC`;

        if (limit && limit !== 'all') {
            sql += ` LIMIT ?`;
            params.push(parseInt(limit));
        }

        db.all(sql, params, (err, rows) => {
            if (err) {
                return res.status(500).json({ success: false, error: err.message });
            }
            res.json({ success: true, data: rows || [] });
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// PATCH /api/admin/complaints/:id/status - Update regular complaint status (staff/admin)
app.patch('/api/admin/complaints/:id/status', protect, staffOrAdmin, (req, res) => {
    try {
        const { status, resolution } = req.body;

        const validStatuses = ['pending', 'in-progress', 'resolved', 'rejected', 'closed', 'review'];
        if (!status || !validStatuses.includes(status.toLowerCase())) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Valid statuses: pending, in-progress, resolved, rejected, closed, review'
            });
        }

        const normalizedStatus = status.toLowerCase();

        db.get(`SELECT id, assigned_to FROM complaints WHERE id = ?`, [req.params.id], (err, complaint) => {
            if (err) {
                return res.status(500).json({ success: false, error: err.message });
            }
            if (!complaint) {
                return res.status(404).json({ success: false, message: 'Complaint not found' });
            }

            if (complaint.assigned_to !== req.user.email && req.user.role !== 'admin') {
                return res.status(403).json({ success: false, message: 'You are not authorized to update this complaint' });
            }

            let sql = `UPDATE complaints SET status = ?, updated_at = CURRENT_TIMESTAMP`;
            const params = [normalizedStatus];

            if (resolution) {
                sql += `, resolution = ?`;
                params.push(resolution);
            }

            if (normalizedStatus === 'resolved') {
                sql += `, resolved_at = CURRENT_TIMESTAMP`;
            }

            sql += ` WHERE id = ?`;
            params.push(req.params.id);

            db.run(sql, params, function(err) {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ success: false, error: err.message });
                }

                if (this.changes === 0) {
                    return res.status(404).json({ success: false, message: 'Complaint not found or no changes made' });
                }

                res.json({
                    success: true,
                    message: `Complaint status updated to ${normalizedStatus}`
                });
            });
        });
    } catch (error) {
        console.error('Error updating complaint status:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// PATCH /api/admin/complaint-regarding/:id/status - Update complaint regarding status (staff/admin)
app.patch('/api/admin/complaint-regarding/:id/status', protect, staffOrAdmin, (req, res) => {
    try {
        const { status, resolution } = req.body;

        const validStatuses = ['pending', 'in-progress', 'resolved', 'rejected', 'closed', 'review'];
        if (!status || !validStatuses.includes(status.toLowerCase())) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Valid statuses: pending, in-progress, resolved, rejected, closed, review'
            });
        }

        const normalizedStatus = status.toLowerCase();

        db.get(`SELECT id, assigned_to FROM complaint_regarding WHERE id = ?`, [req.params.id], (err, complaint) => {
            if (err) {
                return res.status(500).json({ success: false, error: err.message });
            }
            if (!complaint) {
                return res.status(404).json({ success: false, message: 'Complaint not found' });
            }

            if (complaint.assigned_to !== req.user.email && req.user.role !== 'admin') {
                return res.status(403).json({ success: false, message: 'You are not authorized to update this complaint' });
            }

            let sql = `UPDATE complaint_regarding SET status = ?, updated_at = CURRENT_TIMESTAMP`;
            const params = [normalizedStatus];

            if (resolution) {
                sql += `, resolution = ?`;
                params.push(resolution);
            }

            if (normalizedStatus === 'resolved') {
                sql += `, resolved_at = CURRENT_TIMESTAMP`;
            }

            sql += ` WHERE id = ?`;
            params.push(req.params.id);

            db.run(sql, params, function(err) {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ success: false, error: err.message });
                }

                if (this.changes === 0) {
                    return res.status(404).json({ success: false, message: 'Complaint not found or no changes made' });
                }

                res.json({
                    success: true,
                    message: `Complaint regarding status updated to ${normalizedStatus}`
                });
            });
        });
    } catch (error) {
        console.error('Error updating complaint regarding status:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==================== STAFF ASSIGNMENT ROUTES ====================

// PATCH /api/admin/complaints/:id/assign - Assign complaint to staff
app.patch('/api/admin/complaints/:id/assign', protect, adminOnly, (req, res) => {
    try {
        const { assignedTo, assignedById } = req.body;
        
        if (!assignedTo) {
            return res.status(400).json({
                success: false,
                message: 'Please specify staff to assign'
            });
        }
        
        db.get(`SELECT id, assigned_to FROM complaints WHERE id = ?`, [req.params.id], (err, complaint) => {
            if (err) {
                return res.status(500).json({ success: false, error: err.message });
            }
            if (!complaint) {
                return res.status(404).json({ success: false, message: 'Complaint not found' });
            }
            
            db.run(
                `UPDATE complaints SET assigned_to = ?, assigned_by = ?, assigned_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
                [assignedTo, assignedById || req.user.id, req.params.id],
                function(err) {
                    if (err) {
                        console.error('Database error:', err);
                        return res.status(500).json({ success: false, error: err.message });
                    }
                    
                    res.json({
                        success: true,
                        message: 'Complaint assigned successfully'
                    });
                }
            );
        });
    } catch (error) {
        console.error('Error assigning complaint:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// PATCH /api/admin/complaint-regarding/:id/assign - Assign complaint regarding to staff
app.patch('/api/admin/complaint-regarding/:id/assign', protect, adminOnly, (req, res) => {
    try {
        const { assignedTo, assignedById } = req.body;
        
        if (!assignedTo) {
            return res.status(400).json({
                success: false,
                message: 'Please specify staff to assign'
            });
        }
        
        db.get(`SELECT id, assigned_to FROM complaint_regarding WHERE id = ?`, [req.params.id], (err, complaint) => {
            if (err) {
                return res.status(500).json({ success: false, error: err.message });
            }
            if (!complaint) {
                return res.status(404).json({ success: false, message: 'Complaint not found' });
            }
            
            db.run(
                `UPDATE complaint_regarding SET assigned_to = ?, assigned_by = ?, assigned_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
                [assignedTo, assignedById || req.user.id, req.params.id],
                function(err) {
                    if (err) {
                        console.error('Database error:', err);
                        return res.status(500).json({ success: false, error: err.message });
                    }
                    
                    res.json({
                        success: true,
                        message: 'Complaint regarding assigned successfully'
                    });
                }
            );
        });
    } catch (error) {
        console.error('Error assigning complaint regarding:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/staff/dashboard - Staff dashboard statistics
app.get('/api/staff/dashboard', protect, staffOrAdmin, (req, res) => {
    try {
        const stats = {
            totalAssigned: 0,
            pending: 0,
            inProgress: 0,
            resolved: 0,
            review: 0
        };

        db.get(`SELECT COUNT(*) as total FROM complaints WHERE assigned_to = ?`, [req.user.email], (err, result) => {
            if (err) {
                console.error('Error getting total complaints:', err);
                return res.status(500).json({ success: false, message: 'Database error' });
            }
            stats.totalAssigned = result?.total || 0;

            db.get(`SELECT COUNT(*) as pending FROM complaints WHERE assigned_to = ? AND status = 'pending'`, [req.user.email], (err, result) => {
                stats.pending = result?.pending || 0;

                db.get(`SELECT COUNT(*) as inProgress FROM complaints WHERE assigned_to = ? AND status = 'in-progress'`, [req.user.email], (err, result) => {
                    stats.inProgress = result?.inProgress || 0;

                    db.get(`SELECT COUNT(*) as resolved FROM complaints WHERE assigned_to = ? AND status = 'resolved'`, [req.user.email], (err, result) => {
                        stats.resolved = result?.resolved || 0;

                        db.get(`SELECT COUNT(*) as review FROM complaints WHERE assigned_to = ? AND status = 'review'`, [req.user.email], (err, result) => {
                            stats.review = result?.review || 0;

                            res.json({ success: true, data: stats });
                        });
                    });
                });
            });
        });
    } catch (error) {
        console.error('Error getting staff dashboard:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ==================== USER MANAGEMENT ROUTES (Admin Only) ====================

// GET /api/users - Get all users
app.get('/api/users', protect, adminOnly, (req, res) => {
    try {
        const { page = 1, limit = 100, role, status, search } = req.query;

        let sql = `SELECT id, name, name_en, email, phone, role, status, last_login, created_at, updated_at FROM users WHERE 1=1`;
        const params = [];

        if (role && role !== 'all') {
            sql += ` AND role = ?`;
            params.push(role);
        }

        if (status && status !== 'all') {
            sql += ` AND status = ?`;
            params.push(status);
        }

        if (search) {
            sql += ` AND (name LIKE ? OR name_en LIKE ? OR email LIKE ? OR phone LIKE ?)`;
            const searchPattern = `%${search}%`;
            params.push(searchPattern, searchPattern, searchPattern, searchPattern);
        }

        sql += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

        db.all(sql, params, (err, users) => {
            if (err) {
                return res.status(500).json({ success: false, message: err.message });
            }

            let countSql = `SELECT COUNT(*) as total FROM users WHERE 1=1`;
            const countParams = [];

            if (role && role !== 'all') {
                countSql += ` AND role = ?`;
                countParams.push(role);
            }
            if (status && status !== 'all') {
                countSql += ` AND status = ?`;
                countParams.push(status);
            }

            db.get(countSql, countParams, (err, countResult) => {
                if (err) {
                    return res.status(500).json({ success: false, message: err.message });
                }
                res.json({
                    success: true,
                    data: users,
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total: countResult?.total || 0,
                        pages: Math.ceil((countResult?.total || 0) / parseInt(limit))
                    }
                });
            });
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/users - Create new user (admin can create staff)
app.post('/api/users', protect, adminOnly, async (req, res) => {
    try {
        const { name, nameEn, email, phone, role, password } = req.body;

        if (!name || !nameEn || !email || !phone || !password) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ success: false, message: 'Invalid email format' });
        }

        const phoneRegex = /^[9][8-9][0-9]{8}$/;
        if (!phoneRegex.test(phone)) {
            return res.status(400).json({ success: false, message: 'Invalid phone number. Must be 10 digits starting with 98 or 99' });
        }

        db.get(`SELECT id FROM users WHERE email = ? OR phone = ?`, [email.toLowerCase(), phone], (err, existingUser) => {
            if (err) {
                return res.status(500).json({ success: false, message: err.message });
            }
            if (existingUser) {
                return res.status(409).json({ success: false, message: 'User with this email or phone already exists' });
            }

            bcrypt.hash(password, 10, (err, hashedPassword) => {
                if (err) {
                    return res.status(500).json({ success: false, message: 'Error hashing password' });
                }

                const sql = `INSERT INTO users (name, name_en, email, phone, password, role, status, created_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`;

                db.run(sql, [name, nameEn, email.toLowerCase(), phone, hashedPassword, role || 'user', 'active', req.user.id], function(err) {
                    if (err) {
                        return res.status(500).json({ success: false, message: err.message });
                    }
                    res.status(201).json({
                        success: true,
                        message: 'User created successfully',
                        data: { id: this.lastID, name, nameEn, email, phone, role: role || 'user', status: 'active' }
                    });
                });
            });
        });
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT /api/users/:id - Update user
app.put('/api/users/:id', protect, adminOnly, (req, res) => {
    try {
        const { name, nameEn, email, phone, role, status } = req.body;

        if (!name || !nameEn || !email || !phone) {
            return res.status(400).json({ success: false, message: 'Name, email, and phone are required' });
        }

        db.get(`SELECT id FROM users WHERE id = ?`, [req.params.id], (err, user) => {
            if (err) {
                return res.status(500).json({ success: false, message: err.message });
            }
            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            db.get(`SELECT id FROM users WHERE (email = ? OR phone = ?) AND id != ?`, [email.toLowerCase(), phone, req.params.id], (err, existingUser) => {
                if (err) {
                    return res.status(500).json({ success: false, message: err.message });
                }
                if (existingUser) {
                    return res.status(409).json({ success: false, message: 'Email or phone already exists' });
                }

                const sql = `UPDATE users SET name = ?, name_en = ?, email = ?, phone = ?, role = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;

                db.run(sql, [name, nameEn, email.toLowerCase(), phone, role || 'user', status || 'active', req.params.id], function(err) {
                    if (err) {
                        return res.status(500).json({ success: false, message: err.message });
                    }
                    res.json({ success: true, message: 'User updated successfully' });
                });
            });
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// PATCH /api/users/:id/status - Update user status
app.patch('/api/users/:id/status', protect, adminOnly, (req, res) => {
    try {
        const { status } = req.body;

        if (!status || !['active', 'inactive', 'suspended'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        if (parseInt(req.params.id) === req.user.id) {
            return res.status(403).json({ success: false, message: 'You cannot change your own status' });
        }

        db.get(`SELECT id FROM users WHERE id = ?`, [req.params.id], (err, user) => {
            if (err) {
                return res.status(500).json({ success: false, message: err.message });
            }
            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            db.run(`UPDATE users SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [status, req.params.id], function(err) {
                if (err) {
                    return res.status(500).json({ success: false, message: err.message });
                }
                res.json({ success: true, message: `User status updated to ${status}` });
            });
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE /api/users/:id - Delete user
app.delete('/api/users/:id', protect, adminOnly, (req, res) => {
    try {
        if (parseInt(req.params.id) === req.user.id) {
            return res.status(403).json({ success: false, message: 'You cannot delete your own account' });
        }

        db.get(`SELECT id FROM users WHERE id = ?`, [req.params.id], (err, user) => {
            if (err) {
                return res.status(500).json({ success: false, message: err.message });
            }
            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            db.run(`DELETE FROM users WHERE id = ?`, [req.params.id], function(err) {
                if (err) {
                    return res.status(500).json({ success: false, message: err.message });
                }
                res.json({ success: true, message: 'User deleted successfully' });
            });
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ==================== INITIALIZE ADMIN AND STAFF USERS ====================

// Function to generate unique phone number
const generateUniquePhoneNumber = async (baseNumber) => {
    let phoneNumber = baseNumber;
    let isUnique = false;
    let attempts = 0;
    
    while (!isUnique && attempts < 10) {
        const exists = await new Promise((resolve) => {
            db.get(`SELECT id FROM users WHERE phone = ?`, [phoneNumber], (err, row) => {
                resolve(!err && row);
            });
        });
        
        if (!exists) {
            isUnique = true;
        } else {
            const randomSuffix = Math.floor(Math.random() * 9000) + 1000;
            phoneNumber = `9841${randomSuffix}`;
        }
        attempts++;
    }
    
    return phoneNumber;
};

// Function to create sample staff users
const createSampleStaffUsers = async () => {
    const staffUsers = [
        {
            name: 'राम बहादुर',
            name_en: 'Ram Bahadur',
            email: 'ram@ntc.gov.np',
            basePhone: '9841000011',
            password: 'staff123',
            role: 'staff'
        },
        {
            name: 'सीता शर्मा',
            name_en: 'Sita Sharma',
            email: 'sita@ntc.gov.np',
            basePhone: '9841000022',
            password: 'staff123',
            role: 'staff'
        },
        {
            name: 'हरि प्रसाद',
            name_en: 'Hari Prasad',
            email: 'hari@ntc.gov.np',
            basePhone: '9841000033',
            password: 'staff123',
            role: 'staff'
        },
        {
            name: 'गीता अधिकारी',
            name_en: 'Gita Adhikari',
            email: 'gita@ntc.gov.np',
            basePhone: '9841000044',
            password: 'staff123',
            role: 'staff'
        },
        {
            name: 'विकास न्यौपाने',
            name_en: 'Bikas Neupane',
            email: 'bikas@ntc.gov.np',
            basePhone: '9841000055',
            password: 'staff123',
            role: 'staff'
        },
        {
            name: 'मिना काफ्ले',
            name_en: 'Mina Kafle',
            email: 'mina@ntc.gov.np',
            basePhone: '9841000066',
            password: 'staff123',
            role: 'staff'
        },
        {
            name: 'सुरज थापा',
            name_en: 'Suraj Thapa',
            email: 'suraj@ntc.gov.np',
            basePhone: '9841000077',
            password: 'staff123',
            role: 'staff'
        },
        {
            name: 'प्रिया श्रेष्ठ',
            name_en: 'Priya Shrestha',
            email: 'priya@ntc.gov.np',
            basePhone: '9841000088',
            password: 'staff123',
            role: 'staff'
        },
        {
            name: 'विनोद न्यौपाने',
            name_en: 'Binod Neupane',
            email: 'binod@ntc.gov.np',
            basePhone: '9841000099',
            password: 'staff123',
            role: 'staff'
        },
        {
            name: 'सुनिता कार्की',
            name_en: 'Sunita Karki',
            email: 'sunita@ntc.gov.np',
            basePhone: '9841000100',
            password: 'staff123',
            role: 'staff'
        }
    ];

    for (const staff of staffUsers) {
        try {
            // Check if user already exists by email
            const existingUser = await new Promise((resolve) => {
                db.get(`SELECT id FROM users WHERE email = ?`, [staff.email], (err, row) => {
                    resolve(row);
                });
            });
            
            if (existingUser) {
                console.log(`✅ Staff already exists: ${staff.email}`);
                continue;
            }
            
            // Get unique phone number
            const phoneNumber = await generateUniquePhoneNumber(staff.basePhone);
            
            const hashedPassword = await bcrypt.hash(staff.password, 10);
            
            await new Promise((resolve, reject) => {
                db.run(
                    `INSERT INTO users (name, name_en, email, phone, password, role, status, created_at, updated_at)
                     VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
                    [staff.name, staff.name_en, staff.email, phoneNumber, hashedPassword, staff.role, 'active'],
                    function(err) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(this.lastID);
                        }
                    }
                );
            });
            
            console.log(`✅ Staff created: ${staff.email} / ${staff.password} (Phone: ${phoneNumber})`);
            
        } catch (error) {
            if (error.message.includes('UNIQUE constraint failed')) {
                console.log(`⚠️ Could not create ${staff.email} - already exists`);
            } else {
                console.error(`Error creating ${staff.email}:`, error.message);
            }
        }
    }
};

// ==================== SETTINGS API ROUTES ====================
// (Keep your existing settings routes here)

// ==================== ERROR HANDLING ====================
app.use((err, req, res, next) => {
    console.error('Server error:', err);

    if (err instanceof multer.MulterError) {
        if (err.code === 'FILE_TOO_LARGE') {
            return res.status(400).json({ success: false, message: 'File is too large. Maximum size is 5MB.' });
        }
        return res.status(400).json({ success: false, message: err.message });
    }

    res.status(500).json({ success: false, message: err.message || 'Internal server error' });
});

app.use('*', (req, res) => {
    res.status(404).json({ success: false, message: `Cannot find ${req.originalUrl} on this server` });
});

// Initialize database and start server
const startServer = async () => {
    try {
        await initDatabase();

        // Add missing columns if needed
        db.run(`ALTER TABLE complaints ADD COLUMN resolution TEXT`, () => {});
        db.run(`ALTER TABLE complaints ADD COLUMN resolved_at DATETIME`, () => {});
        db.run(`ALTER TABLE complaints ADD COLUMN assigned_to VARCHAR(100)`, () => {});
        db.run(`ALTER TABLE complaints ADD COLUMN assigned_by INTEGER`, () => {});
        db.run(`ALTER TABLE complaints ADD COLUMN assigned_at DATETIME`, () => {});
        db.run(`ALTER TABLE complaint_regarding ADD COLUMN resolution TEXT`, () => {});
        db.run(`ALTER TABLE complaint_regarding ADD COLUMN resolved_at DATETIME`, () => {});
        db.run(`ALTER TABLE complaint_regarding ADD COLUMN assigned_to VARCHAR(100)`, () => {});
        db.run(`ALTER TABLE complaint_regarding ADD COLUMN assigned_by INTEGER`, () => {});
        db.run(`ALTER TABLE complaint_regarding ADD COLUMN assigned_at DATETIME`, () => {});

        // Create default admin user if not exists
        db.get(`SELECT id FROM users WHERE email = ?`, ['admin@example.com'], async (err, user) => {
            if (err) {
                console.error('Error checking admin user:', err);
                return;
            }

            if (!user) {
                const hashedPassword = await bcrypt.hash('admin123', 10);
                db.run(
                    `INSERT INTO users (name, name_en, email, phone, password, role, status, created_at, updated_at)
                     VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
                    ['प्रशासक', 'Admin', 'admin@example.com', '9800000000', hashedPassword, 'admin', 'active'],
                    function(err) {
                        if (err) {
                            console.error('Error creating admin user:', err);
                        } else {
                            console.log('✅ Admin user created: admin@example.com / admin123');
                        }
                    }
                );
            } else {
                console.log('✅ Admin user already exists: admin@example.com');
            }
        });

        // Wait a bit for admin creation
        setTimeout(() => {
            createSampleStaffUsers();
        }, 500);

        app.listen(PORT, () => {
            console.log(`\n=================================`);
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📡 API available at http://localhost:${PORT}/api`);
            console.log(`💚 Health check: http://localhost:${PORT}/api/health`);
            console.log(`=================================`);
            console.log(`🔐 LOGIN CREDENTIALS:`);
            console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
            console.log(`👑 ADMIN LOGIN:`);
            console.log(`   📧 Email: admin@example.com`);
            console.log(`   🔑 Password: admin123`);
            console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
            console.log(`👥 STAFF LOGINS (10 staff members):`);
            console.log(`   1. ram@ntc.gov.np / staff123`);
            console.log(`   2. sita@ntc.gov.np / staff123`);
            console.log(`   3. hari@ntc.gov.np / staff123`);
            console.log(`   4. gita@ntc.gov.np / staff123`);
            console.log(`   5. bikas@ntc.gov.np / staff123`);
            console.log(`   6. mina@ntc.gov.np / staff123`);
            console.log(`   7. suraj@ntc.gov.np / staff123`);
            console.log(`   8. priya@ntc.gov.np / staff123`);
            console.log(`   9. binod@ntc.gov.np / staff123`);
            console.log(`  10. sunita@ntc.gov.np / staff123`);
            console.log(`=================================`);
            console.log(`📋 API Endpoints:`);
            console.log(`   POST /api/auth/login - Login`);
            console.log(`   GET /api/complaints - Get complaints`);
            console.log(`   PATCH /api/admin/complaints/:id/status - Update status`);
            console.log(`   PATCH /api/admin/complaints/:id/assign - Assign to staff`);
            console.log(`   GET /api/staff/dashboard - Staff dashboard`);
            console.log(`=================================\n`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

module.exports = app;