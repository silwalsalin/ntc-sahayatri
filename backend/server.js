// backend/server.js
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

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
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF, JPG, PNG, DOC files are allowed.'));
        }
    }
});

// Serve static files from uploads directory
app.use('/uploads', express.static(uploadDir));

// Database setup
const sqlite3 = require('sqlite3').verbose();
const dbPath = path.join(__dirname, 'database', 'complaints.db');

// Ensure database directory exists
const dbDir = path.join(__dirname, 'database');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database at:', dbPath);
        initializeDatabase();
    }
});

// Initialize database tables
function initializeDatabase() {
    // Regular Complaints Table
    const createComplaintsTable = `
        CREATE TABLE IF NOT EXISTS complaints (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            complaint_number TEXT UNIQUE NOT NULL,
            complaint_number_np TEXT UNIQUE NOT NULL,
            tracking_password TEXT NOT NULL,
            nature_of_complaint TEXT NOT NULL,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT NOT NULL,
            state TEXT,
            district TEXT,
            municipality TEXT,
            ward_no TEXT,
            street_address TEXT,
            description TEXT NOT NULL,
            status TEXT DEFAULT 'pending',
            priority TEXT DEFAULT 'medium',
            assigned_to TEXT,
            resolution TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            resolved_at DATETIME
        )
    `;

    // Regular Complaints Attachments Table
    const createAttachmentsTable = `
        CREATE TABLE IF NOT EXISTS attachments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            complaint_id INTEGER NOT NULL,
            filename TEXT NOT NULL,
            original_name TEXT NOT NULL,
            file_path TEXT NOT NULL,
            file_size INTEGER,
            mime_type TEXT,
            uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE
        )
    `;

    // Complaint Regarding Table
    const createComplaintRegardingTable = `
        CREATE TABLE IF NOT EXISTS complaint_regarding (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            complaint_number TEXT UNIQUE NOT NULL,
            complaint_number_np TEXT UNIQUE NOT NULL,
            tracking_password TEXT NOT NULL,
            complaint_type TEXT NOT NULL,
            subject TEXT NOT NULL,
            description TEXT NOT NULL,
            priority TEXT DEFAULT 'medium',
            name TEXT NOT NULL,
            email TEXT,
            phone TEXT NOT NULL,
            address TEXT,
            landmark TEXT,
            preferred_contact TEXT DEFAULT 'phone',
            reference_number TEXT,
            status TEXT DEFAULT 'pending',
            assigned_to TEXT,
            resolution TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            resolved_at DATETIME
        )
    `;

    // Complaint Regarding Attachments Table
    const createComplaintRegardingAttachmentsTable = `
        CREATE TABLE IF NOT EXISTS complaint_regarding_attachments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            complaint_id INTEGER NOT NULL,
            filename TEXT NOT NULL,
            original_name TEXT NOT NULL,
            file_path TEXT NOT NULL,
            file_size INTEGER,
            mime_type TEXT,
            uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (complaint_id) REFERENCES complaint_regarding(id) ON DELETE CASCADE
        )
    `;

    // Status History Table for Regular Complaints
    const createStatusHistoryTable = `
        CREATE TABLE IF NOT EXISTS complaint_status_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            complaint_id INTEGER NOT NULL,
            old_status TEXT,
            new_status TEXT NOT NULL,
            changed_by TEXT,
            notes TEXT,
            changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE
        )
    `;

    // Status History Table for Complaint Regarding
    const createComplaintRegardingStatusHistoryTable = `
        CREATE TABLE IF NOT EXISTS complaint_regarding_status_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            complaint_id INTEGER NOT NULL,
            old_status TEXT,
            new_status TEXT NOT NULL,
            changed_by TEXT,
            notes TEXT,
            changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (complaint_id) REFERENCES complaint_regarding(id) ON DELETE CASCADE
        )
    `;

    // Execute all table creations
    db.run(createComplaintsTable, (err) => {
        if (err) console.error('Error creating complaints table:', err);
        else console.log('✓ Complaints table ready');
    });

    db.run(createAttachmentsTable, (err) => {
        if (err) console.error('Error creating attachments table:', err);
        else console.log('✓ Attachments table ready');
    });

    db.run(createComplaintRegardingTable, (err) => {
        if (err) console.error('Error creating complaint_regarding table:', err);
        else console.log('✓ Complaint Regarding table ready');
    });

    db.run(createComplaintRegardingAttachmentsTable, (err) => {
        if (err) console.error('Error creating complaint_regarding_attachments table:', err);
        else console.log('✓ Complaint Regarding Attachments table ready');
    });

    db.run(createStatusHistoryTable, (err) => {
        if (err) console.error('Error creating status history table:', err);
        else console.log('✓ Status history table ready');
    });

    db.run(createComplaintRegardingStatusHistoryTable, (err) => {
        if (err) console.error('Error creating complaint_regarding_status_history table:', err);
        else console.log('✓ Complaint Regarding Status History table ready');
    });
}

// Helper functions
function generateComplaintNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `NTC-${year}${month}${day}${hours}${minutes}${seconds}-${random}`;
}

function generateComplaintNumberNp() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `एनटीसी-${year}${month}${day}${hours}${minutes}${seconds}-${random}`;
}

function generateTrackingPassword() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

// ==================== REGULAR COMPLAINTS API ROUTES ====================

// Submit regular complaint
app.post('/api/complaints', upload.single('attachment'), (req, res) => {
    try {
        console.log('Received regular complaint submission:', req.body);
        
        const complaintData = req.body;
        const file = req.file;
        
        // Validate required fields
        if (!complaintData.natureOfComplaint || !complaintData.name || !complaintData.email || !complaintData.phone || !complaintData.description) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }
        
        const complaintNumber = generateComplaintNumber();
        const complaintNumberNp = generateComplaintNumberNp();
        const trackingPassword = generateTrackingPassword();
        
        const sql = `
            INSERT INTO complaints (
                complaint_number, complaint_number_np, tracking_password,
                nature_of_complaint, name, email, phone, state, district,
                municipality, ward_no, street_address, description, priority
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const params = [
            complaintNumber,
            complaintNumberNp,
            trackingPassword,
            complaintData.natureOfComplaint,
            complaintData.name,
            complaintData.email,
            complaintData.phone,
            complaintData.state || null,
            complaintData.district || null,
            complaintData.municipality || null,
            complaintData.wardNo || null,
            complaintData.streetAddress || null,
            complaintData.description,
            complaintData.priority || 'medium'
        ];
        
        db.run(sql, params, function(err) {
            if (err) {
                console.error('Database insert error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to save complaint',
                    error: err.message
                });
            }
            
            const complaintId = this.lastID;
            
            if (file) {
                const attachSql = `
                    INSERT INTO attachments (complaint_id, filename, original_name, file_path, file_size, mime_type)
                    VALUES (?, ?, ?, ?, ?, ?)
                `;
                db.run(attachSql, [
                    complaintId,
                    file.filename,
                    file.originalname,
                    file.path,
                    file.size,
                    file.mimetype
                ]);
            }
            
            res.status(201).json({
                success: true,
                data: {
                    id: complaintId,
                    complaintNumber,
                    complaintNumberNp,
                    trackingPassword
                },
                message: 'Complaint submitted successfully'
            });
        });
        
    } catch (error) {
        console.error('Error submitting complaint:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit complaint',
            error: error.message
        });
    }
});

// Get public complaints (limited info)
app.get('/api/complaints/public', (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const sql = `
            SELECT id, name, email, phone, description, status, priority, 
                   complaint_number, created_at
            FROM complaints 
            ORDER BY created_at DESC
            LIMIT ?
        `;
        
        db.all(sql, [limit], (err, rows) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to fetch complaints',
                    error: err.message
                });
            }
            
            res.json({
                success: true,
                data: rows || [],
                count: rows ? rows.length : 0
            });
        });
        
    } catch (error) {
        console.error('Error fetching public complaints:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch complaints',
            error: error.message
        });
    }
});

// Track complaint by number and password
app.post('/api/complaints/track', (req, res) => {
    try {
        const { complaintNumber, password } = req.body;
        
        if (!complaintNumber || !password) {
            return res.status(400).json({
                success: false,
                message: 'Complaint number and password are required'
            });
        }
        
        const sql = `
            SELECT * FROM complaints 
            WHERE (complaint_number = ? OR complaint_number_np = ?) 
            AND tracking_password = ?
        `;
        
        db.get(sql, [complaintNumber, complaintNumber, password], (err, row) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to track complaint',
                    error: err.message
                });
            }
            
            if (!row) {
                return res.status(404).json({
                    success: false,
                    message: 'Invalid complaint number or password'
                });
            }
            
            // Remove sensitive information
            delete row.tracking_password;
            
            res.json({
                success: true,
                data: row
            });
        });
        
    } catch (error) {
        console.error('Error tracking complaint:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to track complaint',
            error: error.message
        });
    }
});

// Get complaint statistics
app.get('/api/complaints/stats', (req, res) => {
    try {
        const sql = `
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'in-progress' THEN 1 ELSE 0 END) as in_progress,
                SUM(CASE WHEN status = 'review' THEN 1 ELSE 0 END) as review,
                SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved
            FROM complaints
        `;
        
        db.get(sql, [], (err, row) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to fetch statistics',
                    error: err.message
                });
            }
            
            res.json({
                success: true,
                data: row || {}
            });
        });
        
    } catch (error) {
        console.error('Error fetching statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch statistics',
            error: error.message
        });
    }
});

// ==================== COMPLAINT REGARDING API ROUTES ====================

// Submit complaint regarding
app.post('/api/complaints/regarding', upload.array('attachments', 5), (req, res) => {
    try {
        console.log('Received complaint regarding submission:', req.body);
        
        const complaintData = req.body;
        const files = req.files || [];
        
        // Validate required fields
        if (!complaintData.complaintType || !complaintData.subject || !complaintData.name || !complaintData.phone || !complaintData.description) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: complaintType, subject, name, phone, description are required'
            });
        }
        
        const complaintNumber = generateComplaintNumber();
        const complaintNumberNp = generateComplaintNumberNp();
        const trackingPassword = generateTrackingPassword();
        
        const sql = `
            INSERT INTO complaint_regarding (
                complaint_number, complaint_number_np, tracking_password,
                complaint_type, subject, description, priority, name, email, phone,
                address, landmark, preferred_contact, reference_number
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const params = [
            complaintNumber,
            complaintNumberNp,
            trackingPassword,
            complaintData.complaintType,
            complaintData.subject,
            complaintData.description,
            complaintData.priority || 'medium',
            complaintData.name,
            complaintData.email || null,
            complaintData.phone,
            complaintData.address || null,
            complaintData.landmark || null,
            complaintData.preferredContact || 'phone',
            complaintData.referenceNumber || null
        ];
        
        db.run(sql, params, function(err) {
            if (err) {
                console.error('Database insert error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to save complaint to database',
                    error: err.message
                });
            }
            
            const complaintId = this.lastID;
            
            // Save attachments
            if (files && files.length > 0) {
                files.forEach(file => {
                    const attachSql = `
                        INSERT INTO complaint_regarding_attachments 
                        (complaint_id, filename, original_name, file_path, file_size, mime_type)
                        VALUES (?, ?, ?, ?, ?, ?)
                    `;
                    db.run(attachSql, [
                        complaintId,
                        file.filename,
                        file.originalname,
                        file.path,
                        file.size,
                        file.mimetype
                    ]);
                });
            }
            
            res.status(201).json({
                success: true,
                data: {
                    id: complaintId,
                    complaintNumber,
                    complaintNumberNp,
                    trackingPassword
                },
                message: 'Complaint submitted successfully'
            });
        });
        
    } catch (error) {
        console.error('Error submitting complaint:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit complaint',
            error: error.message
        });
    }
});

// Get all complaints regarding (Admin)
app.get('/api/admin/complaints/regarding', (req, res) => {
    try {
        let sql = `
            SELECT id, complaint_number, complaint_number_np, name, email, phone,
                   subject, complaint_type, priority, status, created_at, resolved_at,
                   reference_number, preferred_contact, description, address, landmark
            FROM complaint_regarding
            WHERE 1=1
        `;
        const params = [];
        
        if (req.query.status && req.query.status !== 'all') {
            sql += ' AND status = ?';
            params.push(req.query.status);
        }
        
        if (req.query.priority && req.query.priority !== 'all') {
            sql += ' AND priority = ?';
            params.push(req.query.priority);
        }
        
        if (req.query.complaintType && req.query.complaintType !== 'all') {
            sql += ' AND complaint_type = ?';
            params.push(req.query.complaintType);
        }
        
        if (req.query.search) {
            sql += ` AND (name LIKE ? OR email LIKE ? OR phone LIKE ? OR complaint_number LIKE ? OR subject LIKE ?)`;
            const searchTerm = `%${req.query.search}%`;
            params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
        }
        
        sql += ' ORDER BY created_at DESC';
        
        db.all(sql, params, (err, rows) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to fetch complaints',
                    error: err.message
                });
            }
            
            res.json({
                success: true,
                data: rows || [],
                count: rows ? rows.length : 0
            });
        });
        
    } catch (error) {
        console.error('Error fetching complaints:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch complaints',
            error: error.message
        });
    }
});

// Get single complaint regarding by ID
app.get('/api/admin/complaints/regarding/:id', (req, res) => {
    try {
        const sql = `SELECT * FROM complaint_regarding WHERE id = ?`;
        
        db.get(sql, [req.params.id], (err, row) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to fetch complaint',
                    error: err.message
                });
            }
            
            if (!row) {
                return res.status(404).json({
                    success: false,
                    message: 'Complaint not found'
                });
            }
            
            res.json({
                success: true,
                data: row
            });
        });
        
    } catch (error) {
        console.error('Error fetching complaint:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch complaint',
            error: error.message
        });
    }
});

// Update complaint regarding status
app.patch('/api/admin/complaints/regarding/:id/status', (req, res) => {
    try {
        const { status, resolution } = req.body;
        
        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Status is required'
            });
        }
        
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
        
        const sql = `UPDATE complaint_regarding SET ${updateFields.join(', ')} WHERE id = ?`;
        
        db.run(sql, params, function(err) {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to update status',
                    error: err.message
                });
            }
            
            if (this.changes === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Complaint not found'
                });
            }
            
            res.json({
                success: true,
                message: 'Status updated successfully'
            });
        });
        
    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update status',
            error: error.message
        });
    }
});

// Delete complaint regarding
app.delete('/api/admin/complaints/regarding/:id', (req, res) => {
    try {
        const sql = `DELETE FROM complaint_regarding WHERE id = ?`;
        
        db.run(sql, [req.params.id], function(err) {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to delete complaint',
                    error: err.message
                });
            }
            
            if (this.changes === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Complaint not found'
                });
            }
            
            res.json({
                success: true,
                message: 'Complaint deleted successfully'
            });
        });
        
    } catch (error) {
        console.error('Error deleting complaint:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete complaint',
            error: error.message
        });
    }
});

// Get complaint regarding statistics
app.get('/api/complaints/regarding/stats', (req, res) => {
    try {
        const sql = `
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'in-progress' THEN 1 ELSE 0 END) as in_progress,
                SUM(CASE WHEN status = 'review' THEN 1 ELSE 0 END) as review,
                SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved,
                SUM(CASE WHEN priority = 'high' THEN 1 ELSE 0 END) as high_priority,
                SUM(CASE WHEN priority = 'medium' THEN 1 ELSE 0 END) as medium_priority,
                SUM(CASE WHEN priority = 'low' THEN 1 ELSE 0 END) as low_priority
            FROM complaint_regarding
        `;
        
        db.get(sql, [], (err, row) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to fetch statistics',
                    error: err.message
                });
            }
            
            res.json({
                success: true,
                data: row || {}
            });
        });
        
    } catch (error) {
        console.error('Error fetching statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch statistics',
            error: error.message
        });
    }
});

// ==================== ADMIN ROUTES FOR REGULAR COMPLAINTS ====================

// Get all regular complaints (Admin)
app.get('/api/admin/complaints', (req, res) => {
    try {
        let sql = `
            SELECT id, complaint_number, complaint_number_np, name, email, phone,
                   nature_of_complaint, priority, status, created_at, resolved_at,
                   description
            FROM complaints
            WHERE 1=1
        `;
        const params = [];
        
        if (req.query.status && req.query.status !== 'all') {
            sql += ' AND status = ?';
            params.push(req.query.status);
        }
        
        if (req.query.priority && req.query.priority !== 'all') {
            sql += ' AND priority = ?';
            params.push(req.query.priority);
        }
        
        if (req.query.search) {
            sql += ` AND (name LIKE ? OR email LIKE ? OR phone LIKE ? OR complaint_number LIKE ?)`;
            const searchTerm = `%${req.query.search}%`;
            params.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }
        
        sql += ' ORDER BY created_at DESC';
        
        db.all(sql, params, (err, rows) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to fetch complaints',
                    error: err.message
                });
            }
            
            res.json({
                success: true,
                data: rows || [],
                count: rows ? rows.length : 0
            });
        });
        
    } catch (error) {
        console.error('Error fetching complaints:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch complaints',
            error: error.message
        });
    }
});

// Get single regular complaint by ID
app.get('/api/admin/complaints/:id', (req, res) => {
    try {
        const sql = `SELECT * FROM complaints WHERE id = ?`;
        
        db.get(sql, [req.params.id], (err, row) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to fetch complaint',
                    error: err.message
                });
            }
            
            if (!row) {
                return res.status(404).json({
                    success: false,
                    message: 'Complaint not found'
                });
            }
            
            res.json({
                success: true,
                data: row
            });
        });
        
    } catch (error) {
        console.error('Error fetching complaint:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch complaint',
            error: error.message
        });
    }
});

// Update regular complaint status
app.patch('/api/admin/complaints/:id/status', (req, res) => {
    try {
        const { status, resolution } = req.body;
        
        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Status is required'
            });
        }
        
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
        
        const sql = `UPDATE complaints SET ${updateFields.join(', ')} WHERE id = ?`;
        
        db.run(sql, params, function(err) {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to update status',
                    error: err.message
                });
            }
            
            if (this.changes === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Complaint not found'
                });
            }
            
            res.json({
                success: true,
                message: 'Status updated successfully'
            });
        });
        
    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update status',
            error: error.message
        });
    }
});

// Delete regular complaint
app.delete('/api/admin/complaints/:id', (req, res) => {
    try {
        const sql = `DELETE FROM complaints WHERE id = ?`;
        
        db.run(sql, [req.params.id], function(err) {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to delete complaint',
                    error: err.message
                });
            }
            
            if (this.changes === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Complaint not found'
                });
            }
            
            res.json({
                success: true,
                message: 'Complaint deleted successfully'
            });
        });
        
    } catch (error) {
        console.error('Error deleting complaint:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete complaint',
            error: error.message
        });
    }
});

// ==================== HEALTH CHECK ====================

app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        status: 'OK',
        timestamp: new Date().toISOString(),
        message: 'Server is running'
    });
});

// ==================== ERROR HANDLING ====================

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    
    if (err instanceof multer.MulterError) {
        if (err.code === 'FILE_TOO_LARGE') {
            return res.status(400).json({
                success: false,
                message: 'File is too large. Maximum size is 5MB.'
            });
        }
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }
    
    res.status(500).json({
        success: false,
        message: err.message || 'Internal server error'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `Cannot find ${req.originalUrl} on this server`
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`=================================`);
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 API available at http://localhost:${PORT}/api`);
    console.log(`💚 Health check: http://localhost:${PORT}/api/health`);
    console.log(`📋 Regular Complaints API: http://localhost:${PORT}/api/complaints`);
    console.log(`📋 Complaint Regarding API: http://localhost:${PORT}/api/complaints/regarding`);
    console.log(`=================================`);
});

module.exports = app;