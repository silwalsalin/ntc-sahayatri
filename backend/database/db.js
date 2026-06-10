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

        // Create settings tables
        const createSettingsTables = `
            -- General Settings Table
            CREATE TABLE IF NOT EXISTS settings_general (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                site_name VARCHAR(255) DEFAULT 'NTC Sahayatri',
                site_name_np VARCHAR(255) DEFAULT 'एनटीसी सहयात्री',
                site_description TEXT DEFAULT 'Complaint Tracking System for Nepal Telecom',
                site_description_np TEXT DEFAULT 'नेपाल दूरसञ्चारको लागि गुनासो ट्र्याकिङ प्रणाली',
                site_email VARCHAR(255) DEFAULT 'support@ntc.com.np',
                site_phone VARCHAR(50) DEFAULT '01-4960008',
                site_address TEXT DEFAULT 'Bhadrakali Plaza, Kathmandu',
                site_address_np TEXT DEFAULT 'भद्रकाली प्लाजा, काठमाडौं',
                timezone VARCHAR(100) DEFAULT 'Asia/Kathmandu',
                date_format VARCHAR(50) DEFAULT 'YYYY-MM-DD',
                time_format VARCHAR(10) DEFAULT '24h',
                default_language VARCHAR(5) DEFAULT 'np',
                items_per_page INTEGER DEFAULT 10,
                enable_registration BOOLEAN DEFAULT 1,
                enable_public_complaints BOOLEAN DEFAULT 1,
                maintenance_mode BOOLEAN DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            -- Email Settings Table
            CREATE TABLE IF NOT EXISTS settings_email (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                smtp_host VARCHAR(255) DEFAULT 'smtp.gmail.com',
                smtp_port VARCHAR(10) DEFAULT '587',
                smtp_user VARCHAR(255) DEFAULT '',
                smtp_password VARCHAR(255) DEFAULT '',
                smtp_encryption VARCHAR(50) DEFAULT 'tls',
                from_email VARCHAR(255) DEFAULT 'notifications@ntc.com.np',
                from_name VARCHAR(255) DEFAULT 'NTC Sahayatri',
                from_name_np VARCHAR(255) DEFAULT 'एनटीसी सहयात्री',
                send_complaint_confirmation BOOLEAN DEFAULT 1,
                send_complaint_update BOOLEAN DEFAULT 1,
                send_complaint_resolved BOOLEAN DEFAULT 1,
                send_newsletter BOOLEAN DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            -- Security Settings Table
            CREATE TABLE IF NOT EXISTS settings_security (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_timeout INTEGER DEFAULT 30,
                max_login_attempts INTEGER DEFAULT 5,
                lockout_duration INTEGER DEFAULT 15,
                password_expiry_days INTEGER DEFAULT 90,
                min_password_length INTEGER DEFAULT 8,
                require_uppercase BOOLEAN DEFAULT 1,
                require_lowercase BOOLEAN DEFAULT 1,
                require_numbers BOOLEAN DEFAULT 1,
                require_special_chars BOOLEAN DEFAULT 1,
                two_factor_auth BOOLEAN DEFAULT 0,
                ip_whitelist TEXT DEFAULT '',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            -- Backup Settings Table
            CREATE TABLE IF NOT EXISTS settings_backup (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                auto_backup BOOLEAN DEFAULT 1,
                backup_frequency VARCHAR(20) DEFAULT 'daily',
                backup_time VARCHAR(10) DEFAULT '02:00',
                backup_retention INTEGER DEFAULT 30,
                backup_location VARCHAR(500) DEFAULT '/backups/',
                last_backup DATETIME,
                last_backup_size VARCHAR(50),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            -- Notification Settings Table
            CREATE TABLE IF NOT EXISTS settings_notifications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email_notifications BOOLEAN DEFAULT 1,
                sms_notifications BOOLEAN DEFAULT 0,
                push_notifications BOOLEAN DEFAULT 1,
                notify_new_complaint BOOLEAN DEFAULT 1,
                notify_complaint_update BOOLEAN DEFAULT 1,
                notify_complaint_resolved BOOLEAN DEFAULT 1,
                notify_new_user BOOLEAN DEFAULT 1,
                notify_system_update BOOLEAN DEFAULT 1,
                admin_email VARCHAR(255) DEFAULT '',
                admin_phone VARCHAR(50) DEFAULT '',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `;

        // Execute settings tables creation
        db.exec(createSettingsTables, (err) => {
            if (err) {
                console.error('Error creating settings tables:', err);
            } else {
                console.log('✅ Settings tables ready');
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