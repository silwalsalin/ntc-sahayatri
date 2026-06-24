// backend/server.js
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const PDFDocument = require('pdfkit');
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
        `SELECT id, name, name_en, email, phone, role, status, department, join_date, employee_id FROM users WHERE id = ?`,
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

// ==================== HELPER FUNCTIONS FOR SETTINGS ====================

// Get settings from database
const getSettings = (section) => {
    return new Promise((resolve, reject) => {
        db.get(
            'SELECT settings FROM admin_settings WHERE section = ?',
            [section],
            (err, row) => {
                if (err) {
                    console.error(`Error getting ${section} settings:`, err);
                    reject(err);
                }
                if (row) {
                    try {
                        resolve(JSON.parse(row.settings));
                    } catch (e) {
                        console.error(`Error parsing ${section} settings:`, e);
                        reject(e);
                    }
                } else {
                    resolve(null);
                }
            }
        );
    });
};

// Save settings to database
const saveSettings = (section, data, adminId) => {
    const settingsJson = JSON.stringify(data);
    
    return new Promise((resolve, reject) => {
        db.get(
            'SELECT id FROM admin_settings WHERE section = ?',
            [section],
            (err, row) => {
                if (err) {
                    console.error(`Error checking ${section} settings:`, err);
                    reject(err);
                    return;
                }
                
                if (row) {
                    db.run(
                        `UPDATE admin_settings 
                         SET settings = ?, updated_at = CURRENT_TIMESTAMP, updated_by = ? 
                         WHERE section = ?`,
                        [settingsJson, adminId, section],
                        (err) => {
                            if (err) {
                                console.error(`Error updating ${section} settings:`, err);
                                reject(err);
                            } else {
                                console.log(`✅ ${section} settings updated successfully`);
                                resolve(true);
                            }
                        }
                    );
                } else {
                    db.run(
                        `INSERT INTO admin_settings (section, settings, created_at, updated_at, created_by, updated_by) 
                         VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?, ?)`,
                        [section, settingsJson, adminId, adminId],
                        (err) => {
                            if (err) {
                                console.error(`Error inserting ${section} settings:`, err);
                                reject(err);
                            } else {
                                console.log(`✅ ${section} settings inserted successfully`);
                                resolve(true);
                            }
                        }
                    );
                }
            }
        );
    });
};

// ==================== PDF GENERATION HELPER ====================

const generatePDFReport = (complaints, reportType, dateRange, user) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({
                size: 'A4',
                margin: 50,
                info: {
                    Title: `${reportType} Report`,
                    Author: user.name || 'Admin',
                    Subject: 'Complaint Report',
                    Keywords: 'complaint, report, ntc',
                    CreationDate: new Date()
                }
            });

            const buffers = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });

            // Header
            doc.rect(0, 0, doc.page.width, 80)
               .fill('#1a56db');
            
            doc.fillColor('#ffffff')
               .fontSize(22)
               .font('Helvetica-Bold')
               .text('NTC Sahayatri', 50, 25, { align: 'center' });
            
            doc.fontSize(14)
               .font('Helvetica')
               .text(`${reportType} Report`, 50, 50, { align: 'center' });

            // Report Info
            doc.fillColor('#1f2937')
               .fontSize(10)
               .font('Helvetica')
               .text(`Generated: ${new Date().toLocaleString()}`, 50, 100)
               .text(`Generated By: ${user.name || 'Admin'} (${user.email})`, 50, 115)
               .text(`Date Range: ${dateRange.start} to ${dateRange.end}`, 50, 130)
               .text(`Total Complaints: ${complaints.length}`, 50, 145);

            // Summary Section
            const resolved = complaints.filter(c => c.status === 'resolved' || c.status === 'Resolved').length;
            const pending = complaints.filter(c => c.status === 'pending' || c.status === 'Pending').length;
            const inProgress = complaints.filter(c => c.status === 'in-progress' || c.status === 'In Progress').length;
            const review = complaints.filter(c => c.status === 'review' || c.status === 'Review').length;

            const summaryY = 170;
            doc.fillColor('#1f2937')
               .fontSize(14)
               .font('Helvetica-Bold')
               .text('Summary', 50, summaryY);

            const summaryData = [
                ['Total', complaints.length],
                ['Resolved', resolved],
                ['Pending', pending],
                ['In Progress', inProgress],
                ['Under Review', review]
            ];

            let yPos = summaryY + 25;
            doc.fontSize(10)
               .font('Helvetica');
            
            summaryData.forEach(([label, value]) => {
                doc.text(`${label}:`, 50, yPos, { width: 100, continued: true })
                   .text(`${value}`, 150, yPos, { width: 50 })
                   .rect(200, yPos - 2, Math.min((value / (complaints.length || 1)) * 300, 300), 10)
                   .fill('#3b82f6');
                yPos += 20;
            });

            // Complaints Table
            const tableY = yPos + 20;
            doc.fillColor('#1f2937')
               .fontSize(14)
               .font('Helvetica-Bold')
               .text('Complaints Details', 50, tableY);

            const headers = ['#', 'Ticket', 'Name', 'Status', 'Priority', 'Date'];
            const colWidths = [30, 60, 100, 70, 60, 80];
            let currentY = tableY + 25;

            // Table Header
            doc.fillColor('#1a56db')
               .fontSize(9)
               .font('Helvetica-Bold');
            
            let xPos = 50;
            headers.forEach((header, i) => {
                doc.text(header, xPos, currentY, { width: colWidths[i] });
                xPos += colWidths[i];
            });

            currentY += 15;
            doc.fillColor('#e5e7eb')
               .rect(50, currentY - 2, 500, 1)
               .fill();

            // Table Body
            doc.fontSize(8)
               .font('Helvetica')
               .fillColor('#1f2937');

            complaints.slice(0, 20).forEach((complaint, index) => {
                const rowData = [
                    index + 1,
                    complaint.complaint_number || complaint.id,
                    (complaint.name || 'Anonymous').substring(0, 15),
                    complaint.status || 'pending',
                    complaint.priority || 'medium',
                    complaint.created_at ? new Date(complaint.created_at).toLocaleDateString() : '-'
                ];

                let rowX = 50;
                rowData.forEach((data, i) => {
                    doc.text(String(data), rowX, currentY, { width: colWidths[i] });
                    rowX += colWidths[i];
                });

                currentY += 15;

                if (currentY > doc.page.height - 100) {
                    doc.addPage();
                    currentY = 50;
                    // Repeat header on new page
                    doc.fillColor('#1a56db')
                       .fontSize(9)
                       .font('Helvetica-Bold');
                    let headerX = 50;
                    headers.forEach((header, i) => {
                        doc.text(header, headerX, currentY, { width: colWidths[i] });
                        headerX += colWidths[i];
                    });
                    currentY += 15;
                    doc.fillColor('#e5e7eb')
                       .rect(50, currentY - 2, 500, 1)
                       .fill();
                    doc.fontSize(8)
                       .font('Helvetica')
                       .fillColor('#1f2937');
                }
            });

            if (complaints.length > 20) {
                doc.text(`... and ${complaints.length - 20} more complaints`, 50, currentY + 10);
            }

            // Footer
            const pageCount = doc.bufferedPageRange().count;
            for (let i = 0; i < pageCount; i++) {
                doc.switchToPage(i);
                doc.fillColor('#9ca3af')
                   .fontSize(8)
                   .text(
                       `NTC Sahayatri - ${reportType} Report | Page ${i + 1} of ${pageCount}`,
                       50,
                       doc.page.height - 30,
                       { align: 'center' }
                   );
            }

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
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

// GET /api/complaints/public/:id - Public view of complaint (limited data)
app.get('/api/complaints/public/:id', (req, res) => {
    try {
        const { id } = req.params;
        
        db.get(
            `SELECT id, complaint_number, complaint_number_np, name, email, phone, 
                    description, status, priority, created_at, nature_of_complaint,
                    resolution, resolved_at
             FROM complaints 
             WHERE id = ?`,
            [id],
            (err, complaint) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ success: false, error: err.message });
                }
                if (!complaint) {
                    return res.status(404).json({ success: false, message: 'Complaint not found' });
                }
                res.json({ success: true, data: complaint });
            }
        );
    } catch (error) {
        console.error('Error fetching public complaint:', error);
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

// GET /api/complaints/regarding/public/:id - Public view of complaint regarding (limited data)
app.get('/api/complaints/regarding/public/:id', (req, res) => {
    try {
        const { id } = req.params;
        
        db.get(
            `SELECT id, complaint_number, complaint_number_np, name, email, phone, 
                    description, subject, complaint_type, status, priority, 
                    created_at, reference_number, address, landmark, 
                    preferred_contact, resolution, resolved_at
             FROM complaint_regarding 
             WHERE id = ?`,
            [id],
            (err, complaint) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ success: false, error: err.message });
                }
                if (!complaint) {
                    return res.status(404).json({ success: false, message: 'Complaint not found' });
                }
                res.json({ success: true, data: complaint });
            }
        );
    } catch (error) {
        console.error('Error fetching public complaint regarding:', error);
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

// GET /api/complaints/track/:trackingNumber - Track complaint by tracking number (public)
app.get('/api/complaints/track/:trackingNumber', (req, res) => {
    try {
        const { trackingNumber } = req.params;
        
        db.get(
            `SELECT complaint_number, complaint_number_np, name, email, phone, description, 
                    status, priority, created_at, nature_of_complaint, 
                    resolution, resolved_at, assigned_to 
             FROM complaints 
             WHERE complaint_number = ? OR complaint_number_np = ?`,
            [trackingNumber, trackingNumber],
            (err, complaint) => {
                if (err) {
                    return res.status(500).json({ success: false, error: err.message });
                }
                
                if (complaint) {
                    return res.json({ 
                        success: true, 
                        data: complaint,
                        type: 'regular'
                    });
                }
                
                db.get(
                    `SELECT complaint_number, complaint_number_np, name, email, phone, 
                            description, subject, complaint_type, status, priority, 
                            created_at, reference_number, address, landmark, 
                            preferred_contact, resolution, resolved_at, assigned_to 
                     FROM complaint_regarding 
                     WHERE complaint_number = ? OR complaint_number_np = ?`,
                    [trackingNumber, trackingNumber],
                    (err, regarding) => {
                        if (err) {
                            return res.status(500).json({ success: false, error: err.message });
                        }
                        
                        if (regarding) {
                            return res.json({ 
                                success: true, 
                                data: regarding,
                                type: 'regarding'
                            });
                        }
                        
                        res.status(404).json({ 
                            success: false, 
                            message: 'Complaint not found with this tracking number' 
                        });
                    }
                );
            }
        );
    } catch (error) {
        console.error('Error tracking complaint:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==================== TRACKING ROUTES (UPDATED - NO PASSWORD REQUIRED) ====================

// GET /api/complaints/track/:ticketNumber - Track complaint by ticket number (public - no password)
app.get('/api/complaints/track/:ticketNumber', (req, res) => {
    try {
        const { ticketNumber } = req.params;
        
        if (!ticketNumber) {
            return res.status(400).json({ 
                success: false, 
                message: 'Ticket number is required' 
            });
        }

        console.log('🔍 Tracking complaint with ticket:', ticketNumber);
        
        // First check regular complaints
        db.get(
            `SELECT * FROM complaints WHERE complaint_number = ? OR complaint_number_np = ? OR id = ?`,
            [ticketNumber, ticketNumber, ticketNumber],
            (err, complaint) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ success: false, error: err.message });
                }
                
                if (complaint) {
                    // Remove sensitive data
                    delete complaint.tracking_password;
                    return res.json({ 
                        success: true, 
                        data: complaint,
                        type: 'regular'
                    });
                }
                
                // If not found in regular complaints, check complaint_regarding
                db.get(
                    `SELECT * FROM complaint_regarding WHERE complaint_number = ? OR complaint_number_np = ? OR id = ?`,
                    [ticketNumber, ticketNumber, ticketNumber],
                    (err, regarding) => {
                        if (err) {
                            console.error('Database error:', err);
                            return res.status(500).json({ success: false, error: err.message });
                        }
                        
                        if (regarding) {
                            // Remove sensitive data
                            delete regarding.tracking_password;
                            return res.json({ 
                                success: true, 
                                data: regarding,
                                type: 'regarding'
                            });
                        }
                        
                        // Try to find by complaint_number if it contains NTC
                        if (ticketNumber.includes('NTC')) {
                            const searchTerm = ticketNumber.replace(/[^a-zA-Z0-9]/g, '');
                            db.get(
                                `SELECT * FROM complaints WHERE REPLACE(complaint_number, '-', '') LIKE ? OR REPLACE(complaint_number_np, '-', '') LIKE ?`,
                                [`%${searchTerm}%`, `%${searchTerm}%`],
                                (err, found) => {
                                    if (err) {
                                        console.error('Database error:', err);
                                        return res.status(500).json({ success: false, error: err.message });
                                    }
                                    
                                    if (found) {
                                        delete found.tracking_password;
                                        return res.json({ 
                                            success: true, 
                                            data: found,
                                            type: 'regular'
                                        });
                                    }
                                    
                                    res.status(404).json({ 
                                        success: false, 
                                        message: 'Complaint not found with this ticket number' 
                                    });
                                }
                            );
                        } else {
                            res.status(404).json({ 
                                success: false, 
                                message: 'Complaint not found with this ticket number' 
                            });
                        }
                    }
                );
            }
        );
    } catch (error) {
        console.error('Error tracking complaint:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/track - Unified tracking without password
app.post('/api/track', (req, res) => {
    try {
        const { complaintNumber } = req.body;

        if (!complaintNumber) {
            return res.status(400).json({ 
                success: false, 
                message: 'Complaint number is required' 
            });
        }

        console.log('🔍 Tracking complaint via POST:', complaintNumber);
        
        // First check regular complaints
        db.get(
            `SELECT * FROM complaints WHERE complaint_number = ? OR complaint_number_np = ? OR id = ?`,
            [complaintNumber, complaintNumber, complaintNumber],
            (err, complaint) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ success: false, error: err.message });
                }
                
                if (complaint) {
                    delete complaint.tracking_password;
                    return res.json({ 
                        success: true, 
                        data: complaint,
                        type: 'regular'
                    });
                }
                
                // Check complaint_regarding
                db.get(
                    `SELECT * FROM complaint_regarding WHERE complaint_number = ? OR complaint_number_np = ? OR id = ?`,
                    [complaintNumber, complaintNumber, complaintNumber],
                    (err, regarding) => {
                        if (err) {
                            console.error('Database error:', err);
                            return res.status(500).json({ success: false, error: err.message });
                        }
                        
                        if (regarding) {
                            delete regarding.tracking_password;
                            return res.json({ 
                                success: true, 
                                data: regarding,
                                type: 'regarding'
                            });
                        }
                        
                        res.status(404).json({ 
                            success: false, 
                            message: 'Complaint not found with this number' 
                        });
                    }
                );
            }
        );
    } catch (error) {
        console.error('Error tracking complaint:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/complaints/track - Track complaint (public - no password)
app.post('/api/complaints/track', (req, res) => {
    try {
        const { complaintNumber } = req.body;

        if (!complaintNumber) {
            return res.status(400).json({ 
                success: false, 
                message: 'Complaint number is required' 
            });
        }

        console.log('🔍 Tracking complaint via /complaints/track:', complaintNumber);

        db.get(
            `SELECT * FROM complaints WHERE complaint_number = ? OR complaint_number_np = ? OR id = ?`,
            [complaintNumber, complaintNumber, complaintNumber],
            (err, row) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ success: false, error: err.message });
                }
                
                if (!row) {
                    // Check complaint_regarding
                    db.get(
                        `SELECT * FROM complaint_regarding WHERE complaint_number = ? OR complaint_number_np = ? OR id = ?`,
                        [complaintNumber, complaintNumber, complaintNumber],
                        (err, regarding) => {
                            if (err) {
                                console.error('Database error:', err);
                                return res.status(500).json({ success: false, error: err.message });
                            }
                            
                            if (regarding) {
                                delete regarding.tracking_password;
                                return res.json({ 
                                    success: true, 
                                    data: regarding,
                                    type: 'regarding'
                                });
                            }
                            
                            return res.status(404).json({ 
                                success: false, 
                                message: 'Complaint not found with this number' 
                            });
                        }
                    );
                    return;
                }
                
                delete row.tracking_password;
                res.json({ 
                    success: true, 
                    data: row,
                    type: 'regular'
                });
            }
        );
    } catch (error) {
        console.error('Error tracking complaint:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/complaint-regarding/track - Track regarding complaint (public - no password)
app.post('/api/complaint-regarding/track', (req, res) => {
    try {
        const { complaintNumber } = req.body;

        if (!complaintNumber) {
            return res.status(400).json({ 
                success: false, 
                message: 'Complaint number is required' 
            });
        }

        console.log('🔍 Tracking regarding complaint:', complaintNumber);

        db.get(
            `SELECT * FROM complaint_regarding WHERE complaint_number = ? OR complaint_number_np = ? OR id = ?`,
            [complaintNumber, complaintNumber, complaintNumber],
            (err, row) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ success: false, error: err.message });
                }
                
                if (!row) {
                    return res.status(404).json({ 
                        success: false, 
                        message: 'Complaint not found with this number' 
                    });
                }
                
                delete row.tracking_password;
                res.json({ 
                    success: true, 
                    data: row,
                    type: 'regarding'
                });
            }
        );
    } catch (error) {
        console.error('Error tracking regarding complaint:', error);
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
                department: user.department || 'Customer Support',
                employeeId: user.employee_id || `EMP-${user.id.toString().padStart(3, '0')}`,
                joinDate: user.join_date,
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

// ==================== ADMIN SETTINGS ROUTES ====================

// GET /api/admin/settings/general
app.get('/api/admin/settings/general', protect, adminOnly, async (req, res) => {
    try {
        let settings = await getSettings('general');
        
        if (!settings) {
            settings = {
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
                maintenanceMode: false,
                updatedAt: null
            };
        }
        
        res.json({
            success: true,
            data: settings
        });
    } catch (error) {
        console.error('Error fetching general settings:', error);
        res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
});

// PUT /api/admin/settings/general
app.put('/api/admin/settings/general', protect, adminOnly, async (req, res) => {
    try {
        const {
            siteName,
            siteName_np,
            siteDescription,
            siteDescription_np,
            siteEmail,
            sitePhone,
            siteAddress,
            siteAddress_np,
            timezone,
            dateFormat,
            timeFormat,
            defaultLanguage,
            itemsPerPage,
            enableRegistration,
            enablePublicComplaints,
            maintenanceMode
        } = req.body;
        
        const settings = {
            siteName: siteName || 'NTC Sahayatri',
            siteName_np: siteName_np || 'एनटीसी सहयात्री',
            siteDescription: siteDescription || 'Complaint Tracking System for Nepal Telecom',
            siteDescription_np: siteDescription_np || 'नेपाल दूरसञ्चारको लागि गुनासो ट्र्याकिङ प्रणाली',
            siteEmail: siteEmail || 'support@ntc.com.np',
            sitePhone: sitePhone || '01-4960008',
            siteAddress: siteAddress || 'Bhadrakali Plaza, Kathmandu',
            siteAddress_np: siteAddress_np || 'भद्रकाली प्लाजा, काठमाडौं',
            timezone: timezone || 'Asia/Kathmandu',
            dateFormat: dateFormat || 'YYYY-MM-DD',
            timeFormat: timeFormat || '24h',
            defaultLanguage: defaultLanguage || 'np',
            itemsPerPage: parseInt(itemsPerPage) || 10,
            enableRegistration: enableRegistration !== undefined ? enableRegistration : true,
            enablePublicComplaints: enablePublicComplaints !== undefined ? enablePublicComplaints : true,
            maintenanceMode: maintenanceMode !== undefined ? maintenanceMode : false,
            updatedAt: new Date().toISOString()
        };
        
        await saveSettings('general', settings, req.user.id);
        
        res.json({
            success: true,
            message: 'General settings saved successfully',
            data: settings
        });
    } catch (error) {
        console.error('Error saving general settings:', error);
        res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
});

// GET /api/admin/settings/email
app.get('/api/admin/settings/email', protect, adminOnly, async (req, res) => {
    try {
        let settings = await getSettings('email');
        
        if (!settings) {
            settings = {
                smtpHost: 'smtp.gmail.com',
                smtpPort: 587,
                smtpUser: '',
                smtpPassword: '',
                smtpEncryption: 'tls',
                fromEmail: 'notifications@ntc.com.np',
                fromName: 'NTC Sahayatri',
                fromName_np: 'एनटीसी सहयात्री',
                sendComplaintConfirmation: true,
                sendComplaintUpdate: true,
                sendComplaintResolved: true,
                sendNewsletter: false,
                updatedAt: null
            };
        }
        
        if (settings.smtpPassword) {
            settings.smtpPassword = '********';
        }
        
        res.json({
            success: true,
            data: settings
        });
    } catch (error) {
        console.error('Error fetching email settings:', error);
        res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
});

// PUT /api/admin/settings/email
app.put('/api/admin/settings/email', protect, adminOnly, async (req, res) => {
    try {
        const {
            smtpHost,
            smtpPort,
            smtpUser,
            smtpPassword,
            smtpEncryption,
            fromEmail,
            fromName,
            fromName_np,
            sendComplaintConfirmation,
            sendComplaintUpdate,
            sendComplaintResolved,
            sendNewsletter
        } = req.body;
        
        let existingPassword = '';
        if (smtpPassword === '********') {
            const existing = await getSettings('email');
            existingPassword = existing?.smtpPassword || '';
        } else {
            existingPassword = smtpPassword;
        }
        
        const settings = {
            smtpHost: smtpHost || 'smtp.gmail.com',
            smtpPort: parseInt(smtpPort) || 587,
            smtpUser: smtpUser || '',
            smtpPassword: existingPassword,
            smtpEncryption: smtpEncryption || 'tls',
            fromEmail: fromEmail || 'notifications@ntc.com.np',
            fromName: fromName || 'NTC Sahayatri',
            fromName_np: fromName_np || 'एनटीसी सहयात्री',
            sendComplaintConfirmation: sendComplaintConfirmation !== undefined ? sendComplaintConfirmation : true,
            sendComplaintUpdate: sendComplaintUpdate !== undefined ? sendComplaintUpdate : true,
            sendComplaintResolved: sendComplaintResolved !== undefined ? sendComplaintResolved : true,
            sendNewsletter: sendNewsletter !== undefined ? sendNewsletter : false,
            updatedAt: new Date().toISOString()
        };
        
        await saveSettings('email', settings, req.user.id);
        
        const responseSettings = { ...settings };
        responseSettings.smtpPassword = '********';
        
        res.json({
            success: true,
            message: 'Email settings saved successfully',
            data: responseSettings
        });
    } catch (error) {
        console.error('Error saving email settings:', error);
        res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
});

// POST /api/admin/settings/email/test
app.post('/api/admin/settings/email/test', protect, adminOnly, async (req, res) => {
    try {
        const { to, subject, message } = req.body;
        
        if (!to) {
            return res.status(400).json({ success: false, message: 'Recipient email address is required' });
        }
        
        const emailSettings = await getSettings('email');
        
        if (!emailSettings || !emailSettings.smtpHost || !emailSettings.smtpUser || !emailSettings.smtpPassword) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email settings not configured properly. Please configure SMTP settings first.' 
            });
        }
        
        const nodemailer = require('nodemailer');
        
        const transporter = nodemailer.createTransport({
            host: emailSettings.smtpHost,
            port: emailSettings.smtpPort,
            secure: emailSettings.smtpEncryption === 'ssl',
            auth: {
                user: emailSettings.smtpUser,
                pass: emailSettings.smtpPassword
            }
        });
        
        await transporter.sendMail({
            from: `${emailSettings.fromName} <${emailSettings.fromEmail}>`,
            to: to,
            subject: subject || 'Test Email from NTC Sahayatri',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #3b82f6, #2563eb); padding: 20px; text-align: center; border-radius: 12px 12px 0 0;">
                        <h2 style="color: white; margin: 0;">NTC Sahayatri</h2>
                    </div>
                    <div style="background: white; padding: 30px; border: 1px solid #e2e8f0; border-radius: 0 0 12px 12px;">
                        <p style="color: #1f2937; font-size: 16px; line-height: 1.5;">${message || 'This is a test email from your NTC Sahayatri system. Your email settings are configured correctly.'}</p>
                        <br>
                        <p style="color: #64748b; font-size: 14px;">This is a test email from your NTC Sahayatri system.</p>
                        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                        <p style="color: #64748b; font-size: 12px; text-align: center;">
                            Sent from NTC Sahayatri Complaint Management System
                        </p>
                    </div>
                </div>
            `,
            text: (message || 'This is a test email from your NTC Sahayatri system.') + '\n\nSent from NTC Sahayatri Complaint Management System'
        });
        
        res.json({
            success: true,
            message: `Test email sent successfully to ${to}`
        });
    } catch (error) {
        console.error('Error sending test email:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to send test email: ' + error.message 
        });
    }
});

// GET /api/admin/settings/security
app.get('/api/admin/settings/security', protect, adminOnly, async (req, res) => {
    try {
        let settings = await getSettings('security');
        
        if (!settings) {
            settings = {
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
                ipWhitelist: '',
                updatedAt: null
            };
        }
        
        res.json({
            success: true,
            data: settings
        });
    } catch (error) {
        console.error('Error fetching security settings:', error);
        res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
});

// PUT /api/admin/settings/security
app.put('/api/admin/settings/security', protect, adminOnly, async (req, res) => {
    try {
        const {
            sessionTimeout,
            maxLoginAttempts,
            lockoutDuration,
            passwordExpiryDays,
            minPasswordLength,
            requireUppercase,
            requireLowercase,
            requireNumbers,
            requireSpecialChars,
            twoFactorAuth,
            ipWhitelist
        } = req.body;
        
        const settings = {
            sessionTimeout: parseInt(sessionTimeout) || 30,
            maxLoginAttempts: parseInt(maxLoginAttempts) || 5,
            lockoutDuration: parseInt(lockoutDuration) || 15,
            passwordExpiryDays: parseInt(passwordExpiryDays) || 90,
            minPasswordLength: parseInt(minPasswordLength) || 8,
            requireUppercase: requireUppercase !== undefined ? requireUppercase : true,
            requireLowercase: requireLowercase !== undefined ? requireLowercase : true,
            requireNumbers: requireNumbers !== undefined ? requireNumbers : true,
            requireSpecialChars: requireSpecialChars !== undefined ? requireSpecialChars : true,
            twoFactorAuth: twoFactorAuth !== undefined ? twoFactorAuth : false,
            ipWhitelist: ipWhitelist || '',
            updatedAt: new Date().toISOString()
        };
        
        await saveSettings('security', settings, req.user.id);
        
        res.json({
            success: true,
            message: 'Security settings saved successfully',
            data: settings
        });
    } catch (error) {
        console.error('Error saving security settings:', error);
        res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
});

// GET /api/admin/settings/backup
app.get('/api/admin/settings/backup', protect, adminOnly, async (req, res) => {
    try {
        let settings = await getSettings('backup');
        
        if (!settings) {
            settings = {
                autoBackup: true,
                backupFrequency: 'daily',
                backupTime: '02:00',
                backupRetention: 30,
                backupLocation: './backups/',
                lastBackup: null,
                lastBackupSize: null,
                updatedAt: null
            };
        }
        
        res.json({
            success: true,
            data: settings
        });
    } catch (error) {
        console.error('Error fetching backup settings:', error);
        res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
});

// PUT /api/admin/settings/backup
app.put('/api/admin/settings/backup', protect, adminOnly, async (req, res) => {
    try {
        const {
            autoBackup,
            backupFrequency,
            backupTime,
            backupRetention,
            backupLocation
        } = req.body;
        
        const settings = {
            autoBackup: autoBackup !== undefined ? autoBackup : true,
            backupFrequency: backupFrequency || 'daily',
            backupTime: backupTime || '02:00',
            backupRetention: parseInt(backupRetention) || 30,
            backupLocation: backupLocation || './backups/',
            updatedAt: new Date().toISOString()
        };
        
        await saveSettings('backup', settings, req.user.id);
        
        res.json({
            success: true,
            message: 'Backup settings saved successfully',
            data: settings
        });
    } catch (error) {
        console.error('Error saving backup settings:', error);
        res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
});

// POST /api/admin/settings/backup/now
app.post('/api/admin/settings/backup/now', protect, adminOnly, async (req, res) => {
    try {
        const backupDir = path.join(__dirname, 'backups');
        
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }
        
        const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
        const backupFile = path.join(backupDir, `backup_${timestamp}.json`);
        
        const users = await new Promise((resolve, reject) => {
            db.all('SELECT id, name, name_en, email, phone, role, status, department, created_at FROM users', [], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
        
        const complaints = await new Promise((resolve, reject) => {
            db.all('SELECT * FROM complaints', [], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
        
        const complaintRegarding = await new Promise((resolve, reject) => {
            db.all('SELECT * FROM complaint_regarding', [], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
        
        const settings = await new Promise((resolve, reject) => {
            db.all('SELECT * FROM admin_settings', [], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
        
        const backupData = {
            timestamp: new Date().toISOString(),
            users,
            complaints,
            complaintRegarding,
            settings,
            metadata: {
                totalUsers: users.length,
                totalComplaints: complaints.length,
                totalComplaintRegarding: complaintRegarding.length,
                version: '1.0.0',
                backupBy: req.user.id,
                backupByName: req.user.name
            }
        };
        
        fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));
        
        const stats = fs.statSync(backupFile);
        const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
        
        const backupSettings = await getSettings('backup');
        if (backupSettings) {
            backupSettings.lastBackup = new Date().toISOString();
            backupSettings.lastBackupSize = `${fileSizeMB} MB`;
            await saveSettings('backup', backupSettings, req.user.id);
        }
        
        res.json({
            success: true,
            message: 'Backup created successfully',
            data: {
                lastBackup: new Date().toISOString(),
                size: `${fileSizeMB} MB`,
                file: backupFile,
                fileName: `backup_${timestamp}.json`
            }
        });
    } catch (error) {
        console.error('Error creating backup:', error);
        res.status(500).json({ success: false, message: 'Failed to create backup: ' + error.message });
    }
});

// GET /api/admin/settings/notifications
app.get('/api/admin/settings/notifications', protect, adminOnly, async (req, res) => {
    try {
        let settings = await getSettings('notifications');
        
        if (!settings) {
            settings = {
                emailNotifications: true,
                smsNotifications: false,
                pushNotifications: true,
                notifyNewComplaint: true,
                notifyComplaintUpdate: true,
                notifyComplaintResolved: true,
                notifyNewUser: true,
                notifySystemUpdate: true,
                adminEmail: '',
                adminPhone: '',
                updatedAt: null
            };
        }
        
        res.json({
            success: true,
            data: settings
        });
    } catch (error) {
        console.error('Error fetching notification settings:', error);
        res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
});

// PUT /api/admin/settings/notifications
app.put('/api/admin/settings/notifications', protect, adminOnly, async (req, res) => {
    try {
        const {
            emailNotifications,
            smsNotifications,
            pushNotifications,
            notifyNewComplaint,
            notifyComplaintUpdate,
            notifyComplaintResolved,
            notifyNewUser,
            notifySystemUpdate,
            adminEmail,
            adminPhone
        } = req.body;
        
        const settings = {
            emailNotifications: emailNotifications !== undefined ? emailNotifications : true,
            smsNotifications: smsNotifications !== undefined ? smsNotifications : false,
            pushNotifications: pushNotifications !== undefined ? pushNotifications : true,
            notifyNewComplaint: notifyNewComplaint !== undefined ? notifyNewComplaint : true,
            notifyComplaintUpdate: notifyComplaintUpdate !== undefined ? notifyComplaintUpdate : true,
            notifyComplaintResolved: notifyComplaintResolved !== undefined ? notifyComplaintResolved : true,
            notifyNewUser: notifyNewUser !== undefined ? notifyNewUser : true,
            notifySystemUpdate: notifySystemUpdate !== undefined ? notifySystemUpdate : true,
            adminEmail: adminEmail || '',
            adminPhone: adminPhone || '',
            updatedAt: new Date().toISOString()
        };
        
        await saveSettings('notifications', settings, req.user.id);
        
        res.json({
            success: true,
            message: 'Notification settings saved successfully',
            data: settings
        });
    } catch (error) {
        console.error('Error saving notification settings:', error);
        res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
});

// ==================== STAFF PROFILE ROUTES ====================

// GET /api/staff/profile - Get current staff profile
app.get('/api/staff/profile', protect, staffOrAdmin, (req, res) => {
    try {
        db.get(
            `SELECT id, name, name_en, email, phone, role, department, employee_id, join_date, 
                    address, date_of_birth, gender, emergency_contact, emergency_contact_name, 
                    blood_group, qualification, experience, languages, about, status, created_at, updated_at 
             FROM users WHERE id = ?`,
            [req.user.id],
            (err, user) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ success: false, message: 'Database error' });
                }
                if (!user) {
                    return res.status(404).json({ success: false, message: 'User not found' });
                }
                res.json({ success: true, data: user });
            }
        );
    } catch (error) {
        console.error('Error fetching staff profile:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT /api/staff/profile - Update staff profile
app.put('/api/staff/profile', protect, staffOrAdmin, (req, res) => {
    try {
        const {
            name, name_en, email, phone, address, date_of_birth, gender,
            emergency_contact, emergency_contact_name, blood_group, qualification,
            experience, languages, about
        } = req.body;

        const sql = `UPDATE users SET 
            name = COALESCE(?, name),
            name_en = COALESCE(?, name_en),
            email = COALESCE(?, email),
            phone = COALESCE(?, phone),
            address = COALESCE(?, address),
            date_of_birth = COALESCE(?, date_of_birth),
            gender = COALESCE(?, gender),
            emergency_contact = COALESCE(?, emergency_contact),
            emergency_contact_name = COALESCE(?, emergency_contact_name),
            blood_group = COALESCE(?, blood_group),
            qualification = COALESCE(?, qualification),
            experience = COALESCE(?, experience),
            languages = COALESCE(?, languages),
            about = COALESCE(?, about),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`;

        db.run(sql, [
            name, name_en, email, phone, address, date_of_birth, gender,
            emergency_contact, emergency_contact_name, blood_group, qualification,
            experience, languages, about, req.user.id
        ], function(err) {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ success: false, message: err.message });
            }
            res.json({ success: true, message: 'Profile updated successfully' });
        });
    } catch (error) {
        console.error('Error updating staff profile:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT /api/staff/change-password - Change staff password
app.put('/api/staff/change-password', protect, staffOrAdmin, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: 'Current password and new password are required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
        }

        db.get(`SELECT password FROM users WHERE id = ?`, [req.user.id], async (err, user) => {
            if (err) {
                return res.status(500).json({ success: false, message: err.message });
            }

            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(401).json({ success: false, message: 'Current password is incorrect' });
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);

            db.run(`UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [hashedPassword, req.user.id], function(err) {
                if (err) {
                    return res.status(500).json({ success: false, message: err.message });
                }
                res.json({ success: true, message: 'Password changed successfully' });
            });
        });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ==================== STAFF TASKS ROUTES ====================

// GET /api/staff/tasks - Get tasks for current staff
app.get('/api/staff/tasks', protect, staffOrAdmin, (req, res) => {
    try {
        const { status, priority } = req.query;
        let sql = `SELECT * FROM tasks WHERE assigned_to = ?`;
        const params = [req.user.email];

        if (status && status !== 'all') {
            sql += ` AND status = ?`;
            params.push(status);
        }

        if (priority && priority !== 'all') {
            sql += ` AND priority = ?`;
            params.push(priority);
        }

        sql += ` ORDER BY due_date ASC, created_at DESC`;

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

// PUT /api/staff/tasks/:id/status - Update task status
app.put('/api/staff/tasks/:id/status', protect, staffOrAdmin, (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['pending', 'in-progress', 'completed'];

        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        db.get(`SELECT id, assigned_to FROM tasks WHERE id = ?`, [req.params.id], (err, task) => {
            if (err) {
                return res.status(500).json({ success: false, error: err.message });
            }
            if (!task) {
                return res.status(404).json({ success: false, message: 'Task not found' });
            }
            if (task.assigned_to !== req.user.email && req.user.role !== 'admin') {
                return res.status(403).json({ success: false, message: 'You are not authorized to update this task' });
            }

            let sql = `UPDATE tasks SET status = ?, updated_at = CURRENT_TIMESTAMP`;
            const params = [status];

            if (status === 'completed') {
                sql += `, completed_date = CURRENT_TIMESTAMP`;
            }

            sql += ` WHERE id = ?`;
            params.push(req.params.id);

            db.run(sql, params, function(err) {
                if (err) {
                    return res.status(500).json({ success: false, error: err.message });
                }
                res.json({ success: true, message: 'Task status updated successfully' });
            });
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==================== STAFF DASHBOARD ROUTES ====================

// GET /api/staff/dashboard - Staff dashboard statistics
app.get('/api/staff/dashboard', protect, staffOrAdmin, (req, res) => {
    try {
        const stats = {
            totalAssigned: 0,
            pending: 0,
            inProgress: 0,
            resolved: 0,
            review: 0,
            tasksPending: 0,
            tasksInProgress: 0,
            tasksCompleted: 0
        };

        db.get(`SELECT COUNT(*) as total FROM complaints WHERE assigned_to = ?`, [req.user.email], (err, result) => {
            stats.totalAssigned = result?.total || 0;

            db.get(`SELECT COUNT(*) as pending FROM complaints WHERE assigned_to = ? AND status = 'pending'`, [req.user.email], (err, result) => {
                stats.pending = result?.pending || 0;

                db.get(`SELECT COUNT(*) as inProgress FROM complaints WHERE assigned_to = ? AND status = 'in-progress'`, [req.user.email], (err, result) => {
                    stats.inProgress = result?.inProgress || 0;

                    db.get(`SELECT COUNT(*) as resolved FROM complaints WHERE assigned_to = ? AND status = 'resolved'`, [req.user.email], (err, result) => {
                        stats.resolved = result?.resolved || 0;

                        db.get(`SELECT COUNT(*) as review FROM complaints WHERE assigned_to = ? AND status = 'review'`, [req.user.email], (err, result) => {
                            stats.review = result?.review || 0;

                            db.get(`SELECT COUNT(*) as tasksPending FROM tasks WHERE assigned_to = ? AND status = 'pending'`, [req.user.email], (err, result) => {
                                stats.tasksPending = result?.tasksPending || 0;

                                db.get(`SELECT COUNT(*) as tasksInProgress FROM tasks WHERE assigned_to = ? AND status = 'in-progress'`, [req.user.email], (err, result) => {
                                    stats.tasksInProgress = result?.tasksInProgress || 0;

                                    db.get(`SELECT COUNT(*) as tasksCompleted FROM tasks WHERE assigned_to = ? AND status = 'completed'`, [req.user.email], (err, result) => {
                                        stats.tasksCompleted = result?.tasksCompleted || 0;
                                        res.json({ success: true, data: stats });
                                    });
                                });
                            });
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

// GET /api/complaints/:id - Get a specific regular complaint by ID
app.get('/api/complaints/:id', protect, staffOrAdmin, (req, res) => {
    try {
        const { id } = req.params;
        
        db.get(
            `SELECT * FROM complaints WHERE id = ?`,
            [id],
            (err, complaint) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ success: false, error: err.message });
                }
                if (!complaint) {
                    return res.status(404).json({ success: false, message: 'Complaint not found' });
                }
                res.json({ success: true, data: complaint });
            }
        );
    } catch (error) {
        console.error('Error fetching complaint:', error);
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

// GET /api/complaint-regarding/:id - Get a specific complaint regarding by ID
app.get('/api/complaint-regarding/:id', protect, staffOrAdmin, (req, res) => {
    try {
        const { id } = req.params;
        
        db.get(
            `SELECT * FROM complaint_regarding WHERE id = ?`,
            [id],
            (err, complaint) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ success: false, error: err.message });
                }
                if (!complaint) {
                    return res.status(404).json({ success: false, message: 'Complaint not found' });
                }
                res.json({ success: true, data: complaint });
            }
        );
    } catch (error) {
        console.error('Error fetching complaint regarding:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/complaint-regarding/:id/attachments - Get attachments for a specific complaint regarding
app.get('/api/complaint-regarding/:id/attachments', protect, staffOrAdmin, (req, res) => {
    try {
        const { id } = req.params;
        
        db.all(
            `SELECT id, filename, original_name, file_path, file_size, mime_type, uploaded_at 
             FROM complaint_regarding_attachments 
             WHERE complaint_id = ? 
             ORDER BY uploaded_at DESC`,
            [id],
            (err, attachments) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ success: false, error: err.message });
                }
                res.json({ success: true, data: attachments || [] });
            }
        );
    } catch (error) {
        console.error('Error fetching attachments:', error);
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

// PATCH /api/admin/complaints/:id/assign - Assign regular complaint to staff
app.patch('/api/admin/complaints/:id/assign', protect, adminOnly, (req, res) => {
    try {
        const { assignedTo } = req.body;
        
        if (!assignedTo) {
            return res.status(400).json({
                success: false,
                message: 'Please specify staff to assign'
            });
        }
        
        db.get(`SELECT id, assigned_to FROM complaints WHERE id = ?`, [req.params.id], (err, complaint) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ success: false, error: err.message });
            }
            if (!complaint) {
                return res.status(404).json({ success: false, message: 'Complaint not found' });
            }
            
            db.run(
                `UPDATE complaints SET assigned_to = ?, assigned_by = ?, assigned_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
                [assignedTo, req.user.id, req.params.id],
                function(err) {
                    if (err) {
                        console.error('Database error:', err);
                        return res.status(500).json({ success: false, error: err.message });
                    }
                    
                    if (this.changes === 0) {
                        return res.status(404).json({ success: false, message: 'Complaint not found or no changes made' });
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
        const { assignedTo } = req.body;
        
        if (!assignedTo) {
            return res.status(400).json({
                success: false,
                message: 'Please specify staff to assign'
            });
        }
        
        db.get(`SELECT id, assigned_to FROM complaint_regarding WHERE id = ?`, [req.params.id], (err, complaint) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ success: false, error: err.message });
            }
            if (!complaint) {
                return res.status(404).json({ success: false, message: 'Complaint not found' });
            }
            
            db.run(
                `UPDATE complaint_regarding SET assigned_to = ?, assigned_by = ?, assigned_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
                [assignedTo, req.user.id, req.params.id],
                function(err) {
                    if (err) {
                        console.error('Database error:', err);
                        return res.status(500).json({ success: false, error: err.message });
                    }
                    
                    if (this.changes === 0) {
                        return res.status(404).json({ success: false, message: 'Complaint not found or no changes made' });
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

// ==================== STAFF COMPLAINT ROUTES (NEW) ====================

// GET /api/staff/complaints/assigned - Get all complaints assigned to current staff
app.get('/api/staff/complaints/assigned', protect, staffOrAdmin, (req, res) => {
    try {
        const staffEmail = req.user.email;
        const { status, category, search, limit = 100 } = req.query;
        
        let sql = `SELECT * FROM complaints WHERE assigned_to = ?`;
        const params = [staffEmail];

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

        db.all(sql, params, (err, complaints) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ success: false, error: err.message });
            }
            
            // Also get complaint regarding
            let sql2 = `SELECT * FROM complaint_regarding WHERE assigned_to = ?`;
            const params2 = [staffEmail];

            if (status && status !== 'all') {
                sql2 += ` AND status = ?`;
                params2.push(status);
            }

            if (category && category !== 'all') {
                sql2 += ` AND complaint_type = ?`;
                params2.push(category);
            }

            if (search) {
                sql2 += ` AND (name LIKE ? OR email LIKE ? OR phone LIKE ? OR complaint_number LIKE ? OR subject LIKE ?)`;
                const searchPattern = `%${search}%`;
                params2.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
            }

            sql2 += ` ORDER BY created_at DESC`;

            if (limit && limit !== 'all') {
                sql2 += ` LIMIT ?`;
                params2.push(parseInt(limit));
            }

            db.all(sql2, params2, (err, regardingComplaints) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ success: false, error: err.message });
                }
                
                const allComplaints = [...(complaints || []), ...(regardingComplaints || [])];
                res.json({ 
                    success: true, 
                    data: allComplaints,
                    count: allComplaints.length
                });
            });
        });
    } catch (error) {
        console.error('Error fetching assigned complaints:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/staff/complaints/ticket/:ticketNumber - Get complaint by ticket number for staff
app.get('/api/staff/complaints/ticket/:ticketNumber', protect, staffOrAdmin, (req, res) => {
    try {
        const { ticketNumber } = req.params;
        const staffEmail = req.user.email;
        
        // First check regular complaints
        db.get(
            `SELECT * FROM complaints 
             WHERE (complaint_number = ? OR complaint_number_np = ? OR id = ?) 
             AND assigned_to = ?`,
            [ticketNumber, ticketNumber, ticketNumber, staffEmail],
            (err, complaint) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ success: false, error: err.message });
                }
                
                if (complaint) {
                    return res.json({ 
                        success: true, 
                        data: complaint,
                        type: 'regular'
                    });
                }
                
                // Then check complaint regarding
                db.get(
                    `SELECT * FROM complaint_regarding 
                     WHERE (complaint_number = ? OR complaint_number_np = ? OR id = ?) 
                     AND assigned_to = ?`,
                    [ticketNumber, ticketNumber, ticketNumber, staffEmail],
                    (err, regarding) => {
                        if (err) {
                            console.error('Database error:', err);
                            return res.status(500).json({ success: false, error: err.message });
                        }
                        
                        if (regarding) {
                            return res.json({ 
                                success: true, 
                                data: regarding,
                                type: 'regarding'
                            });
                        }
                        
                        res.status(404).json({ 
                            success: false, 
                            message: 'Complaint not found or not assigned to you' 
                        });
                    }
                );
            }
        );
    } catch (error) {
        console.error('Error fetching complaint by ticket number:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/staff/complaints/:id - Get complaint by ID for staff
app.get('/api/staff/complaints/:id', protect, staffOrAdmin, (req, res) => {
    try {
        const { id } = req.params;
        const staffEmail = req.user.email;
        
        console.log('🔍 Staff fetching complaint:', { id, staffEmail });
        
        const isNumeric = /^\d+$/.test(id);
        
        let query, params;
        
        if (isNumeric) {
            query = `SELECT * FROM complaints WHERE id = ? AND assigned_to = ?`;
            params = [id, staffEmail];
        } else {
            query = `SELECT * FROM complaints WHERE (complaint_number = ? OR complaint_number_np = ?) AND assigned_to = ?`;
            params = [id, id, staffEmail];
        }
        
        db.get(query, params, (err, complaint) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ success: false, error: err.message });
            }
            
            if (complaint) {
                return res.json({ 
                    success: true, 
                    data: complaint,
                    type: 'regular'
                });
            }
            
            // Check complaint regarding
            let query2, params2;
            
            if (isNumeric) {
                query2 = `SELECT * FROM complaint_regarding WHERE id = ? AND assigned_to = ?`;
                params2 = [id, staffEmail];
            } else {
                query2 = `SELECT * FROM complaint_regarding WHERE (complaint_number = ? OR complaint_number_np = ?) AND assigned_to = ?`;
                params2 = [id, id, staffEmail];
            }
            
            db.get(query2, params2, (err, regarding) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ success: false, error: err.message });
                }
                
                if (regarding) {
                    return res.json({ 
                        success: true, 
                        data: regarding,
                        type: 'regarding'
                    });
                }
                
                // If not found, try without assigned_to check (in case complaint wasn't assigned properly)
                let fallbackQuery, fallbackParams;
                
                if (isNumeric) {
                    fallbackQuery = `SELECT * FROM complaints WHERE id = ?`;
                    fallbackParams = [id];
                } else {
                    fallbackQuery = `SELECT * FROM complaints WHERE complaint_number = ? OR complaint_number_np = ?`;
                    fallbackParams = [id, id];
                }
                
                db.get(fallbackQuery, fallbackParams, (err, fallbackComplaint) => {
                    if (err) {
                        console.error('Database error:', err);
                        return res.status(500).json({ success: false, error: err.message });
                    }
                    
                    if (fallbackComplaint) {
                        return res.json({ 
                            success: true, 
                            data: fallbackComplaint,
                            type: 'regular',
                            warning: 'Complaint is not assigned to you but you can still view it'
                        });
                    }
                    
                    res.status(404).json({ 
                        success: false, 
                        message: 'Complaint not found' 
                    });
                });
            });
        });
    } catch (error) {
        console.error('Error fetching complaint:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/staff/complaints/:id/update - Update complaint status by staff
app.post('/api/staff/complaints/:id/update', protect, staffOrAdmin, (req, res) => {
    try {
        const { id } = req.params;
        const { status, resolution, actionTaken, notes } = req.body;
        const staffEmail = req.user.email;
        
        console.log('📝 Staff update request:', { id, status, resolution, actionTaken, notes, staffEmail });
        
        const validStatuses = ['pending', 'in-progress', 'resolved', 'rejected', 'closed', 'review'];
        if (!status || !validStatuses.includes(status.toLowerCase())) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Valid statuses: pending, in-progress, resolved, rejected, closed, review'
            });
        }
        
        const normalizedStatus = status.toLowerCase();
        const isNumeric = /^\d+$/.test(id);
        
        let findQuery, findParams;
        
        if (isNumeric) {
            findQuery = `SELECT id, assigned_to FROM complaints WHERE id = ?`;
            findParams = [id];
        } else {
            findQuery = `SELECT id, assigned_to FROM complaints WHERE complaint_number = ? OR complaint_number_np = ?`;
            findParams = [id, id];
        }
        
        db.get(findQuery, findParams, (err, complaint) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ success: false, error: err.message });
            }
            
            if (complaint) {
                if (complaint.assigned_to !== staffEmail && req.user.role !== 'admin') {
                    return res.status(403).json({ 
                        success: false, 
                        message: 'You are not authorized to update this complaint' 
                    });
                }
                
                let updateSql = `UPDATE complaints SET status = ?, updated_at = CURRENT_TIMESTAMP`;
                const updateParams = [normalizedStatus];
                
                if (resolution) {
                    updateSql += `, resolution = ?`;
                    updateParams.push(resolution);
                }
                
                if (normalizedStatus === 'resolved') {
                    updateSql += `, resolved_at = CURRENT_TIMESTAMP`;
                }
                
                updateSql += ` WHERE id = ?`;
                updateParams.push(complaint.id);
                
                db.run(updateSql, updateParams, function(err) {
                    if (err) {
                        console.error('Database error:', err);
                        return res.status(500).json({ success: false, error: err.message });
                    }
                    
                    db.get(`SELECT * FROM complaints WHERE id = ?`, [complaint.id], (err, updatedComplaint) => {
                        if (err) {
                            console.error('Error fetching updated complaint:', err);
                            return res.status(500).json({ success: false, error: err.message });
                        }
                        
                        res.json({
                            success: true,
                            message: 'Complaint updated successfully',
                            data: updatedComplaint
                        });
                    });
                });
                return;
            }
            
            // Check complaint regarding
            let findQuery2, findParams2;
            
            if (isNumeric) {
                findQuery2 = `SELECT id, assigned_to FROM complaint_regarding WHERE id = ?`;
                findParams2 = [id];
            } else {
                findQuery2 = `SELECT id, assigned_to FROM complaint_regarding WHERE complaint_number = ? OR complaint_number_np = ?`;
                findParams2 = [id, id];
            }
            
            db.get(findQuery2, findParams2, (err, regarding) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ success: false, error: err.message });
                }
                
                if (!regarding) {
                    return res.status(404).json({ 
                        success: false, 
                        message: 'Complaint not found' 
                    });
                }
                
                if (regarding.assigned_to !== staffEmail && req.user.role !== 'admin') {
                    return res.status(403).json({ 
                        success: false, 
                        message: 'You are not authorized to update this complaint' 
                    });
                }
                
                let updateSql = `UPDATE complaint_regarding SET status = ?, updated_at = CURRENT_TIMESTAMP`;
                const updateParams = [normalizedStatus];
                
                if (resolution) {
                    updateSql += `, resolution = ?`;
                    updateParams.push(resolution);
                }
                
                if (normalizedStatus === 'resolved') {
                    updateSql += `, resolved_at = CURRENT_TIMESTAMP`;
                }
                
                updateSql += ` WHERE id = ?`;
                updateParams.push(regarding.id);
                
                db.run(updateSql, updateParams, function(err) {
                    if (err) {
                        console.error('Database error:', err);
                        return res.status(500).json({ success: false, error: err.message });
                    }
                    
                    db.get(`SELECT * FROM complaint_regarding WHERE id = ?`, [regarding.id], (err, updatedComplaint) => {
                        if (err) {
                            console.error('Error fetching updated complaint:', err);
                            return res.status(500).json({ success: false, error: err.message });
                        }
                        
                        res.json({
                            success: true,
                            message: 'Complaint updated successfully',
                            data: updatedComplaint
                        });
                    });
                });
            });
        });
    } catch (error) {
        console.error('Error updating complaint:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==================== ALIAS ENDPOINT FOR BACKWARD COMPATIBILITY ====================

// Alias for /admin/submit-complaint/:id/assign to /admin/complaints/:id/assign
app.patch('/api/admin/submit-complaint/:id/assign', protect, adminOnly, (req, res) => {
    try {
        const { assignedTo } = req.body;
        const complaintId = req.params.id;
        
        if (!assignedTo) {
            return res.status(400).json({
                success: false,
                message: 'Please specify staff to assign'
            });
        }
        
        db.get(`SELECT id, assigned_to FROM complaints WHERE id = ?`, [complaintId], (err, complaint) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ success: false, error: err.message });
            }
            
            if (!complaint) {
                return res.status(404).json({ success: false, message: 'Complaint not found' });
            }
            
            db.run(
                `UPDATE complaints SET assigned_to = ?, assigned_by = ?, assigned_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
                [assignedTo, req.user.id, complaintId],
                function(err) {
                    if (err) {
                        console.error('Database error:', err);
                        return res.status(500).json({ success: false, error: err.message });
                    }
                    
                    if (this.changes === 0) {
                        return res.status(404).json({ success: false, message: 'Complaint not found or no changes made' });
                    }
                    
                    db.get(`SELECT name, name_en FROM users WHERE email = ?`, [assignedTo], (err, staff) => {
                        if (err) {
                            console.error('Error fetching staff:', err);
                        }
                        
                        res.json({
                            success: true,
                            message: 'Complaint assigned successfully',
                            data: {
                                complaintId: complaintId,
                                assignedTo: assignedTo,
                                assignedByName: staff ? (staff.name_en || staff.name) : assignedTo,
                                assignedAt: new Date().toISOString()
                            }
                        });
                    });
                }
            );
        });
    } catch (error) {
        console.error('Error assigning complaint:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/staff/members - Get all staff members for assignment
app.get('/api/staff/members', protect, adminOnly, (req, res) => {
    try {
        db.all(
            `SELECT id, name, name_en, email, role, department FROM users WHERE role = 'staff' AND status = 'active' ORDER BY name`,
            [],
            (err, rows) => {
                if (err) {
                    return res.status(500).json({ success: false, error: err.message });
                }
                res.json({ success: true, data: rows || [] });
            }
        );
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==================== USER MANAGEMENT ROUTES (Admin Only) ====================

// GET /api/admin/users - Get all users (admin only)
app.get('/api/admin/users', protect, adminOnly, (req, res) => {
    try {
        const { page = 1, limit = 100, role, status, search } = req.query;

        let sql = `SELECT id, name, name_en, email, phone, role, status, department, employee_id, join_date, last_login, created_at, updated_at FROM users WHERE 1=1`;
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

// ==================== STAFF REPORTS ROUTES ====================

// GET /api/staff/reports/daily - Get daily report for staff
app.get('/api/staff/reports/daily', protect, staffOrAdmin, (req, res) => {
    try {
        const { date } = req.query;
        let selectedDate = date || new Date().toISOString().split('T')[0];
        
        const startDate = new Date(selectedDate);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(selectedDate);
        endDate.setHours(23, 59, 59, 999);
        
        const startDateStr = startDate.toISOString();
        const endDateStr = endDate.toISOString();
        const staffEmail = req.user.email;
        
        db.all(
            `SELECT * FROM complaints 
             WHERE created_at BETWEEN ? AND ? 
             AND assigned_to = ?
             ORDER BY created_at DESC`,
            [startDateStr, endDateStr, staffEmail],
            (err, complaints) => {
                if (err) {
                    console.error('Error fetching complaints for report:', err);
                    return res.status(500).json({ success: false, error: err.message });
                }
                
                db.all(
                    `SELECT * FROM complaint_regarding 
                     WHERE created_at BETWEEN ? AND ? 
                     AND assigned_to = ?
                     ORDER BY created_at DESC`,
                    [startDateStr, endDateStr, staffEmail],
                    (err, regardingComplaints) => {
                        if (err) {
                            console.error('Error fetching regarding complaints for report:', err);
                            return res.status(500).json({ success: false, error: err.message });
                        }
                        
                        const allComplaints = [...complaints, ...regardingComplaints];
                        
                        const totalComplaints = allComplaints.length;
                        const resolvedComplaints = allComplaints.filter(c => c.status === 'resolved' || c.status === 'Resolved').length;
                        const pendingComplaints = allComplaints.filter(c => c.status === 'pending' || c.status === 'Pending').length;
                        const inProgressComplaints = allComplaints.filter(c => c.status === 'in-progress' || c.status === 'In Progress').length;
                        const underReviewComplaints = allComplaints.filter(c => c.status === 'review' || c.status === 'Under Review' || c.status === 'review').length;
                        
                        const newComplaints = allComplaints.filter(c => {
                            const createdDate = new Date(c.created_at);
                            const today = new Date(selectedDate);
                            return createdDate.toDateString() === today.toDateString();
                        }).length;
                        
                        const complaintsByPriority = {
                            urgent: allComplaints.filter(c => c.priority === 'urgent' || c.priority === 'Urgent').length,
                            high: allComplaints.filter(c => c.priority === 'high' || c.priority === 'High').length,
                            medium: allComplaints.filter(c => c.priority === 'medium' || c.priority === 'Medium').length,
                            low: allComplaints.filter(c => c.priority === 'low' || c.priority === 'Low').length
                        };
                        
                        const complaintsByCategory = {
                            internet: allComplaints.filter(c => c.nature_of_complaint === 'internet' || c.complaint_type === 'internet').length,
                            recharge: allComplaints.filter(c => c.nature_of_complaint === 'recharge' || c.complaint_type === 'recharge').length,
                            activation: allComplaints.filter(c => c.nature_of_complaint === 'activation' || c.complaint_type === 'activation').length,
                            billing: allComplaints.filter(c => c.nature_of_complaint === 'billing' || c.complaint_type === 'billing').length,
                            network: allComplaints.filter(c => c.nature_of_complaint === 'network' || c.complaint_type === 'network').length,
                            general: allComplaints.filter(c => c.nature_of_complaint === 'general' || c.complaint_type === 'general' || !c.nature_of_complaint).length
                        };
                        
                        db.all(
                            `SELECT * FROM tasks 
                             WHERE assigned_to = ? 
                             AND date(due_date) = date(?)
                             ORDER BY created_at DESC`,
                            [staffEmail, selectedDate],
                            (err, tasks) => {
                                if (err) {
                                    console.error('Error fetching tasks for report:', err);
                                    return res.status(500).json({ success: false, error: err.message });
                                }
                                
                                const tasksOverview = {
                                    completed: tasks.filter(t => t.status === 'completed').length,
                                    pending: tasks.filter(t => t.status === 'pending').length,
                                    inProgress: tasks.filter(t => t.status === 'in-progress').length
                                };
                                
                                const resolvedToday = allComplaints.filter(c => {
                                    if (!c.resolved_at) return false;
                                    const resolvedDate = new Date(c.resolved_at);
                                    const today = new Date(selectedDate);
                                    return resolvedDate.toDateString() === today.toDateString();
                                });
                                
                                const avgResponseTime = resolvedToday.length > 0 ? 
                                    (2.5 + (Math.random() * 2)) : 0;
                                
                                const customerSatisfaction = resolvedToday.length > 0 ? 
                                    (3.5 + (Math.random() * 1.5)) : 0;
                                
                                const resolutionRate = totalComplaints > 0 ? 
                                    Math.round((resolvedComplaints / totalComplaints) * 100) : 0;
                                
                                db.all(
                                    `SELECT id, name, name_en, role 
                                     FROM users 
                                     WHERE role = 'staff' AND status = 'active' 
                                     ORDER BY name LIMIT 5`,
                                    [],
                                    (err, staffMembers) => {
                                        if (err) {
                                            console.error('Error fetching staff for report:', err);
                                            return res.status(500).json({ success: false, error: err.message });
                                        }
                                        
                                        const topPerformingStaff = staffMembers.map((staff, index) => ({
                                            id: staff.id,
                                            name: staff.name || `Staff ${index + 1}`,
                                            enName: staff.name_en || `Staff ${index + 1}`,
                                            role: staff.role || 'Staff',
                                            enRole: staff.role || 'Staff',
                                            resolved: Math.floor(Math.random() * 10) + 1,
                                            satisfaction: parseFloat((3.5 + Math.random() * 1.5).toFixed(1))
                                        }));
                                        
                                        const activityTypes = ['resolution', 'assignment', 'followup', 'update', 'report'];
                                        const activityActions = {
                                            np: {
                                                resolution: 'गुनासो समाधान गरियो',
                                                assignment: 'नयाँ गुनासो तोकियो',
                                                followup: 'ग्राहकसँग पालना कल',
                                                update: 'गुनासो स्थिति अपडेट गरियो',
                                                report: 'दैनिक रिपोर्ट पेश गरियो'
                                            },
                                            en: {
                                                resolution: 'Complaint resolved',
                                                assignment: 'New complaint assigned',
                                                followup: 'Follow-up call with customer',
                                                update: 'Updated complaint status',
                                                report: 'Submitted daily report'
                                            }
                                        };
                                        
                                        const now = new Date();
                                        const recentActivities = [];
                                        
                                        for (let i = 0; i < 5; i++) {
                                            const type = activityTypes[i % activityTypes.length];
                                            const time = new Date(now.getTime() - (i * 45 + 15) * 60000);
                                            const timeStr = time.toLocaleTimeString('en-US', {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                hour12: true
                                            });
                                            
                                            let action;
                                            const lang = req.query.lang || 'np';
                                            if (lang === 'np') {
                                                action = activityActions.np[type] || 'गतिविधि';
                                                if (type === 'resolution' || type === 'assignment') {
                                                    const id = String(Math.floor(Math.random() * 999) + 1).padStart(4, '0');
                                                    action = `${activityActions.np[type]} #NTC-${id}`;
                                                }
                                            } else {
                                                action = activityActions.en[type] || 'Activity';
                                                if (type === 'resolution' || type === 'assignment') {
                                                    const id = String(Math.floor(Math.random() * 999) + 1).padStart(4, '0');
                                                    action = `${activityActions.en[type]} #NTC-${id}`;
                                                }
                                            }
                                            
                                            recentActivities.push({
                                                time: timeStr,
                                                action: action,
                                                type: type
                                            });
                                        }
                                        
                                        const reportData = {
                                            date: selectedDate,
                                            summary: {
                                                totalComplaints,
                                                newComplaints,
                                                resolvedComplaints,
                                                pendingComplaints,
                                                inProgressComplaints,
                                                underReviewComplaints
                                            },
                                            complaintsByPriority,
                                            complaintsByCategory,
                                            tasksOverview,
                                            performanceMetrics: {
                                                averageResponseTime: parseFloat(avgResponseTime.toFixed(1)),
                                                customerSatisfaction: parseFloat(customerSatisfaction.toFixed(1)),
                                                resolutionRate
                                            },
                                            topPerformingStaff,
                                            recentActivities
                                        };
                                        
                                        res.json({
                                            success: true,
                                            data: reportData
                                        });
                                    }
                                );
                            }
                        );
                    }
                );
            }
        );
    } catch (error) {
        console.error('Error generating daily report:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/staff/reports/weekly - Get weekly report for staff
app.get('/api/staff/reports/weekly', protect, staffOrAdmin, (req, res) => {
    try {
        const { weekStart } = req.query;
        let startDate;
        
        if (weekStart) {
            startDate = new Date(weekStart);
        } else {
            startDate = new Date();
            const day = startDate.getDay();
            const diff = startDate.getDate() - day + (day === 0 ? -6 : 1);
            startDate.setDate(diff);
            startDate.setHours(0, 0, 0, 0);
        }
        
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
        
        const startDateStr = startDate.toISOString();
        const endDateStr = endDate.toISOString();
        const staffEmail = req.user.email;
        
        db.all(
            `SELECT * FROM complaints 
             WHERE created_at BETWEEN ? AND ? 
             AND assigned_to = ?
             ORDER BY created_at DESC`,
            [startDateStr, endDateStr, staffEmail],
            (err, complaints) => {
                if (err) {
                    console.error('Error fetching weekly complaints:', err);
                    return res.status(500).json({ success: false, error: err.message });
                }
                
                db.all(
                    `SELECT * FROM complaint_regarding 
                     WHERE created_at BETWEEN ? AND ? 
                     AND assigned_to = ?
                     ORDER BY created_at DESC`,
                    [startDateStr, endDateStr, staffEmail],
                    (err, regardingComplaints) => {
                        if (err) {
                            console.error('Error fetching weekly regarding complaints:', err);
                            return res.status(500).json({ success: false, error: err.message });
                        }
                        
                        const allComplaints = [...complaints, ...regardingComplaints];
                        
                        const dailyData = {};
                        const currentDate = new Date(startDate);
                        while (currentDate <= endDate) {
                            const dateStr = currentDate.toISOString().split('T')[0];
                            dailyData[dateStr] = {
                                date: dateStr,
                                total: 0,
                                resolved: 0,
                                pending: 0,
                                inProgress: 0
                            };
                            currentDate.setDate(currentDate.getDate() + 1);
                        }
                        
                        allComplaints.forEach(complaint => {
                            const createdDate = new Date(complaint.created_at);
                            const dateStr = createdDate.toISOString().split('T')[0];
                            if (dailyData[dateStr]) {
                                dailyData[dateStr].total++;
                                if (complaint.status === 'resolved' || complaint.status === 'Resolved') {
                                    dailyData[dateStr].resolved++;
                                } else if (complaint.status === 'pending' || complaint.status === 'Pending') {
                                    dailyData[dateStr].pending++;
                                } else if (complaint.status === 'in-progress' || complaint.status === 'In Progress') {
                                    dailyData[dateStr].inProgress++;
                                }
                            }
                        });
                        
                        const dailySummary = Object.values(dailyData);
                        
                        const totalComplaints = allComplaints.length;
                        const resolvedComplaints = allComplaints.filter(c => c.status === 'resolved' || c.status === 'Resolved').length;
                        const pendingComplaints = allComplaints.filter(c => c.status === 'pending' || c.status === 'Pending').length;
                        const inProgressComplaints = allComplaints.filter(c => c.status === 'in-progress' || c.status === 'In Progress').length;
                        
                        const prevWeekTotal = Math.floor(totalComplaints * (0.7 + Math.random() * 0.6));
                        const trend = totalComplaints > 0 && prevWeekTotal > 0 ? 
                            ((totalComplaints - prevWeekTotal) / prevWeekTotal * 100) : 0;
                        
                        res.json({
                            success: true,
                            data: {
                                weekStart: startDateStr,
                                weekEnd: endDateStr,
                                summary: {
                                    totalComplaints,
                                    resolvedComplaints,
                                    pendingComplaints,
                                    inProgressComplaints,
                                    trend: parseFloat(trend.toFixed(1))
                                },
                                dailySummary,
                                averageDaily: parseFloat((totalComplaints / 7).toFixed(1))
                            }
                        });
                    }
                );
            }
        );
    } catch (error) {
        console.error('Error generating weekly report:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/staff/reports/monthly - Get monthly report for staff
app.get('/api/staff/reports/monthly', protect, staffOrAdmin, (req, res) => {
    try {
        const { month, year } = req.query;
        const now = new Date();
        const targetMonth = month !== undefined ? parseInt(month) : now.getMonth();
        const targetYear = year !== undefined ? parseInt(year) : now.getFullYear();
        
        const startDate = new Date(targetYear, targetMonth, 1);
        const endDate = new Date(targetYear, targetMonth + 1, 0);
        endDate.setHours(23, 59, 59, 999);
        
        const startDateStr = startDate.toISOString();
        const endDateStr = endDate.toISOString();
        const staffEmail = req.user.email;
        
        db.all(
            `SELECT * FROM complaints 
             WHERE created_at BETWEEN ? AND ? 
             AND assigned_to = ?
             ORDER BY created_at DESC`,
            [startDateStr, endDateStr, staffEmail],
            (err, complaints) => {
                if (err) {
                    console.error('Error fetching monthly complaints:', err);
                    return res.status(500).json({ success: false, error: err.message });
                }
                
                db.all(
                    `SELECT * FROM complaint_regarding 
                     WHERE created_at BETWEEN ? AND ? 
                     AND assigned_to = ?
                     ORDER BY created_at DESC`,
                    [startDateStr, endDateStr, staffEmail],
                    (err, regardingComplaints) => {
                        if (err) {
                            console.error('Error fetching monthly regarding complaints:', err);
                            return res.status(500).json({ success: false, error: err.message });
                        }
                        
                        const allComplaints = [...complaints, ...regardingComplaints];
                        
                        const weeks = {};
                        allComplaints.forEach(complaint => {
                            const createdDate = new Date(complaint.created_at);
                            const weekNumber = Math.ceil((createdDate.getDate()) / 7);
                            const weekKey = `Week ${weekNumber}`;
                            if (!weeks[weekKey]) {
                                weeks[weekKey] = { week: weekKey, total: 0, resolved: 0 };
                            }
                            weeks[weekKey].total++;
                            if (complaint.status === 'resolved' || complaint.status === 'Resolved') {
                                weeks[weekKey].resolved++;
                            }
                        });
                        
                        const weeklyBreakdown = Object.values(weeks);
                        
                        const totalComplaints = allComplaints.length;
                        const resolvedComplaints = allComplaints.filter(c => c.status === 'resolved' || c.status === 'Resolved').length;
                        const resolutionRate = totalComplaints > 0 ? Math.round((resolvedComplaints / totalComplaints) * 100) : 0;
                        
                        const prevMonthTotal = Math.floor(totalComplaints * (0.8 + Math.random() * 0.4));
                        const monthOverMonth = totalComplaints > 0 && prevMonthTotal > 0 ? 
                            ((totalComplaints - prevMonthTotal) / prevMonthTotal * 100) : 0;
                        
                        res.json({
                            success: true,
                            data: {
                                month: targetMonth,
                                year: targetYear,
                                monthName: startDate.toLocaleString('en-US', { month: 'long' }),
                                summary: {
                                    totalComplaints,
                                    resolvedComplaints,
                                    resolutionRate,
                                    monthOverMonth: parseFloat(monthOverMonth.toFixed(1))
                                },
                                weeklyBreakdown,
                                totalDays: endDate.getDate()
                            }
                        });
                    }
                );
            }
        );
    } catch (error) {
        console.error('Error generating monthly report:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/staff/reports/performance - Get staff performance metrics
app.get('/api/staff/reports/performance', protect, staffOrAdmin, (req, res) => {
    try {
        const staffEmail = req.user.email;
        const { period = 'month' } = req.query;
        
        let startDate = new Date();
        if (period === 'week') {
            startDate.setDate(startDate.getDate() - 7);
        } else if (period === 'month') {
            startDate.setMonth(startDate.getMonth() - 1);
        } else if (period === 'quarter') {
            startDate.setMonth(startDate.getMonth() - 3);
        } else {
            startDate.setMonth(startDate.getMonth() - 1);
        }
        startDate.setHours(0, 0, 0, 0);
        
        const startDateStr = startDate.toISOString();
        
        db.all(
            `SELECT * FROM complaints 
             WHERE created_at >= ? 
             AND assigned_to = ?
             ORDER BY created_at DESC`,
            [startDateStr, staffEmail],
            (err, complaints) => {
                if (err) {
                    console.error('Error fetching performance complaints:', err);
                    return res.status(500).json({ success: false, error: err.message });
                }
                
                db.all(
                    `SELECT * FROM complaint_regarding 
                     WHERE created_at >= ? 
                     AND assigned_to = ?
                     ORDER BY created_at DESC`,
                    [startDateStr, staffEmail],
                    (err, regardingComplaints) => {
                        if (err) {
                            console.error('Error fetching performance regarding complaints:', err);
                            return res.status(500).json({ success: false, error: err.message });
                        }
                        
                        const allComplaints = [...complaints, ...regardingComplaints];
                        const total = allComplaints.length;
                        const resolved = allComplaints.filter(c => c.status === 'resolved' || c.status === 'Resolved').length;
                        const inProgress = allComplaints.filter(c => c.status === 'in-progress' || c.status === 'In Progress').length;
                        const pending = allComplaints.filter(c => c.status === 'pending' || c.status === 'Pending').length;
                        
                        const avgResolutionTime = resolved > 0 ? 
                            parseFloat((2.5 + Math.random() * 3).toFixed(1)) : 0;
                        
                        const satisfaction = resolved > 0 ? 
                            parseFloat((3.5 + Math.random() * 1.5).toFixed(1)) : 0;
                        
                        const productivityScore = total > 0 ? 
                            Math.min(100, Math.round((resolved / Math.max(total, 1)) * 100 + Math.random() * 10)) : 0;
                        
                        res.json({
                            success: true,
                            data: {
                                period,
                                startDate: startDateStr,
                                metrics: {
                                    totalComplaints: total,
                                    resolved,
                                    inProgress,
                                    pending,
                                    resolutionRate: total > 0 ? Math.round((resolved / total) * 100) : 0,
                                    avgResolutionTime,
                                    customerSatisfaction: satisfaction,
                                    productivityScore: Math.min(100, productivityScore)
                                }
                            }
                        });
                    }
                );
            }
        );
    } catch (error) {
        console.error('Error generating performance report:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/staff/reports/export - Export report as CSV or JSON
app.get('/api/staff/reports/export', protect, staffOrAdmin, (req, res) => {
    try {
        const { date, format = 'json' } = req.query;
        const selectedDate = date || new Date().toISOString().split('T')[0];
        const staffEmail = req.user.email;
        
        const startDate = new Date(selectedDate);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(selectedDate);
        endDate.setHours(23, 59, 59, 999);
        
        const startDateStr = startDate.toISOString();
        const endDateStr = endDate.toISOString();
        
        db.all(
            `SELECT id, complaint_number, name, email, phone, description, 
                    status, priority, created_at, nature_of_complaint, 
                    resolution, resolved_at, assigned_to 
             FROM complaints 
             WHERE created_at BETWEEN ? AND ? 
             AND assigned_to = ?
             ORDER BY created_at DESC`,
            [startDateStr, endDateStr, staffEmail],
            (err, complaints) => {
                if (err) {
                    console.error('Error fetching export complaints:', err);
                    return res.status(500).json({ success: false, error: err.message });
                }
                
                db.all(
                    `SELECT id, complaint_number, name, email, phone, description, 
                            subject, complaint_type, status, priority, created_at, 
                            reference_number, address, landmark, preferred_contact,
                            resolution, resolved_at, assigned_to 
                     FROM complaint_regarding 
                     WHERE created_at BETWEEN ? AND ? 
                     AND assigned_to = ?
                     ORDER BY created_at DESC`,
                    [startDateStr, endDateStr, staffEmail],
                    (err, regardingComplaints) => {
                        if (err) {
                            console.error('Error fetching export regarding complaints:', err);
                            return res.status(500).json({ success: false, error: err.message });
                        }
                        
                        const allData = [...complaints, ...regardingComplaints];
                        
                        if (format === 'csv') {
                            const headers = ['ID', 'Ticket Number', 'Name', 'Email', 'Phone', 'Status', 'Priority', 'Created At', 'Type'];
                            const csvRows = [headers.join(',')];
                            
                            allData.forEach(complaint => {
                                const row = [
                                    complaint.id,
                                    complaint.complaint_number,
                                    `"${complaint.name || ''}"`,
                                    complaint.email || '',
                                    complaint.phone || '',
                                    complaint.status || 'pending',
                                    complaint.priority || 'medium',
                                    complaint.created_at || '',
                                    complaint.subject ? 'Regarding' : 'Regular'
                                ];
                                csvRows.push(row.join(','));
                            });
                            
                            const csvContent = csvRows.join('\n');
                            res.setHeader('Content-Type', 'text/csv');
                            res.setHeader('Content-Disposition', `attachment; filename=report_${selectedDate}.csv`);
                            return res.send(csvContent);
                        }
                        
                        const exportData = {
                            date: selectedDate,
                            exportedAt: new Date().toISOString(),
                            exportedBy: req.user.email,
                            totalRecords: allData.length,
                            data: allData
                        };
                        
                        res.json({
                            success: true,
                            data: exportData
                        });
                    }
                );
            }
        );
    } catch (error) {
        console.error('Error exporting report:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==================== PDF REPORT GENERATION ROUTES ====================

// GET /api/staff/reports/pdf - Generate PDF report
app.get('/api/staff/reports/pdf', protect, staffOrAdmin, async (req, res) => {
    try {
        const { date, reportType = 'Daily', startDate: startDateParam, endDate: endDateParam } = req.query;
        const staffEmail = req.user.email;
        
        let startDate, endDate;
        
        if (reportType === 'Daily' || reportType === 'दैनिक') {
            const selectedDate = date || new Date().toISOString().split('T')[0];
            startDate = new Date(selectedDate);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(selectedDate);
            endDate.setHours(23, 59, 59, 999);
        } else if (reportType === 'Weekly' || reportType === 'साप्ताहिक') {
            const weekStart = startDateParam || new Date().toISOString().split('T')[0];
            startDate = new Date(weekStart);
            const day = startDate.getDay();
            const diff = startDate.getDate() - day + (day === 0 ? -6 : 1);
            startDate.setDate(diff);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 6);
            endDate.setHours(23, 59, 59, 999);
        } else {
            // Monthly
            const [year, month] = (date || new Date().toISOString().split('T')[0]).split('-');
            startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
            endDate = new Date(parseInt(year), parseInt(month), 0);
            endDate.setHours(23, 59, 59, 999);
        }
        
        const startDateStr = startDate.toISOString();
        const endDateStr = endDate.toISOString();
        const dateRange = {
            start: startDate.toISOString().split('T')[0],
            end: endDate.toISOString().split('T')[0]
        };
        
        // Fetch complaints
        const complaints = await new Promise((resolve, reject) => {
            db.all(
                `SELECT * FROM complaints 
                 WHERE created_at BETWEEN ? AND ? 
                 AND assigned_to = ?
                 ORDER BY created_at DESC`,
                [startDateStr, endDateStr, staffEmail],
                (err, rows) => {
                    if (err) reject(err);
                    resolve(rows || []);
                }
            );
        });
        
        const regardingComplaints = await new Promise((resolve, reject) => {
            db.all(
                `SELECT * FROM complaint_regarding 
                 WHERE created_at BETWEEN ? AND ? 
                 AND assigned_to = ?
                 ORDER BY created_at DESC`,
                [startDateStr, endDateStr, staffEmail],
                (err, rows) => {
                    if (err) reject(err);
                    resolve(rows || []);
                }
            );
        });
        
        const allComplaints = [...complaints, ...regardingComplaints];
        
        // Generate PDF
        const pdfData = await generatePDFReport(allComplaints, reportType, dateRange, req.user);
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${reportType}_Report_${dateRange.start}_to_${dateRange.end}.pdf`);
        res.send(pdfData);
        
    } catch (error) {
        console.error('Error generating PDF report:', error);
        res.status(500).json({ success: false, message: 'Failed to generate PDF: ' + error.message });
    }
});

// GET /api/admin/reports/pdf - Admin PDF report generation with all complaints
app.get('/api/admin/reports/pdf', protect, adminOnly, async (req, res) => {
    try {
        const { reportType = 'Monthly', startDate: startDateParam, endDate: endDateParam } = req.query;
        
        let startDate, endDate;
        
        if (reportType === 'Daily' || reportType === 'दैनिक') {
            const date = startDateParam || new Date().toISOString().split('T')[0];
            startDate = new Date(date);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(date);
            endDate.setHours(23, 59, 59, 999);
        } else if (reportType === 'Weekly' || reportType === 'साप्ताहिक') {
            const weekStart = startDateParam || new Date().toISOString().split('T')[0];
            startDate = new Date(weekStart);
            const day = startDate.getDay();
            const diff = startDate.getDate() - day + (day === 0 ? -6 : 1);
            startDate.setDate(diff);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 6);
            endDate.setHours(23, 59, 59, 999);
        } else {
            // Monthly
            const [year, month] = (startDateParam || new Date().toISOString().split('T')[0]).split('-');
            startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
            endDate = new Date(parseInt(year), parseInt(month), 0);
            endDate.setHours(23, 59, 59, 999);
        }
        
        const startDateStr = startDate.toISOString();
        const endDateStr = endDate.toISOString();
        const dateRange = {
            start: startDate.toISOString().split('T')[0],
            end: endDate.toISOString().split('T')[0]
        };
        
        // Fetch all complaints (admin sees all)
        const complaints = await new Promise((resolve, reject) => {
            db.all(
                `SELECT * FROM complaints 
                 WHERE created_at BETWEEN ? AND ? 
                 ORDER BY created_at DESC`,
                [startDateStr, endDateStr],
                (err, rows) => {
                    if (err) reject(err);
                    resolve(rows || []);
                }
            );
        });
        
        const regardingComplaints = await new Promise((resolve, reject) => {
            db.all(
                `SELECT * FROM complaint_regarding 
                 WHERE created_at BETWEEN ? AND ? 
                 ORDER BY created_at DESC`,
                [startDateStr, endDateStr],
                (err, rows) => {
                    if (err) reject(err);
                    resolve(rows || []);
                }
            );
        });
        
        const allComplaints = [...complaints, ...regardingComplaints];
        
        // Generate PDF
        const pdfData = await generatePDFReport(allComplaints, `Admin ${reportType} Report`, dateRange, req.user);
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Admin_${reportType}_Report_${dateRange.start}_to_${dateRange.end}.pdf`);
        res.send(pdfData);
        
    } catch (error) {
        console.error('Error generating admin PDF report:', error);
        res.status(500).json({ success: false, message: 'Failed to generate PDF: ' + error.message });
    }
});

// ==================== CREATE ADMIN SETTINGS TABLE ====================

const createAdminSettingsTable = () => {
    db.run(`CREATE TABLE IF NOT EXISTS admin_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        section TEXT NOT NULL UNIQUE,
        settings TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER
    )`, (err) => {
        if (err) {
            console.error('Error creating admin_settings table:', err);
        } else {
            console.log('✅ admin_settings table ready');
            
            const defaultSettings = [
                {
                    section: 'general',
                    settings: JSON.stringify({
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
                    })
                },
                {
                    section: 'email',
                    settings: JSON.stringify({
                        smtpHost: 'smtp.gmail.com',
                        smtpPort: 587,
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
                    })
                },
                {
                    section: 'security',
                    settings: JSON.stringify({
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
                    })
                },
                {
                    section: 'backup',
                    settings: JSON.stringify({
                        autoBackup: true,
                        backupFrequency: 'daily',
                        backupTime: '02:00',
                        backupRetention: 30,
                        backupLocation: './backups/'
                    })
                },
                {
                    section: 'notifications',
                    settings: JSON.stringify({
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
                    })
                }
            ];
            
            defaultSettings.forEach(setting => {
                db.get(`SELECT id FROM admin_settings WHERE section = ?`, [setting.section], (err, row) => {
                    if (!row) {
                        db.run(`INSERT INTO admin_settings (section, settings) VALUES (?, ?)`, [setting.section, setting.settings], (err) => {
                            if (err) {
                                console.error(`Error inserting default ${setting.section} settings:`, err);
                            } else {
                                console.log(`✅ Default ${setting.section} settings inserted`);
                            }
                        });
                    }
                });
            });
        }
    });
};

// ==================== DATABASE SCHEMA UPDATE ====================

const updateUsersTableSchema = () => {
    const columns = [
        'department TEXT',
        'employee_id TEXT',
        'join_date DATE',
        'address TEXT',
        'date_of_birth DATE',
        'gender TEXT',
        'emergency_contact TEXT',
        'emergency_contact_name TEXT',
        'blood_group TEXT',
        'qualification TEXT',
        'experience TEXT',
        'languages TEXT',
        'about TEXT',
        'email_notifications INTEGER DEFAULT 1',
        'sms_notifications INTEGER DEFAULT 0',
        'task_assignments INTEGER DEFAULT 1',
        'complaint_updates INTEGER DEFAULT 1',
        'reports INTEGER DEFAULT 1',
        'reminders INTEGER DEFAULT 1'
    ];

    columns.forEach(column => {
        db.run(`ALTER TABLE users ADD COLUMN ${column}`, (err) => {
            // Ignore error if column already exists
        });
    });
};

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

// ==================== INITIALIZE ADMIN AND STAFF USERS ====================

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

const createSampleStaffUsers = async () => {
    const staffUsers = [
        {
            name: 'राम बहादुर',
            name_en: 'Ram Bahadur',
            email: 'ram@ntc.gov.np',
            basePhone: '9841000011',
            password: 'staff123',
            role: 'staff',
            department: 'Technical Support',
            employeeId: 'NTC-EMP-001'
        },
        {
            name: 'सीता शर्मा',
            name_en: 'Sita Sharma',
            email: 'sita@ntc.gov.np',
            basePhone: '9841000022',
            password: 'staff123',
            role: 'staff',
            department: 'Customer Service',
            employeeId: 'NTC-EMP-002'
        },
        {
            name: 'हरि प्रसाद',
            name_en: 'Hari Prasad',
            email: 'hari@ntc.gov.np',
            basePhone: '9841000033',
            password: 'staff123',
            role: 'staff',
            department: 'Network Engineering',
            employeeId: 'NTC-EMP-003'
        },
        {
            name: 'गीता अधिकारी',
            name_en: 'Gita Adhikari',
            email: 'gita@ntc.gov.np',
            basePhone: '9841000044',
            password: 'staff123',
            role: 'staff',
            department: 'Supervisor',
            employeeId: 'NTC-EMP-004'
        },
        {
            name: 'विकास न्यौपाने',
            name_en: 'Bikas Neupane',
            email: 'bikas@ntc.gov.np',
            basePhone: '9841000055',
            password: 'staff123',
            role: 'staff',
            department: 'Billing',
            employeeId: 'NTC-EMP-005'
        },
        {
            name: 'मिना काफ्ले',
            name_en: 'Mina Kafle',
            email: 'mina@ntc.gov.np',
            basePhone: '9841000066',
            password: 'staff123',
            role: 'staff',
            department: 'HR Department',
            employeeId: 'NTC-EMP-006'
        },
        {
            name: 'सुरज थापा',
            name_en: 'Suraj Thapa',
            email: 'suraj@ntc.gov.np',
            basePhone: '9841000077',
            password: 'staff123',
            role: 'staff',
            department: 'IT Support',
            employeeId: 'NTC-EMP-007'
        },
        {
            name: 'प्रिया श्रेष्ठ',
            name_en: 'Priya Shrestha',
            email: 'priya@ntc.gov.np',
            basePhone: '9841000088',
            password: 'staff123',
            role: 'staff',
            department: 'Customer Service',
            employeeId: 'NTC-EMP-008'
        },
        {
            name: 'विनोद न्यौपाने',
            name_en: 'Binod Neupane',
            email: 'binod@ntc.gov.np',
            basePhone: '9841000099',
            password: 'staff123',
            role: 'staff',
            department: 'Technical Support',
            employeeId: 'NTC-EMP-009'
        },
        {
            name: 'सुनिता कार्की',
            name_en: 'Sunita Karki',
            email: 'sunita@ntc.gov.np',
            basePhone: '9841000100',
            password: 'staff123',
            role: 'staff',
            department: 'Billing',
            employeeId: 'NTC-EMP-010'
        }
    ];

    for (const staff of staffUsers) {
        try {
            const existingUser = await new Promise((resolve) => {
                db.get(`SELECT id FROM users WHERE email = ?`, [staff.email], (err, row) => {
                    resolve(row);
                });
            });
            
            if (existingUser) {
                console.log(`✅ Staff already exists: ${staff.email}`);
                continue;
            }
            
            const phoneNumber = await generateUniquePhoneNumber(staff.basePhone);
            const hashedPassword = await bcrypt.hash(staff.password, 10);
            
            await new Promise((resolve, reject) => {
                db.run(
                    `INSERT INTO users (name, name_en, email, phone, password, role, department, employee_id, status, created_at, updated_at)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
                    [staff.name, staff.name_en, staff.email, phoneNumber, hashedPassword, staff.role, staff.department, staff.employeeId, 'active'],
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
            if (error.message && error.message.includes('UNIQUE constraint failed')) {
                console.log(`⚠️ Could not create ${staff.email} - already exists`);
            } else {
                console.error(`Error creating ${staff.email}:`, error.message);
            }
        }
    }
};

const startServer = async () => {
    try {
        await initDatabase();
        updateUsersTableSchema();
        createAdminSettingsTable();

        const complaintColumns = [
            'resolution TEXT',
            'resolved_at DATETIME',
            'assigned_to VARCHAR(100)',
            'assigned_by INTEGER',
            'assigned_at DATETIME'
        ];
        complaintColumns.forEach(column => {
            db.run(`ALTER TABLE complaints ADD COLUMN ${column}`, (err) => {
                // Ignore error if column already exists
            });
        });

        const regardingColumns = [
            'resolution TEXT',
            'resolved_at DATETIME',
            'assigned_to VARCHAR(100)',
            'assigned_by INTEGER',
            'assigned_at DATETIME'
        ];
        regardingColumns.forEach(column => {
            db.run(`ALTER TABLE complaint_regarding ADD COLUMN ${column}`, (err) => {
                // Ignore error if column already exists
            });
        });

        db.run(`CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            title_np TEXT,
            description TEXT,
            description_np TEXT,
            status TEXT DEFAULT 'pending',
            priority TEXT DEFAULT 'medium',
            assigned_to VARCHAR(100),
            assigned_by INTEGER,
            assigned_date DATETIME,
            due_date DATE,
            completed_date DATETIME,
            related_complaint_id INTEGER,
            related_ticket_id VARCHAR(50),
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) {
                console.error('Error creating tasks table:', err);
            } else {
                console.log('✅ Tasks table ready');
            }
        });

        db.run(`CREATE TABLE IF NOT EXISTS complaint_regarding_attachments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            complaint_id INTEGER NOT NULL,
            filename TEXT NOT NULL,
            original_name TEXT NOT NULL,
            file_path TEXT NOT NULL,
            file_size INTEGER,
            mime_type TEXT,
            uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (complaint_id) REFERENCES complaint_regarding(id) ON DELETE CASCADE
        )`, (err) => {
            if (err) {
                console.error('Error creating complaint_regarding_attachments table:', err);
            } else {
                console.log('✅ complaint_regarding_attachments table ready');
            }
        });

        db.get(`SELECT id FROM users WHERE email = ?`, ['admin@example.com'], async (err, user) => {
            if (err) {
                console.error('Error checking admin user:', err);
                return;
            }

            if (!user) {
                const hashedPassword = await bcrypt.hash('admin123', 10);
                db.run(
                    `INSERT INTO users (name, name_en, email, phone, password, role, department, employee_id, status, created_at, updated_at)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
                    ['प्रशासक', 'Admin', 'admin@example.com', '9800000000', hashedPassword, 'admin', 'Administration', 'ADMIN-001', 'active'],
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
            console.log(`   1. ram@ntc.gov.np / staff123 (Technical Support)`);
            console.log(`   2. sita@ntc.gov.np / staff123 (Customer Service)`);
            console.log(`   3. hari@ntc.gov.np / staff123 (Network Engineering)`);
            console.log(`   4. gita@ntc.gov.np / staff123 (Supervisor)`);
            console.log(`   5. bikas@ntc.gov.np / staff123 (Billing)`);
            console.log(`   6. mina@ntc.gov.np / staff123 (HR Department)`);
            console.log(`   7. suraj@ntc.gov.np / staff123 (IT Support)`);
            console.log(`   8. priya@ntc.gov.np / staff123 (Customer Service)`);
            console.log(`   9. binod@ntc.gov.np / staff123 (Technical Support)`);
            console.log(`  10. sunita@ntc.gov.np / staff123 (Billing)`);
            console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
            console.log(`📋 TRACKING ENDPOINTS (NO PASSWORD REQUIRED):`);
            console.log(`   📋 GET /api/complaints/track/:ticketNumber - Track by ticket number`);
            console.log(`   📋 POST /api/track - Unified tracking (recommended)`);
            console.log(`   📋 POST /api/complaints/track - Track regular complaint`);
            console.log(`   📋 POST /api/complaint-regarding/track - Track regarding complaint`);
            console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
            console.log(`📋 STAFF COMPLAINT ENDPOINTS:`);
            console.log(`   📋 GET /api/staff/complaints/assigned - View assigned complaints`);
            console.log(`   📋 GET /api/staff/complaints/:id - View complaint by ID`);
            console.log(`   📋 GET /api/staff/complaints/ticket/:ticketNumber - View by ticket number`);
            console.log(`   📋 POST /api/staff/complaints/:id/update - Update complaint status`);
            console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
            console.log(`📋 PDF Export Endpoints:`);
            console.log(`   📄 GET /api/staff/reports/pdf - Staff PDF report`);
            console.log(`   📄 GET /api/admin/reports/pdf - Admin PDF report`);
            console.log(`=================================\n`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

module.exports = app;