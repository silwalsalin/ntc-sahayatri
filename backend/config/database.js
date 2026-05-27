// backend/config/database.js
const { Sequelize } = require('sequelize');

// SQLite database configuration
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: false
});

const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ SQLite Database connected successfully');
        console.log('📁 Database file: database.sqlite');
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        return false;
    }
};

module.exports = { sequelize, testConnection };