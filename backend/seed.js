// backend/seed.js
const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'complaints.db');
const db = new sqlite3.Database(dbPath);

async function seedAdmin() {
    try {
        // Check if admin already exists
        db.get(`SELECT id FROM users WHERE email = ?`, ['admin@example.com'], async (err, user) => {
            if (err) {
                console.error('Error checking admin:', err);
                return;
            }
            
            if (user) {
                console.log('Admin user already exists');
                db.close();
                return;
            }
            
            // Create admin user
            const hashedPassword = await bcrypt.hash('admin123', 10);
            
            db.run(`INSERT INTO users (name, name_en, email, phone, password, role, status, created_at, updated_at) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
                ['प्रशासक', 'Admin', 'admin@example.com', '9800000000', hashedPassword, 'admin', 'active'],
                function(err) {
                    if (err) {
                        console.error('Error creating admin:', err);
                    } else {
                        console.log('✅ Admin user created successfully!');
                        console.log('📧 Email: admin@example.com');
                        console.log('🔑 Password: admin123');
                    }
                    db.close();
                });
        });
    } catch (error) {
        console.error('Seed error:', error);
        db.close();
    }
}

seedAdmin();