// backend/scripts/initDb.js
const { sequelize, syncDatabase } = require('../models');

const initDatabase = async () => {
    console.log('🔄 Initializing database...');
    
    try {
        // Sync all tables (force: true will drop existing tables)
        await syncDatabase(false); // Set to true only for development
        
        console.log('✅ Database initialization complete');
        process.exit(0);
    } catch (error) {
        console.error('❌ Database initialization failed:', error);
        process.exit(1);
    }
};

initDatabase();