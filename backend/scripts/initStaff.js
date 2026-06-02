const bcrypt = require('bcryptjs');
const db = require('../config/database');

const initStaff = async () => {
    try {
        // Hash password for staff
        const staffPassword = await bcrypt.hash('staff123', 10);
        
        // Insert staff user if not exists
        db.run(
            `INSERT OR IGNORE INTO users (name, name_en, email, phone, password, role, status, created_at) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            ['Staff User', 'Staff User', 'staff@ntc.com', '9841000001', staffPassword, 'staff', 'active', new Date().toISOString()],
            (err) => {
                if (err) {
                    console.error('Error inserting staff:', err);
                } else {
                    console.log('Staff user created successfully');
                }
            }
        );
        
        console.log('Staff initialization completed');
    } catch (error) {
        console.error('Error initializing staff:', error);
    }
};

initStaff();