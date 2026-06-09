const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Ensure database directory exists
const dbDir = path.join(__dirname, 'data');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'complaints.db');

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

    // Attachments Tables
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

    // Execute all table creations
    db.run(createComplaintsTable, (err) => {
        if (err) console.error('Error creating complaints table:', err);
        else console.log('✓ Complaints table ready');
    });

    db.run(createComplaintRegardingTable, (err) => {
        if (err) console.error('Error creating complaint_regarding table:', err);
        else console.log('✓ Complaint Regarding table ready');
    });

    db.run(createAttachmentsTable, (err) => {
        if (err) console.error('Error creating attachments table:', err);
        else console.log('✓ Attachments table ready');
    });

    db.run(createComplaintRegardingAttachmentsTable, (err) => {
        if (err) console.error('Error creating complaint_regarding_attachments table:', err);
        else console.log('✓ Complaint Regarding Attachments table ready');
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

module.exports = {
    db,
    generateComplaintNumber,
    generateComplaintNumberNp,
    generateTrackingPassword
};