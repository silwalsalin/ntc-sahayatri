// backend/models/index.js
const { sequelize } = require('../config/database');
const Complaint = require('./Complaint');
const Admin = require('./Admin'); // Add this line

// Define associations
// Add any associations here if needed

// Sync database
const syncDatabase = async (force = false) => {
    try {
        await sequelize.sync({ alter: true });
        console.log('✅ Database synchronized');
        
        // Create default admin if not exists
        const adminCount = await Admin.count();
        if (adminCount === 0) {
            await Admin.create({
                username: 'admin@ntc',
                email: 'admin@ntc.com',
                password: 'admin123', // In production, hash this!
                fullName: 'System Administrator',
                role: 'admin',
                isActive: true
            });
            console.log('✅ Default admin user created');
            console.log('   Username: admin@ntc');
            console.log('   Password: admin123');
        }
        
        return true;
    } catch (error) {
        console.error('❌ Database sync failed:', error);
        return false;
    }
};

module.exports = {
    sequelize,
    Complaint,
    Admin, // Add this line
    syncDatabase
};