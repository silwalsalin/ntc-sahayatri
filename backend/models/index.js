// backend/models/index.js
const { sequelize } = require('../config/database');
const Complaint = require('./Complaint');
const User = require('./User');

// Define associations
User.hasMany(Complaint, { foreignKey: 'assignedTo' });
Complaint.belongsTo(User, { foreignKey: 'assignedTo', as: 'assignee' });

// Sync all models with database
const syncDatabase = async (force = false) => {
    try {
        await sequelize.sync({ force, alter: true });
        console.log('✅ Database synchronized');
        
        // Create default admin user if needed
        const adminExists = await User.findOne({ where: { username: 'admin' } });
        if (!adminExists) {
            await User.create({
                username: 'admin',
                email: 'admin@ntc.com',
                password: 'admin123', // In production, hash this!
                fullName: 'System Admin',
                role: 'admin'
            });
            console.log('✅ Default admin user created');
        }
    } catch (error) {
        console.error('❌ Database sync failed:', error);
    }
};

module.exports = {
    sequelize,
    Complaint,
    User,
    syncDatabase
};