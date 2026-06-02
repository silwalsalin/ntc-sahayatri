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
    nameEn: {
        type: DataTypes.STRING
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            isEmail: true
        }
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    descriptionEn: {
        type: DataTypes.TEXT
    },
    natureOfComplaint: {
        type: DataTypes.STRING
    },
    complaintCategory: {
        type: DataTypes.STRING,
        defaultValue: 'general'
    },
    subject: {
        type: DataTypes.STRING
    },
    priority: {
        type: DataTypes.ENUM('low', 'medium', 'high'),
        defaultValue: 'medium'
    },
    address: {
        type: DataTypes.STRING
    },
    landmark: {
        type: DataTypes.STRING
    },
    preferredContact: {
        type: DataTypes.STRING,
        defaultValue: 'phone'
    },
    referenceNumber: {
        type: DataTypes.STRING
    },
    state: {
        type: DataTypes.STRING
    },
    district: {
        type: DataTypes.STRING
    },
    municipality: {
        type: DataTypes.STRING
    },
    wardNo: {
        type: DataTypes.STRING
    },
    streetAddress: {
        type: DataTypes.STRING
    },
    status: {
        type: DataTypes.ENUM('Pending', 'In Progress', 'Resolved', 'Closed', 'Rejected'),
        defaultValue: 'Pending'
    },
    statusNp: {
        type: DataTypes.STRING,
        defaultValue: 'विचाराधीन'
    },
    trackingPassword: {
        type: DataTypes.STRING
    },
    assignedTo: {
        type: DataTypes.STRING,
        allowNull: true
    },
    assignedToName: {
        type: DataTypes.STRING,
        allowNull: true
    },
    assignedDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    resolvedDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    resolutionDays: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    feedback: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    satisfactionRating: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
            min: 0,
            max: 5
        }
    },
    resolution: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'complaints',
    timestamps: true,
    underscored: true,
    paranoid: false
});

module.exports = Complaint;