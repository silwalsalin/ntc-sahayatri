// backend/server.js
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const { db, generateComplaintNumber, generateComplaintNumberNp, generateTrackingPassword } = require('./database/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
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
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF, JPG, PNG, DOC files are allowed.'));
        }
    }
});

// Serve static files
app.use('/uploads', express.static(uploadDir));

// ==================== HEALTH CHECK ====================
app.get('/api/health', (req, res) => {
    res.json({ success: true, status: 'OK', timestamp: new Date().toISOString() });
});

// ==================== REGULAR COMPLAINTS API ====================

// Get all public complaints
app.get('/api/complaints/public', (req, res) => {
    try {
        const { limit = 10, status, sort = 'desc' } = req.query;
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
                res.status(500).json({ success: false, error: err.message });
            } else {
                res.json({ success: true, data: rows || [], count: rows?.length || 0 });
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get single regular complaint
app.get('/api/complaints/:id', (req, res) => {
    try {
        db.get(`SELECT * FROM complaints WHERE id = ?`, [req.params.id], (err, row) => {
            if (err) {
                res.status(500).json({ success: false, error: err.message });
            } else if (!row) {
                res.status(404).json({ success: false, message: 'Complaint not found' });
            } else {
                delete row.tracking_password;
                res.json({ success: true, data: row });
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Submit regular complaint
app.post('/api/complaints', upload.single('attachment'), (req, res) => {
    try {
        const { natureOfComplaint, name, email, phone, state, district, municipality, wardNo, streetAddress, description, priority } = req.body;
        
        const complaintNumber = generateComplaintNumber();
        const complaintNumberNp = generateComplaintNumberNp();
        const trackingPassword = generateTrackingPassword();
        
        const sql = `INSERT INTO complaints (complaint_number, complaint_number_np, tracking_password, nature_of_complaint, name, email, phone, state, district, municipality, ward_no, street_address, description, priority) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        
        db.run(sql, [complaintNumber, complaintNumberNp, trackingPassword, natureOfComplaint, name, email, phone, state, district, municipality, wardNo, streetAddress, description, priority || 'medium'], function(err) {
            if (err) {
                res.status(500).json({ success: false, error: err.message });
            } else {
                res.status(201).json({
                    success: true,
                    data: { id: this.lastID, complaintNumber, complaintNumberNp, trackingPassword },
                    message: 'Complaint submitted successfully'
                });
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Track complaint
app.post('/api/complaints/track', (req, res) => {
    try {
        const { complaintNumber, password } = req.body;
        
        db.get(`SELECT * FROM complaints WHERE complaint_number = ? AND tracking_password = ?`, [complaintNumber, password], (err, row) => {
            if (err) {
                res.status(500).json({ success: false, error: err.message });
            } else if (!row) {
                res.status(404).json({ success: false, message: 'Invalid complaint number or password' });
            } else {
                delete row.tracking_password;
                res.json({ success: true, data: row });
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update regular complaint status (Admin)
app.patch('/api/admin/complaints/:id/status', (req, res) => {
    try {
        const { status, resolution } = req.body;
        
        const updateFields = ['status = ?', 'updated_at = CURRENT_TIMESTAMP'];
        const params = [status];
        
        if (resolution) {
            updateFields.push('resolution = ?');
            params.push(resolution);
        }
        
        if (status === 'resolved') {
            updateFields.push('resolved_at = CURRENT_TIMESTAMP');
        }
        
        params.push(req.params.id);
        
        db.run(`UPDATE complaints SET ${updateFields.join(', ')} WHERE id = ?`, params, function(err) {
            if (err) {
                res.status(500).json({ success: false, error: err.message });
            } else if (this.changes === 0) {
                res.status(404).json({ success: false, message: 'Complaint not found' });
            } else {
                res.json({ success: true, message: 'Status updated successfully' });
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==================== COMPLAINT REGARDING API ====================

// Get all complaint regarding (public)
app.get('/api/complaints/regarding/public', (req, res) => {
    try {
        const { limit = 10, status, sort = 'desc' } = req.query;
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
                res.status(500).json({ success: false, error: err.message });
            } else {
                res.json({ success: true, data: rows || [], count: rows?.length || 0 });
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get single complaint regarding
app.get('/api/complaints/regarding/:id', (req, res) => {
    try {
        db.get(`SELECT * FROM complaint_regarding WHERE id = ?`, [req.params.id], (err, row) => {
            if (err) {
                res.status(500).json({ success: false, error: err.message });
            } else if (!row) {
                res.status(404).json({ success: false, message: 'Complaint not found' });
            } else {
                delete row.tracking_password;
                res.json({ success: true, data: row });
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Submit complaint regarding
app.post('/api/complaints/regarding', upload.array('attachments', 5), (req, res) => {
    try {
        const { complaintType, subject, description, priority, name, email, phone, address, landmark, preferredContact, referenceNumber } = req.body;
        
        const complaintNumber = generateComplaintNumber();
        const complaintNumberNp = generateComplaintNumberNp();
        const trackingPassword = generateTrackingPassword();
        
        const sql = `INSERT INTO complaint_regarding (complaint_number, complaint_number_np, tracking_password, complaint_type, subject, description, priority, name, email, phone, address, landmark, preferred_contact, reference_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        
        db.run(sql, [complaintNumber, complaintNumberNp, trackingPassword, complaintType, subject, description, priority || 'medium', name, email || null, phone, address || null, landmark || null, preferredContact || 'phone', referenceNumber || null], function(err) {
            if (err) {
                console.error('Database error:', err);
                res.status(500).json({ success: false, error: err.message });
            } else {
                // Save attachments if any
                const files = req.files || [];
                if (files.length > 0) {
                    files.forEach(file => {
                        const attachSql = `INSERT INTO complaint_regarding_attachments (complaint_id, filename, original_name, file_path, file_size, mime_type) VALUES (?, ?, ?, ?, ?, ?)`;
                        db.run(attachSql, [this.lastID, file.filename, file.originalname, file.path, file.size, file.mimetype]);
                    });
                }
                
                res.status(201).json({
                    success: true,
                    data: { id: this.lastID, complaintNumber, complaintNumberNp, trackingPassword },
                    message: 'Complaint submitted successfully'
                });
            }
        });
    } catch (error) {
        console.error('Error submitting complaint:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update complaint regarding status (Admin)
app.patch('/api/admin/complaints/regarding/:id/status', (req, res) => {
    try {
        const { status, resolution } = req.body;
        
        const updateFields = ['status = ?', 'updated_at = CURRENT_TIMESTAMP'];
        const params = [status];
        
        if (resolution) {
            updateFields.push('resolution = ?');
            params.push(resolution);
        }
        
        if (status === 'resolved') {
            updateFields.push('resolved_at = CURRENT_TIMESTAMP');
        }
        
        params.push(req.params.id);
        
        db.run(`UPDATE complaint_regarding SET ${updateFields.join(', ')} WHERE id = ?`, params, function(err) {
            if (err) {
                res.status(500).json({ success: false, error: err.message });
            } else if (this.changes === 0) {
                res.status(404).json({ success: false, message: 'Complaint not found' });
            } else {
                res.json({ success: true, message: 'Status updated successfully' });
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==================== ADMIN COMBINED API ====================

// Get all complaints from both tables (for admin dashboard)
app.get('/api/admin/all-complaints', (req, res) => {
    try {
        const { limit = 20, status, search } = req.query;
        
        // Fetch from both tables
        let regularSql = `SELECT id, complaint_number, name, email, phone, description, status, priority, created_at, nature_of_complaint as category, 'regular' as type FROM complaints WHERE 1=1`;
        let regardingSql = `SELECT id, complaint_number, name, email, phone, description, status, priority, created_at, complaint_type as category, subject, reference_number, address, landmark, preferred_contact, 'regarding' as type FROM complaint_regarding WHERE 1=1`;
        
        if (status && status !== 'all') {
            regularSql += ` AND status = ?`;
            regardingSql += ` AND status = ?`;
        }
        
        if (search) {
            regularSql += ` AND (name LIKE ? OR email LIKE ? OR phone LIKE ? OR complaint_number LIKE ?)`;
            regardingSql += ` AND (name LIKE ? OR email LIKE ? OR phone LIKE ? OR complaint_number LIKE ? OR subject LIKE ?)`;
        }
        
        Promise.all([
            new Promise((resolve, reject) => {
                db.all(regularSql + ` ORDER BY created_at DESC`, (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows || []);
                });
            }),
            new Promise((resolve, reject) => {
                db.all(regardingSql + ` ORDER BY created_at DESC`, (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows || []);
                });
            })
        ]).then(([regularComplaints, regardingComplaints]) => {
            const allComplaints = [...regularComplaints, ...regardingComplaints];
            allComplaints.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            
            res.json({
                success: true,
                data: allComplaints.slice(0, parseInt(limit)),
                regularCount: regularComplaints.length,
                regardingCount: regardingComplaints.length,
                total: allComplaints.length
            });
        }).catch(error => {
            res.status(500).json({ success: false, error: error.message });
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get statistics from both tables
app.get('/api/admin/stats', (req, res) => {
    try {
        Promise.all([
            new Promise((resolve, reject) => {
                db.get(`SELECT COUNT(*) as total, SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending, SUM(CASE WHEN status = 'in-progress' THEN 1 ELSE 0 END) as in_progress, SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved FROM complaints`, (err, row) => {
                    if (err) reject(err);
                    else resolve(row || { total: 0, pending: 0, in_progress: 0, resolved: 0 });
                });
            }),
            new Promise((resolve, reject) => {
                db.get(`SELECT COUNT(*) as total, SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending, SUM(CASE WHEN status = 'in-progress' THEN 1 ELSE 0 END) as in_progress, SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved FROM complaint_regarding`, (err, row) => {
                    if (err) reject(err);
                    else resolve(row || { total: 0, pending: 0, in_progress: 0, resolved: 0 });
                });
            })
        ]).then(([regularStats, regardingStats]) => {
            res.json({
                success: true,
                data: {
                    regular: regularStats,
                    regarding: regardingStats,
                    combined: {
                        total: (regularStats.total || 0) + (regardingStats.total || 0),
                        pending: (regularStats.pending || 0) + (regardingStats.pending || 0),
                        in_progress: (regularStats.in_progress || 0) + (regardingStats.in_progress || 0),
                        resolved: (regularStats.resolved || 0) + (regardingStats.resolved || 0)
                    }
                }
            });
        }).catch(error => {
            res.status(500).json({ success: false, error: error.message });
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
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

// Start server
app.listen(PORT, () => {
    console.log(`=================================`);
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 API available at http://localhost:${PORT}/api`);
    console.log(`💚 Health check: http://localhost:${PORT}/api/health`);
    console.log(`📋 Regular Complaints: http://localhost:${PORT}/api/complaints/public`);
    console.log(`📋 Complaint Regarding: http://localhost:${PORT}/api/complaints/regarding/public`);
    console.log(`=================================`);
});

module.exports = app;