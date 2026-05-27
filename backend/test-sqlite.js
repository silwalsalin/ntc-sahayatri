// backend/test-sqlite.js
const { sequelize, testConnection } = require('./config/database');
const Complaint = require('./models/Complaint');

const test = async () => {
    console.log('Testing SQLite connection...');
    
    const connected = await testConnection();
    if (!connected) {
        console.log('Failed to connect');
        process.exit(1);
    }
    
    await sequelize.sync({ force: true });
    console.log('✅ Tables created');
    
    const testComplaint = await Complaint.create({
        complaintNumber: 'TEST-001',
        name: 'Test User',
        complaint: 'Test complaint',
        phoneNumber: '9841234567',
        email: 'test@example.com'
    });
    
    console.log('✅ Test complaint created:', testComplaint.id);
    
    const count = await Complaint.count();
    console.log('✅ Total complaints:', count);
    
    console.log('\n🎉 SQLite is working perfectly!');
    process.exit(0);
};

test();