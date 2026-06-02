const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Staff = sequelize.define('Staff', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    fullName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'fullName'
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true
    },
    department: {
        type: DataTypes.STRING,
        defaultValue: 'General'
    },
    role: {
        type: DataTypes.STRING,
        defaultValue: 'staff'
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: 'isActive'
    },
    lastLogin: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'lastLogin'
    }
}, {
    tableName: 'staff',
    timestamps: true,
    underscored: false
});

module.exports = Staff;