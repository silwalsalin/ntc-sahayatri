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