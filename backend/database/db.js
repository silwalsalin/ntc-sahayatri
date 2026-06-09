// backend/database/db.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'complaints.db');
const db = new sqlite3.Database(dbPath);

// Generate complaint number
const generateComplaintNumber = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `NTC-${year}-${random}`;
};

const generateComplaintNumberNp = () => {
    const year = new Date().getFullYear() - 57;
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `नेपाल दूरसञ्चार-${year}-${random}`;
};

const generateTrackingPassword = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
};

// Initialize database tables
const initDatabase = () => {
    return new Promise((resolve, reject) => {
        // Create users table
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(100) NOT NULL,
            name_en VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            phone VARCHAR(15) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            role VARCHAR(20) DEFAULT 'user',
            status VARCHAR(20) DEFAULT 'active',
            last_login DATETIME,
            created_by INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (created_by) REFERENCES users(id)
        )`, (err) => {
            if (err) {
                console.error('Error creating users table:', err);
                reject(err);
            } else {
                console.log('✅ Users table ready');
            }
        });

        // Create complaints table
        db.run(`CREATE TABLE IF NOT EXISTS complaints (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            complaint_number VARCHAR(50) UNIQUE NOT NULL,
            complaint_number_np VARCHAR(50) UNIQUE NOT NULL,
            tracking_password VARCHAR(20) NOT NULL,
            nature_of_complaint VARCHAR(100) NOT NULL,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100),
            phone VARCHAR(15),
            state VARCHAR(50),
            district VARCHAR(50),
            municipality VARCHAR(50),
            ward_no VARCHAR(10),
            street_address TEXT,
            description TEXT NOT NULL,
            status VARCHAR(20) DEFAULT 'pending',
            priority VARCHAR(20) DEFAULT 'medium',
            resolution TEXT,
            resolved_at DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) {
                console.error('Error creating complaints table:', err);
                reject(err);
            } else {
                console.log('✅ Complaints table ready');
            }
        });

        // Create complaint_regarding table
        db.run(`CREATE TABLE IF NOT EXISTS complaint_regarding (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            complaint_number VARCHAR(50) UNIQUE NOT NULL,
            complaint_number_np VARCHAR(50) UNIQUE NOT NULL,
            tracking_password VARCHAR(20) NOT NULL,
            complaint_type VARCHAR(50) NOT NULL,
            subject VARCHAR(200) NOT NULL,
            description TEXT NOT NULL,
            priority VARCHAR(20) DEFAULT 'medium',
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100),
            phone VARCHAR(15),
            address TEXT,
            landmark VARCHAR(100),
            preferred_contact VARCHAR(20) DEFAULT 'phone',
            reference_number VARCHAR(50),
            status VARCHAR(20) DEFAULT 'pending',
            resolution TEXT,
            resolved_at DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) {
                console.error('Error creating complaint_regarding table:', err);
                reject(err);
            } else {
                console.log('✅ Complaint regarding table ready');
            }
        });

        // Create complaint_regarding_attachments table
        db.run(`CREATE TABLE IF NOT EXISTS complaint_regarding_attachments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            complaint_id INTEGER NOT NULL,
            filename VARCHAR(255) NOT NULL,
            original_name VARCHAR(255) NOT NULL,
            file_path VARCHAR(500) NOT NULL,
            file_size INTEGER,
            mime_type VARCHAR(100),
            uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (complaint_id) REFERENCES complaint_regarding(id) ON DELETE CASCADE
        )`, (err) => {
            if (err) {
                console.error('Error creating attachments table:', err);
                reject(err);
            } else {
                console.log('✅ Attachments table ready');
            }
        });

        // Create indexes for better performance
        db.run(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`, () => {});
        db.run(`CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone)`, () => {});
        db.run(`CREATE INDEX IF NOT EXISTS idx_complaints_email ON complaints(email)`, () => {});
        db.run(`CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status)`, () => {});
        db.run(`CREATE INDEX IF NOT EXISTS idx_regarding_email ON complaint_regarding(email)`, () => {});
        db.run(`CREATE INDEX IF NOT EXISTS idx_regarding_status ON complaint_regarding(status)`, () => {});

        // Wait a bit for all tables to be created
        setTimeout(() => resolve(), 1000);
    });
};

module.exports = {
    db,
    generateComplaintNumber,
    generateComplaintNumberNp,
    generateTrackingPassword,
    initDatabase
};