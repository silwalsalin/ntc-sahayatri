// backend/models/Complaint.js
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
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    nameEn: {
        type: DataTypes.STRING
    },
    complaint: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    complaintEn: {
        type: DataTypes.TEXT
    },
    phoneNumber: {
        type: DataTypes.STRING,
        validate: {
            is: /^[0-9]{10}$/
        }
    },
    email: {
        type: DataTypes.STRING,
        validate: {
            isEmail: true
        }
    },
    status: {
        type: DataTypes.ENUM('Pending', 'In Progress', 'Resolved', 'Closed', 'Rejected'),
        defaultValue: 'Pending'
    },
    statusNp: {
        type: DataTypes.ENUM('विचाराधीन', 'प्रगतिमा', 'समाधान भयो', 'बन्द', 'अस्वीकृत'),
        defaultValue: 'विचाराधीन'
    },
    priority: {
        type: DataTypes.ENUM('Low', 'Medium', 'High', 'Urgent'),
        defaultValue: 'Medium'
    },
    category: {
        type: DataTypes.STRING
    },
    resolution: {
        type: DataTypes.TEXT
    },
    assignedTo: {
        type: DataTypes.STRING
    },
    submittedDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    resolvedDate: {
        type: DataTypes.DATE
    }
}, {
    tableName: 'complaints',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Complaint;