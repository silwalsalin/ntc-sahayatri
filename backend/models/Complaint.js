const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Complaint = sequelize.define('Complaint', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    complaintNumber: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    complaintNumberNp: {
        type: DataTypes.STRING,
        unique: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: ''  // Add default value to avoid NOT NULL error
    },
    natureOfComplaint: {
        type: DataTypes.STRING,
        defaultValue: ''
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    state: {
        type: DataTypes.STRING,
        defaultValue: ''
    },
    district: {
        type: DataTypes.STRING,
        defaultValue: ''
    },
    municipality: {
        type: DataTypes.STRING,
        defaultValue: ''
    },
    wardNo: {
        type: DataTypes.STRING,
        defaultValue: ''
    },
    streetAddress: {
        type: DataTypes.STRING,
        defaultValue: ''
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'Pending'
    },
    statusNp: {
        type: DataTypes.STRING,
        defaultValue: 'विचाराधीन'
    },
    trackingPassword: {
        type: DataTypes.STRING,
        defaultValue: ''
    }
}, {
    tableName: 'complaints',
    timestamps: true
});

module.exports = Complaint;