// backend/test-db.js
const { sequelize, testConnection } = require('./config/database');
const Complaint = require('./models/Complaint');

const testDatabase = async () => {
    console.log('Testing database connection...');
    
    const connected = await testConnection();
    if (!connected) {
        console.log('Please check your database configuration');
        process.exit(1);
    }
    
    // Create a test complaint
    const testComplaint = await Complaint.create({
        complaintNumber: 'TEST-001',
        name: 'Test User',
        complaint: 'This is a test complaint',
        status: 'Pending'
    });
    
    console.log('✅ Test complaint created:', testComplaint.id);
    
    // Retrieve it
    const found = await Complaint.findByPk(testComplaint.id);
    console.log('✅ Test complaint retrieved:', found.complaint);
    
    // Delete test
    await testComplaint.destroy();
    console.log('✅ Test complaint deleted');
    
    console.log('\n🎉 Database is working perfectly!');
    process.exit(0);
};

testDatabase();