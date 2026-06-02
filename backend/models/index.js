// backend/models/index.js
const { sequelize } = require('../config/database');
const Complaint = require('./Complaint');
const Admin = require('./Admin');

const syncDatabase = async (force = false) => {
    try {
        await sequelize.sync({ alter: true });
        console.log('✅ Database synchronized');
        
        // Create default permanent admin if not exists
        const adminCount = await Admin.count();
        if (adminCount === 0) {
            await Admin.create({
                email: 'admin@ntc.com',
                username: 'admin@ntc',
                password: 'admin123',
                fullName: 'System Administrator',
                role: 'super_admin',
                isActive: true
            });
            console.log('✅ Default admin user created successfully');
            console.log('   📧 Email: admin@ntc.com');
            console.log('   🔑 Password: admin123');
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
    Admin,
    syncDatabase
};