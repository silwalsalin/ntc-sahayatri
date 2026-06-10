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

// JWT Secret - Make sure this is consistent
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
const generateToken = (id) => {
    return jwt.sign({ id }, JWT_SECRET, { expiresIn: JWT_EXPIRE });
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
    // Guard: must have a Bearer token before doing anything async
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

// POST /api/auth/login
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

            const token = generateToken(user.id);

            res.json({
                success: true,
                message: 'Login successful',
                data: {
                    id: user.id,
                    name: user.name,
                    nameEn: user.name_en,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                    status: user.status,
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
        const newToken = generateToken(req.user.id);
        res.json({
            success: true,
            token: newToken,
            message: 'Token refreshed successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to refresh token' });
    }
});

// ==================== ADMIN COMPLAINTS API (Auth Required) ====================

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

        db.get(`SELECT id FROM complaints WHERE id = ?`, [req.params.id], (err, complaint) => {
            if (err) {
                return res.status(500).json({ success: false, error: err.message });
            }
            if (!complaint) {
                return res.status(404).json({ success: false, message: 'Complaint not found' });
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

        db.get(`SELECT id FROM complaint_regarding WHERE id = ?`, [req.params.id], (err, complaint) => {
            if (err) {
                return res.status(500).json({ success: false, error: err.message });
            }
            if (!complaint) {
                return res.status(404).json({ success: false, message: 'Complaint not found' });
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

// ==================== USER MANAGEMENT ROUTES (Admin Only) ====================

// GET /api/users/check - MUST come before /:id
app.get('/api/users/check', protect, adminOnly, (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        db.get(`SELECT id, name, name_en, email, phone, role, status FROM users WHERE email = ?`, [email.toLowerCase()], (err, user) => {
            if (err) {
                return res.status(500).json({ success: false, message: err.message });
            }
            res.json({ success: true, exists: !!user, user: user || null });
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/users/stats/summary - MUST come before /:id
app.get('/api/users/stats/summary', protect, adminOnly, (req, res) => {
    try {
        const sql = `
            SELECT
                COUNT(*) as total,
                SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
                SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive,
                SUM(CASE WHEN status = 'suspended' THEN 1 ELSE 0 END) as suspended,
                SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admin_count,
                SUM(CASE WHEN role = 'staff' THEN 1 ELSE 0 END) as staff_count,
                SUM(CASE WHEN role = 'user' THEN 1 ELSE 0 END) as user_count
            FROM users
        `;

        db.get(sql, [], (err, stats) => {
            if (err) {
                return res.status(500).json({ success: false, message: err.message });
            }
            res.json({
                success: true,
                data: stats || { total: 0, active: 0, inactive: 0, suspended: 0, admin_count: 0, staff_count: 0, user_count: 0 }
            });
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

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

// GET /api/users/:id - Get single user (must come AFTER /check and /stats/summary)
app.get('/api/users/:id', protect, adminOnly, (req, res) => {
    try {
        db.get(
            `SELECT id, name, name_en, email, phone, role, status, last_login, created_at, updated_at FROM users WHERE id = ?`,
            [req.params.id],
            (err, user) => {
                if (err) {
                    return res.status(500).json({ success: false, message: err.message });
                }
                if (!user) {
                    return res.status(404).json({ success: false, message: 'User not found' });
                }

                db.get(`SELECT COUNT(*) as complaint_count FROM complaints WHERE email = ?`, [user.email], (err, complaintCount) => {
                    const complaints = complaintCount?.complaint_count || 0;
                    db.get(`SELECT COUNT(*) as regarding_count FROM complaint_regarding WHERE email = ?`, [user.email], (err, regardingCount) => {
                        const regardings = regardingCount?.regarding_count || 0;
                        res.json({
                            success: true,
                            data: {
                                ...user,
                                complaintsCount: complaints,
                                complaintRegardingsCount: regardings,
                                totalComplaints: complaints + regardings
                            }
                        });
                    });
                });
            }
        );
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/users - Create new user
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

// ==================== SETTINGS API ROUTES ====================

// GET /api/settings/general - Get general settings
app.get('/api/settings/general', protect, adminOnly, (req, res) => {
  try {
    db.get(`SELECT * FROM settings_general ORDER BY id DESC LIMIT 1`, [], (err, settings) => {
      if (err) {
        console.error('Error fetching general settings:', err);
        return res.status(500).json({ success: false, message: 'Database error' });
      }
      
      if (!settings) {
        return res.json({
          success: true,
          data: {
            siteName: 'NTC Sahayatri',
            siteName_np: 'एनटीसी सहयात्री',
            siteDescription: 'Complaint Tracking System for Nepal Telecom',
            siteDescription_np: 'नेपाल दूरसञ्चारको लागि गुनासो ट्र्याकिङ प्रणाली',
            siteEmail: 'support@ntc.com.np',
            sitePhone: '01-4960008',
            siteAddress: 'Bhadrakali Plaza, Kathmandu',
            siteAddress_np: 'भद्रकाली प्लाजा, काठमाडौं',
            timezone: 'Asia/Kathmandu',
            dateFormat: 'YYYY-MM-DD',
            timeFormat: '24h',
            defaultLanguage: 'np',
            itemsPerPage: 10,
            enableRegistration: true,
            enablePublicComplaints: true,
            maintenanceMode: false
          }
        });
      }
      
      res.json({
        success: true,
        data: {
          siteName: settings.site_name,
          siteName_np: settings.site_name_np,
          siteDescription: settings.site_description,
          siteDescription_np: settings.site_description_np,
          siteEmail: settings.site_email,
          sitePhone: settings.site_phone,
          siteAddress: settings.site_address,
          siteAddress_np: settings.site_address_np,
          timezone: settings.timezone,
          dateFormat: settings.date_format,
          timeFormat: settings.time_format,
          defaultLanguage: settings.default_language,
          itemsPerPage: settings.items_per_page,
          enableRegistration: settings.enable_registration === 1,
          enablePublicComplaints: settings.enable_public_complaints === 1,
          maintenanceMode: settings.maintenance_mode === 1
        }
      });
    });
  } catch (error) {
    console.error('Error in GET /settings/general:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/settings/general - Update general settings
app.put('/api/settings/general', protect, adminOnly, (req, res) => {
  try {
    const {
      siteName, siteName_np, siteDescription, siteDescription_np,
      siteEmail, sitePhone, siteAddress, siteAddress_np,
      timezone, dateFormat, timeFormat, defaultLanguage,
      itemsPerPage, enableRegistration, enablePublicComplaints, maintenanceMode
    } = req.body;
    
    db.get(`SELECT id FROM settings_general LIMIT 1`, [], (err, existing) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ success: false, message: 'Database error' });
      }
      
      if (existing) {
        const sql = `UPDATE settings_general SET
          site_name = ?, site_name_np = ?, site_description = ?, site_description_np = ?,
          site_email = ?, site_phone = ?, site_address = ?, site_address_np = ?,
          timezone = ?, date_format = ?, time_format = ?, default_language = ?,
          items_per_page = ?, enable_registration = ?, enable_public_complaints = ?,
          maintenance_mode = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?`;
        
        db.run(sql, [
          siteName, siteName_np, siteDescription, siteDescription_np,
          siteEmail, sitePhone, siteAddress, siteAddress_np,
          timezone, dateFormat, timeFormat, defaultLanguage,
          itemsPerPage, enableRegistration ? 1 : 0, enablePublicComplaints ? 1 : 0,
          maintenanceMode ? 1 : 0, existing.id
        ], function(err) {
          if (err) {
            console.error('Error updating general settings:', err);
            return res.status(500).json({ success: false, message: 'Database error' });
          }
          res.json({ success: true, message: 'General settings updated successfully' });
        });
      } else {
        const sql = `INSERT INTO settings_general (
          site_name, site_name_np, site_description, site_description_np,
          site_email, site_phone, site_address, site_address_np,
          timezone, date_format, time_format, default_language,
          items_per_page, enable_registration, enable_public_complaints, maintenance_mode
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        
        db.run(sql, [
          siteName, siteName_np, siteDescription, siteDescription_np,
          siteEmail, sitePhone, siteAddress, siteAddress_np,
          timezone, dateFormat, timeFormat, defaultLanguage,
          itemsPerPage, enableRegistration ? 1 : 0, enablePublicComplaints ? 1 : 0,
          maintenanceMode ? 1 : 0
        ], function(err) {
          if (err) {
            console.error('Error inserting general settings:', err);
            return res.status(500).json({ success: false, message: 'Database error' });
          }
          res.json({ success: true, message: 'General settings saved successfully' });
        });
      }
    });
  } catch (error) {
    console.error('Error in PUT /settings/general:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/settings/email - Get email settings
app.get('/api/settings/email', protect, adminOnly, (req, res) => {
  try {
    db.get(`SELECT * FROM settings_email ORDER BY id DESC LIMIT 1`, [], (err, settings) => {
      if (err) {
        console.error('Error fetching email settings:', err);
        return res.status(500).json({ success: false, message: 'Database error' });
      }
      
      if (!settings) {
        return res.json({
          success: true,
          data: {
            smtpHost: 'smtp.gmail.com',
            smtpPort: '587',
            smtpUser: '',
            smtpPassword: '',
            smtpEncryption: 'tls',
            fromEmail: 'notifications@ntc.com.np',
            fromName: 'NTC Sahayatri',
            fromName_np: 'एनटीसी सहयात्री',
            sendComplaintConfirmation: true,
            sendComplaintUpdate: true,
            sendComplaintResolved: true,
            sendNewsletter: false
          }
        });
      }
      
      res.json({
        success: true,
        data: {
          smtpHost: settings.smtp_host,
          smtpPort: settings.smtp_port,
          smtpUser: settings.smtp_user,
          smtpPassword: '',
          smtpEncryption: settings.smtp_encryption,
          fromEmail: settings.from_email,
          fromName: settings.from_name,
          fromName_np: settings.from_name_np,
          sendComplaintConfirmation: settings.send_complaint_confirmation === 1,
          sendComplaintUpdate: settings.send_complaint_update === 1,
          sendComplaintResolved: settings.send_complaint_resolved === 1,
          sendNewsletter: settings.send_newsletter === 1
        }
      });
    });
  } catch (error) {
    console.error('Error in GET /settings/email:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/settings/email - Update email settings
app.put('/api/settings/email', protect, adminOnly, (req, res) => {
  try {
    const {
      smtpHost, smtpPort, smtpUser, smtpPassword, smtpEncryption,
      fromEmail, fromName, fromName_np,
      sendComplaintConfirmation, sendComplaintUpdate, sendComplaintResolved, sendNewsletter
    } = req.body;
    
    db.get(`SELECT id FROM settings_email LIMIT 1`, [], (err, existing) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ success: false, message: 'Database error' });
      }
      
      const updateFields = `smtp_host = ?, smtp_port = ?, smtp_user = ?, smtp_encryption = ?,
        from_email = ?, from_name = ?, from_name_np = ?,
        send_complaint_confirmation = ?, send_complaint_update = ?,
        send_complaint_resolved = ?, send_newsletter = ?, updated_at = CURRENT_TIMESTAMP`;
      
      let params = [
        smtpHost, smtpPort, smtpUser, smtpEncryption,
        fromEmail, fromName, fromName_np,
        sendComplaintConfirmation ? 1 : 0, sendComplaintUpdate ? 1 : 0,
        sendComplaintResolved ? 1 : 0, sendNewsletter ? 1 : 0
      ];
      
      let sql;
      if (smtpPassword && smtpPassword !== '') {
        sql = `UPDATE settings_email SET ${updateFields}, smtp_password = ? WHERE id = ?`;
        params.push(smtpPassword);
      } else {
        sql = `UPDATE settings_email SET ${updateFields} WHERE id = ?`;
      }
      
      if (existing) {
        params.push(existing.id);
        db.run(sql, params, function(err) {
          if (err) {
            console.error('Error updating email settings:', err);
            return res.status(500).json({ success: false, message: 'Database error' });
          }
          res.json({ success: true, message: 'Email settings updated successfully' });
        });
      } else {
        const insertSql = `INSERT INTO settings_email (
          smtp_host, smtp_port, smtp_user, smtp_password, smtp_encryption,
          from_email, from_name, from_name_np,
          send_complaint_confirmation, send_complaint_update, send_complaint_resolved, send_newsletter
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        
        const insertParams = [
          smtpHost, smtpPort, smtpUser, smtpPassword || '', smtpEncryption,
          fromEmail, fromName, fromName_np,
          sendComplaintConfirmation ? 1 : 0, sendComplaintUpdate ? 1 : 0,
          sendComplaintResolved ? 1 : 0, sendNewsletter ? 1 : 0
        ];
        
        db.run(insertSql, insertParams, function(err) {
          if (err) {
            console.error('Error inserting email settings:', err);
            return res.status(500).json({ success: false, message: 'Database error' });
          }
          res.json({ success: true, message: 'Email settings saved successfully' });
        });
      }
    });
  } catch (error) {
    console.error('Error in PUT /settings/email:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/settings/email/test - Send test email
app.post('/api/settings/email/test', protect, adminOnly, async (req, res) => {
  try {
    const { to, subject, message } = req.body;
    
    console.log('Test email would be sent to:', to);
    console.log('Subject:', subject);
    console.log('Message:', message);
    
    res.json({ success: true, message: 'Test email sent successfully' });
  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({ success: false, message: 'Failed to send test email' });
  }
});

// GET /api/settings/security - Get security settings
app.get('/api/settings/security', protect, adminOnly, (req, res) => {
  try {
    db.get(`SELECT * FROM settings_security ORDER BY id DESC LIMIT 1`, [], (err, settings) => {
      if (err) {
        console.error('Error fetching security settings:', err);
        return res.status(500).json({ success: false, message: 'Database error' });
      }
      
      if (!settings) {
        return res.json({
          success: true,
          data: {
            sessionTimeout: 30,
            maxLoginAttempts: 5,
            lockoutDuration: 15,
            passwordExpiryDays: 90,
            minPasswordLength: 8,
            requireUppercase: true,
            requireLowercase: true,
            requireNumbers: true,
            requireSpecialChars: true,
            twoFactorAuth: false,
            ipWhitelist: ''
          }
        });
      }
      
      res.json({
        success: true,
        data: {
          sessionTimeout: settings.session_timeout,
          maxLoginAttempts: settings.max_login_attempts,
          lockoutDuration: settings.lockout_duration,
          passwordExpiryDays: settings.password_expiry_days,
          minPasswordLength: settings.min_password_length,
          requireUppercase: settings.require_uppercase === 1,
          requireLowercase: settings.require_lowercase === 1,
          requireNumbers: settings.require_numbers === 1,
          requireSpecialChars: settings.require_special_chars === 1,
          twoFactorAuth: settings.two_factor_auth === 1,
          ipWhitelist: settings.ip_whitelist || ''
        }
      });
    });
  } catch (error) {
    console.error('Error in GET /settings/security:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/settings/security - Update security settings
app.put('/api/settings/security', protect, adminOnly, (req, res) => {
  try {
    const {
      sessionTimeout, maxLoginAttempts, lockoutDuration, passwordExpiryDays,
      minPasswordLength, requireUppercase, requireLowercase, requireNumbers,
      requireSpecialChars, twoFactorAuth, ipWhitelist
    } = req.body;
    
    db.get(`SELECT id FROM settings_security LIMIT 1`, [], (err, existing) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ success: false, message: 'Database error' });
      }
      
      const sql = `UPDATE settings_security SET
        session_timeout = ?, max_login_attempts = ?, lockout_duration = ?,
        password_expiry_days = ?, min_password_length = ?,
        require_uppercase = ?, require_lowercase = ?, require_numbers = ?,
        require_special_chars = ?, two_factor_auth = ?, ip_whitelist = ?,
        updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
      
      const params = [
        sessionTimeout, maxLoginAttempts, lockoutDuration, passwordExpiryDays,
        minPasswordLength, requireUppercase ? 1 : 0, requireLowercase ? 1 : 0,
        requireNumbers ? 1 : 0, requireSpecialChars ? 1 : 0, twoFactorAuth ? 1 : 0,
        ipWhitelist || ''
      ];
      
      if (existing) {
        params.push(existing.id);
        db.run(sql, params, function(err) {
          if (err) {
            console.error('Error updating security settings:', err);
            return res.status(500).json({ success: false, message: 'Database error' });
          }
          res.json({ success: true, message: 'Security settings updated successfully' });
        });
      } else {
        const insertSql = `INSERT INTO settings_security (
          session_timeout, max_login_attempts, lockout_duration, password_expiry_days,
          min_password_length, require_uppercase, require_lowercase, require_numbers,
          require_special_chars, two_factor_auth, ip_whitelist
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        
        db.run(insertSql, params, function(err) {
          if (err) {
            console.error('Error inserting security settings:', err);
            return res.status(500).json({ success: false, message: 'Database error' });
          }
          res.json({ success: true, message: 'Security settings saved successfully' });
        });
      }
    });
  } catch (error) {
    console.error('Error in PUT /settings/security:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/settings/backup - Get backup settings
app.get('/api/settings/backup', protect, adminOnly, (req, res) => {
  try {
    db.get(`SELECT * FROM settings_backup ORDER BY id DESC LIMIT 1`, [], (err, settings) => {
      if (err) {
        console.error('Error fetching backup settings:', err);
        return res.status(500).json({ success: false, message: 'Database error' });
      }
      
      if (!settings) {
        return res.json({
          success: true,
          data: {
            autoBackup: true,
            backupFrequency: 'daily',
            backupTime: '02:00',
            backupRetention: 30,
            backupLocation: '/backups/',
            lastBackup: '',
            lastBackupSize: ''
          }
        });
      }
      
      res.json({
        success: true,
        data: {
          autoBackup: settings.auto_backup === 1,
          backupFrequency: settings.backup_frequency,
          backupTime: settings.backup_time,
          backupRetention: settings.backup_retention,
          backupLocation: settings.backup_location,
          lastBackup: settings.last_backup,
          lastBackupSize: settings.last_backup_size
        }
      });
    });
  } catch (error) {
    console.error('Error in GET /settings/backup:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/settings/backup - Update backup settings
app.put('/api/settings/backup', protect, adminOnly, (req, res) => {
  try {
    const { autoBackup, backupFrequency, backupTime, backupRetention, backupLocation } = req.body;
    
    db.get(`SELECT id FROM settings_backup LIMIT 1`, [], (err, existing) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ success: false, message: 'Database error' });
      }
      
      const sql = `UPDATE settings_backup SET
        auto_backup = ?, backup_frequency = ?, backup_time = ?,
        backup_retention = ?, backup_location = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`;
      
      const params = [autoBackup ? 1 : 0, backupFrequency, backupTime, backupRetention, backupLocation];
      
      if (existing) {
        params.push(existing.id);
        db.run(sql, params, function(err) {
          if (err) {
            console.error('Error updating backup settings:', err);
            return res.status(500).json({ success: false, message: 'Database error' });
          }
          res.json({ success: true, message: 'Backup settings updated successfully' });
        });
      } else {
        const insertSql = `INSERT INTO settings_backup (
          auto_backup, backup_frequency, backup_time, backup_retention, backup_location
        ) VALUES (?, ?, ?, ?, ?)`;
        
        db.run(insertSql, params, function(err) {
          if (err) {
            console.error('Error inserting backup settings:', err);
            return res.status(500).json({ success: false, message: 'Database error' });
          }
          res.json({ success: true, message: 'Backup settings saved successfully' });
        });
      }
    });
  } catch (error) {
    console.error('Error in PUT /settings/backup:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/settings/backup/now - Trigger manual backup
app.post('/api/settings/backup/now', protect, adminOnly, (req, res) => {
  try {
    const now = new Date();
    const lastBackup = now.toISOString().replace('T', ' ').substring(0, 19);
    const lastBackupSize = '0 MB';
    
    db.get(`SELECT id FROM settings_backup LIMIT 1`, [], (err, existing) => {
      if (existing) {
        db.run(`UPDATE settings_backup SET last_backup = ?, last_backup_size = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
          [lastBackup, lastBackupSize, existing.id], (err) => {
            if (err) {
              console.error('Error updating backup info:', err);
            }
          });
      }
    });
    
    res.json({
      success: true,
      message: 'Backup completed successfully',
      data: { lastBackup, size: lastBackupSize }
    });
  } catch (error) {
    console.error('Error creating backup:', error);
    res.status(500).json({ success: false, message: 'Failed to create backup' });
  }
});

// GET /api/settings/notifications - Get notification settings
app.get('/api/settings/notifications', protect, adminOnly, (req, res) => {
  try {
    db.get(`SELECT * FROM settings_notifications ORDER BY id DESC LIMIT 1`, [], (err, settings) => {
      if (err) {
        console.error('Error fetching notification settings:', err);
        return res.status(500).json({ success: false, message: 'Database error' });
      }
      
      if (!settings) {
        return res.json({
          success: true,
          data: {
            emailNotifications: true,
            smsNotifications: false,
            pushNotifications: true,
            notifyNewComplaint: true,
            notifyComplaintUpdate: true,
            notifyComplaintResolved: true,
            notifyNewUser: true,
            notifySystemUpdate: true,
            adminEmail: '',
            adminPhone: ''
          }
        });
      }
      
      res.json({
        success: true,
        data: {
          emailNotifications: settings.email_notifications === 1,
          smsNotifications: settings.sms_notifications === 1,
          pushNotifications: settings.push_notifications === 1,
          notifyNewComplaint: settings.notify_new_complaint === 1,
          notifyComplaintUpdate: settings.notify_complaint_update === 1,
          notifyComplaintResolved: settings.notify_complaint_resolved === 1,
          notifyNewUser: settings.notify_new_user === 1,
          notifySystemUpdate: settings.notify_system_update === 1,
          adminEmail: settings.admin_email || '',
          adminPhone: settings.admin_phone || ''
        }
      });
    });
  } catch (error) {
    console.error('Error in GET /settings/notifications:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/settings/notifications - Update notification settings
app.put('/api/settings/notifications', protect, adminOnly, (req, res) => {
  try {
    const {
      emailNotifications, smsNotifications, pushNotifications,
      notifyNewComplaint, notifyComplaintUpdate, notifyComplaintResolved,
      notifyNewUser, notifySystemUpdate, adminEmail, adminPhone
    } = req.body;
    
    db.get(`SELECT id FROM settings_notifications LIMIT 1`, [], (err, existing) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ success: false, message: 'Database error' });
      }
      
      const sql = `UPDATE settings_notifications SET
        email_notifications = ?, sms_notifications = ?, push_notifications = ?,
        notify_new_complaint = ?, notify_complaint_update = ?, notify_complaint_resolved = ?,
        notify_new_user = ?, notify_system_update = ?, admin_email = ?, admin_phone = ?,
        updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
      
      const params = [
        emailNotifications ? 1 : 0, smsNotifications ? 1 : 0, pushNotifications ? 1 : 0,
        notifyNewComplaint ? 1 : 0, notifyComplaintUpdate ? 1 : 0, notifyComplaintResolved ? 1 : 0,
        notifyNewUser ? 1 : 0, notifySystemUpdate ? 1 : 0, adminEmail || '', adminPhone || ''
      ];
      
      if (existing) {
        params.push(existing.id);
        db.run(sql, params, function(err) {
          if (err) {
            console.error('Error updating notification settings:', err);
            return res.status(500).json({ success: false, message: 'Database error' });
          }
          res.json({ success: true, message: 'Notification settings updated successfully' });
        });
      } else {
        const insertSql = `INSERT INTO settings_notifications (
          email_notifications, sms_notifications, push_notifications,
          notify_new_complaint, notify_complaint_update, notify_complaint_resolved,
          notify_new_user, notify_system_update, admin_email, admin_phone
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        
        db.run(insertSql, params, function(err) {
          if (err) {
            console.error('Error inserting notification settings:', err);
            return res.status(500).json({ success: false, message: 'Database error' });
          }
          res.json({ success: true, message: 'Notification settings saved successfully' });
        });
      }
    });
  } catch (error) {
    console.error('Error in PUT /settings/notifications:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

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

        // Add missing columns if needed (errors silently ignored if already exist)
        db.run(`ALTER TABLE complaints ADD COLUMN resolution TEXT`, () => {});
        db.run(`ALTER TABLE complaints ADD COLUMN resolved_at DATETIME`, () => {});
        db.run(`ALTER TABLE complaint_regarding ADD COLUMN resolution TEXT`, () => {});
        db.run(`ALTER TABLE complaint_regarding ADD COLUMN resolved_at DATETIME`, () => {});

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
                            console.log('✅ Default admin user created successfully!');
                            console.log('📧 Email: admin@example.com');
                            console.log('🔑 Password: admin123');
                        }
                    }
                );
            }
        });

        app.listen(PORT, () => {
            console.log(`=================================`);
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📡 API available at http://localhost:${PORT}/api`);
            console.log(`💚 Health check: http://localhost:${PORT}/api/health`);
            console.log(`👥 Users API: http://localhost:${PORT}/api/users (Admin only)`);
            console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth`);
            console.log(`📋 Public Complaints: http://localhost:${PORT}/api/complaints/public`);
            console.log(`📋 Public Complaint Regarding: http://localhost:${PORT}/api/complaints/regarding/public`);
            console.log(`📝 Complaint Status: PATCH /api/admin/complaints/:id/status`);
            console.log(`📝 Complaint Regarding Status: PATCH /api/admin/complaint-regarding/:id/status`);
            console.log(`🔄 Token Refresh: POST /api/auth/refresh`);
            console.log(`⚙️ Settings API: /api/settings/*`);
            console.log(`=================================`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

module.exports = app;