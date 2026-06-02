const Complaint = require('./Complaint');
const Admin = require('./Admin');
const Staff = require('./Staff');

const syncDatabase = async () => {
    try {
        // Use force: true only for development to reset tables
        // WARNING: This will delete all existing data
        const forceSync = process.env.FORCE_SYNC === 'true';
        
        if (forceSync) {
            console.log('⚠️ Force sync enabled - dropping existing tables...');
            await Complaint.sync({ force: true });
            await Admin.sync({ force: true });
            await Staff.sync({ force: true });
            console.log('✅ Tables recreated successfully');
        } else {
            await Complaint.sync({ alter: true });
            await Admin.sync({ alter: true });
            await Staff.sync({ alter: true });
            console.log('✅ Database synchronized successfully');
        }
    } catch (error) {
        console.error('❌ Database sync failed:', error);
        throw error;
    }
};

module.exports = {
    Complaint,
    Admin,
    Staff,
    syncDatabase
};