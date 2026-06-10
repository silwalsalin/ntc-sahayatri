const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const Staff = sequelize.define('Staff', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
            len: [3, 100],
            isAlphanumeric: true
        }
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    fullName: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
        validate: {
            is: /^[0-9+\-\s]+$/
        }
    },
    department: {
        type: DataTypes.STRING(100),
        defaultValue: 'General'
    },
    role: {
        type: DataTypes.ENUM('staff', 'supervisor', 'manager'),
        defaultValue: 'staff'
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive', 'suspended'),
        defaultValue: 'active'
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    lastLogin: {
        type: DataTypes.DATE,
        allowNull: true
    },
    profileImage: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    hireDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    createdBy: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    tableName: 'staff',
    timestamps: true,
    underscored: false,
    hooks: {
        beforeCreate: async (staff) => {
            if (staff.password) {
                staff.password = await bcrypt.hash(staff.password, 10);
            }
        },
        beforeUpdate: async (staff) => {
            if (staff.changed('password')) {
                staff.password = await bcrypt.hash(staff.password, 10);
            }
        }
    }
});

// Instance method to compare password
Staff.prototype.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

// Instance method to get public data (without sensitive info)
Staff.prototype.getPublicData = function() {
    return {
        id: this.id,
        username: this.username,
        email: this.email,
        fullName: this.fullName,
        phone: this.phone,
        department: this.department,
        role: this.role,
        status: this.status,
        isActive: this.isActive,
        lastLogin: this.lastLogin,
        profileImage: this.profileImage,
        address: this.address,
        hireDate: this.hireDate,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
    };
};

// Static method to find active staff
Staff.findActive = function() {
    return this.findAll({
        where: {
            status: 'active',
            isActive: true
        }
    });
};

// Static method to find by email with password (for login)
Staff.findByEmailWithPassword = function(email) {
    return this.findOne({
        where: { email }
    });
};

module.exports = Staff;