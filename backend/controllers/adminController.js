// Add these functions to your existing adminController.js

// Get all staff members
const getStaffMembers = async (req, res) => {
    try {
        const db = require('../config/database');
        const staff = await new Promise((resolve, reject) => {
            db.all(
                'SELECT id, name, name_en, email, phone, role, status, created_at, last_login FROM users WHERE role = "staff"',
                [],
                (err, rows) => {
                    if (err) reject(err);
                    resolve(rows);
                }
            );
        });
        
        res.json({ success: true, data: staff });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Create staff member
const createStaff = async (req, res) => {
    try {
        const { name, nameEn, email, phone, password } = req.body;
        const bcrypt = require('bcryptjs');
        const db = require('../config/database');
        
        // Check if user exists
        const existing = await new Promise((resolve, reject) => {
            db.get('SELECT id FROM users WHERE email = ?', [email], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });
        
        if (existing) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        await new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO users (name, name_en, email, phone, password, role, status) VALUES (?, ?, ?, ?, ?, "staff", "active")',
                [name, nameEn, email, phone, hashedPassword],
                (err) => {
                    if (err) reject(err);
                    resolve();
                }
            );
        });
        
        res.json({ success: true, message: 'Staff member created successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Assign complaint to staff
const assignComplaint = async (req, res) => {
    try {
        const { complaintId, staffEmail } = req.body;
        const db = require('../config/database');
        
        await new Promise((resolve, reject) => {
            db.run(
                'UPDATE complaints SET assigned_to = ?, assigned_date = CURRENT_TIMESTAMP WHERE id = ?',
                [staffEmail, complaintId],
                (err) => {
                    if (err) reject(err);
                    resolve();
                }
            );
        });
        
        res.json({ success: true, message: 'Complaint assigned successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = {
    // ... existing exports
    getStaffMembers,
    createStaff,
    assignComplaint
};