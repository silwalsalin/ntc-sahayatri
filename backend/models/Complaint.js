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
        type: DataTypes.STRING(50),
        unique: true,
        allowNull: false
    },
    complaintNumberNp: {
        type: DataTypes.STRING(50),
        unique: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(100),
        validate: {
            isEmail: true
        }
    },
    phone: {
        type: DataTypes.STRING(15),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    natureOfComplaint: {
        type: DataTypes.STRING(50)
    },
    complaintCategory: {
        type: DataTypes.STRING(50),
        defaultValue: 'general'
    },
    subject: {
        type: DataTypes.STRING(200)
    },
    priority: {
        type: DataTypes.STRING(20),
        defaultValue: 'medium'
    },
    address: {
        type: DataTypes.TEXT
    },
    landmark: {
        type: DataTypes.STRING(200)
    },
    preferredContact: {
        type: DataTypes.STRING(20),
        defaultValue: 'phone'
    },
    referenceNumber: {
        type: DataTypes.STRING(50),
        unique: true
    },
    state: {
        type: DataTypes.STRING(50)
    },
    district: {
        type: DataTypes.STRING(50)
    },
    municipality: {
        type: DataTypes.STRING(100)
    },
    wardNo: {
        type: DataTypes.STRING(10)
    },
    streetAddress: {
        type: DataTypes.STRING(200)
    },
    status: {
        type: DataTypes.STRING(20),
        defaultValue: 'Pending'
    },
    statusNp: {
        type: DataTypes.STRING(20),
        defaultValue: 'विचाराधीन'
    },
    trackingPassword: {
        type: DataTypes.STRING(20)
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