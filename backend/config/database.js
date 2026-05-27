// backend/config/database.js
const { Sequelize } = require('sequelize');
require('dotenv').config();

// Create Sequelize instance
const sequelize = new Sequelize(
    process.env.DB_NAME || 'ntc_sahayatri',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || 'root123',
    {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
        logging: console.log, // Set to false to disable SQL logging
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

// Test connection
const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ MySQL Database connected successfully');
        return true;
    } catch (error) {
        console.error('❌ Unable to connect to database:', error);
        return false;
    }
};

module.exports = { sequelize, testConnection };