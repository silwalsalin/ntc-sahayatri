const bcrypt = require('bcryptjs');
const db = require('../config/database');

const initStaff = async () => {
    try {
        console.log('Initializing staff users...');
        
        // Hash password for staff
        const staffPassword = await bcrypt.hash('staff123', 10);
        const adminPassword = await bcrypt.hash('admin123', 10);
        
        // First, check if admin user exists
        const checkAdminQuery = `SELECT id FROM users WHERE email = ?`;
        
        db.get(checkAdminQuery, ['admin@example.com'], async (err, adminExists) => {
            if (err) {
                console.error('Error checking admin:', err);
                return;
            }
            
            // Insert admin user if not exists
            if (!adminExists) {
                db.run(
                    `INSERT INTO users (name, name_en, email, phone, password, role, status, created_at, updated_at) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
                    ['प्रशासक', 'Admin User', 'admin@example.com', '9800000000', adminPassword, 'admin', 'active'],
                    (err) => {
                        if (err) {
                            console.error('Error inserting admin:', err);
                        } else {
                            console.log('✅ Admin user created successfully');
                            console.log('   Email: admin@example.com');
                            console.log('   Password: admin123');
                        }
                    }
                );
            } else {
                console.log('✅ Admin user already exists');
            }
        });
        
        // Insert staff user if not exists
        db.get(`SELECT id FROM users WHERE email = ?`, ['staff@example.com'], async (err, staffExists) => {
            if (err) {
                console.error('Error checking staff:', err);
                return;
            }
            
            if (!staffExists) {
                db.run(
                    `INSERT INTO users (name, name_en, email, phone, password, role, status, created_at, updated_at) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
                    ['कर्मचारी', 'Staff User', 'staff@example.com', '9841000001', staffPassword, 'staff', 'active'],
                    (err) => {
                        if (err) {
                            console.error('Error inserting staff:', err);
                        } else {
                            console.log('✅ Staff user created successfully');
                            console.log('   Email: staff@example.com');
                            console.log('   Password: staff123');
                        }
                    }
                );
            } else {
                console.log('✅ Staff user already exists');
            }
        });
        
        // Wait a bit for operations to complete
        setTimeout(() => {
            console.log('Staff initialization completed');
        }, 1000);
        
    } catch (error) {
        console.error('Error initializing staff:', error);
    }
};

// Run initialization
initStaff();

// Export for use in other files if needed
module.exports = { initStaff };