// backend/database/schema.sql
-- Create complaints table
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
);

-- Create attachments table for file uploads
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
);

-- Create complaint status history table
CREATE TABLE IF NOT EXISTS complaint_status_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    complaint_id INTEGER NOT NULL,
    old_status TEXT,
    new_status TEXT NOT NULL,
    changed_by TEXT,
    notes TEXT,
    changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_complaints_complaint_number ON complaints(complaint_number);
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_created_at ON complaints(created_at);
CREATE INDEX idx_complaints_phone ON complaints(phone);
CREATE INDEX idx_attachments_complaint_id ON attachments(complaint_id);


-- Add complaint_regarding table for detailed complaints
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
);

-- Create attachments table for this complaint type
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
);

-- Create status history table
CREATE TABLE IF NOT EXISTS complaint_regarding_status_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    complaint_id INTEGER NOT NULL,
    old_status TEXT,
    new_status TEXT NOT NULL,
    changed_by TEXT,
    notes TEXT,
    changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (complaint_id) REFERENCES complaint_regarding(id) ON DELETE CASCADE
);
-- Add this to your database (run in SQLite browser or command line)
CREATE TABLE IF NOT EXISTS users (
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
);
-- General Settings Table
CREATE TABLE IF NOT EXISTS settings_general (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  site_name VARCHAR(255) DEFAULT 'NTC Sahayatri',
  site_name_np VARCHAR(255) DEFAULT 'एनटीसी सहयात्री',
  site_description TEXT,
  site_description_np TEXT,
  site_email VARCHAR(255),
  site_phone VARCHAR(50),
  site_address TEXT,
  site_address_np TEXT,
  timezone VARCHAR(100) DEFAULT 'Asia/Kathmandu',
  date_format VARCHAR(50) DEFAULT 'YYYY-MM-DD',
  time_format VARCHAR(10) DEFAULT '24h',
  default_language VARCHAR(5) DEFAULT 'np',
  items_per_page INTEGER DEFAULT 10,
  enable_registration BOOLEAN DEFAULT 1,
  enable_public_complaints BOOLEAN DEFAULT 1,
  maintenance_mode BOOLEAN DEFAULT 0,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Email Settings Table
CREATE TABLE IF NOT EXISTS settings_email (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  smtp_host VARCHAR(255) DEFAULT 'smtp.gmail.com',
  smtp_port VARCHAR(10) DEFAULT '587',
  smtp_user VARCHAR(255),
  smtp_password VARCHAR(255),
  smtp_encryption VARCHAR(50) DEFAULT 'tls',
  from_email VARCHAR(255),
  from_name VARCHAR(255),
  from_name_np VARCHAR(255),
  send_complaint_confirmation BOOLEAN DEFAULT 1,
  send_complaint_update BOOLEAN DEFAULT 1,
  send_complaint_resolved BOOLEAN DEFAULT 1,
  send_newsletter BOOLEAN DEFAULT 0,
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
  ip_whitelist TEXT,
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
  admin_email VARCHAR(255),
  admin_phone VARCHAR(50),
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS `staff` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(100) NOT NULL UNIQUE,
    `email` VARCHAR(255) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `fullName` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(20) NULL,
    `department` VARCHAR(100) DEFAULT 'General',
    `role` ENUM('staff', 'supervisor', 'manager') DEFAULT 'staff',
    `status` ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    `isActive` BOOLEAN DEFAULT TRUE,
    `lastLogin` DATETIME NULL,
    `profileImage` VARCHAR(500) NULL,
    `address` TEXT NULL,
    `hireDate` DATETIME NULL,
    `createdBy` INT NULL,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_staff_email` (`email`),
    INDEX `idx_staff_username` (`username`),
    INDEX `idx_staff_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create index for faster lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);

-- Create indexes
CREATE INDEX idx_complaint_regarding_complaint_number ON complaint_regarding(complaint_number);
CREATE INDEX idx_complaint_regarding_status ON complaint_regarding(status);
CREATE INDEX idx_complaint_regarding_phone ON complaint_regarding(phone);
CREATE INDEX idx_complaint_regarding_created_at ON complaint_regarding(created_at);