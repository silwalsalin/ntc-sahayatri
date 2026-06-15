const jwt = require('jsonwebtoken');
const db = require('../config/database');

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production_2024';

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, JWT_SECRET);

            // Get user from database (includes staff and admin)
            const user = await new Promise((resolve, reject) => {
                db.get(
                    `SELECT id, name, name_en, email, phone, role, status, created_at, last_login 
                     FROM users 
                     WHERE id = ? AND (role = 'admin' OR role = 'staff')`,
                    [decoded.id],
                    (err, user) => {
                        if (err) reject(err);
                        resolve(user);
                    }
                );
            });

            if (!user) {
                return res.status(401).json({ 
                    success: false, 
                    message: 'User not found. Please login again.' 
                });
            }

            if (user.status !== 'active') {
                return res.status(401).json({ 
                    success: false, 
                    message: 'Account is inactive. Please contact administrator.' 
                });
            }

            req.user = user;
            next();
        } catch (error) {
            console.error('Auth error:', error);
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({ 
                    success: false, 
                    message: 'Invalid token. Please login again.' 
                });
            }
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ 
                    success: false, 
                    message: 'Token expired. Please login again.' 
                });
            }
            return res.status(401).json({ 
                success: false, 
                message: 'Not authorized, token failed' 
            });
        }
    }

    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: 'Not authorized, no token provided' 
        });
    }
};

const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ 
            success: false, 
            message: 'Admin access required. You do not have permission to access this resource.' 
        });
    }
};

const staffOnly = (req, res, next) => {
    if (req.user && (req.user.role === 'staff' || req.user.role === 'admin')) {
        next();
    } else {
        return res.status(403).json({ 
            success: false, 
            message: 'Staff access required. Please contact administrator for access.' 
        });
    }
};

// Optional: Staff or Admin middleware (alias for staffOnly)
const staffOrAdmin = (req, res, next) => {
    if (req.user && (req.user.role === 'staff' || req.user.role === 'admin')) {
        next();
    } else {
        return res.status(403).json({ 
            success: false, 
            message: 'Access denied. Staff or Admin privileges required.' 
        });
    }
};

// Settings specific middleware
const canViewSettings = (req, res, next) => {
    if (req.user && (req.user.role === 'admin')) {
        next();
    } else {
        return res.status(403).json({ 
            success: false, 
            message: 'Admin access required to view settings.' 
        });
    }
};

const canEditSettings = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ 
            success: false, 
            message: 'Admin access required to modify settings.' 
        });
    }
};

const canViewGeneralSettings = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ 
            success: false, 
            message: 'Admin access required to view general settings.' 
        });
    }
};

const canEditGeneralSettings = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ 
            success: false, 
            message: 'Admin access required to modify general settings.' 
        });
    }
};

const canViewEmailSettings = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ 
            success: false, 
            message: 'Admin access required to view email settings.' 
        });
    }
};

const canEditEmailSettings = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ 
            success: false, 
            message: 'Admin access required to modify email settings.' 
        });
    }
};

const canViewSecuritySettings = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ 
            success: false, 
            message: 'Admin access required to view security settings.' 
        });
    }
};

const canEditSecuritySettings = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ 
            success: false, 
            message: 'Admin access required to modify security settings.' 
        });
    }
};

const canViewBackupSettings = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ 
            success: false, 
            message: 'Admin access required to view backup settings.' 
        });
    }
};

const canEditBackupSettings = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ 
            success: false, 
            message: 'Admin access required to modify backup settings.' 
        });
    }
};

const canViewNotificationSettings = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ 
            success: false, 
            message: 'Admin access required to view notification settings.' 
        });
    }
};

const canEditNotificationSettings = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ 
            success: false, 
            message: 'Admin access required to modify notification settings.' 
        });
    }
};

const canPerformBackup = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ 
            success: false, 
            message: 'Admin access required to perform backup operations.' 
        });
    }
};

const canSendTestEmail = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ 
            success: false, 
            message: 'Admin access required to send test emails.' 
        });
    }
};

// Combined settings access middleware
const settingsAccess = {
    view: (req, res, next) => {
        if (req.user && req.user.role === 'admin') {
            next();
        } else {
            return res.status(403).json({ 
                success: false, 
                message: 'Admin access required to access settings.' 
            });
        }
    },
    edit: (req, res, next) => {
        if (req.user && req.user.role === 'admin') {
            next();
        } else {
            return res.status(403).json({ 
                success: false, 
                message: 'Admin access required to modify settings.' 
            });
        }
    }
};

// Optional: Get current user profile
const getCurrentUser = async (req, res) => {
    try {
        const user = await new Promise((resolve, reject) => {
            db.get(
                `SELECT id, name, name_en, email, phone, role, status, created_at, last_login 
                 FROM users 
                 WHERE id = ?`,
                [req.user.id],
                (err, user) => {
                    if (err) reject(err);
                    resolve(user);
                }
            );
        });
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Error getting current user:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get user information'
        });
    }
};

// Export all middleware
module.exports = { 
    protect, 
    adminOnly, 
    staffOnly, 
    staffOrAdmin,
    getCurrentUser,
    // Settings specific middleware
    canViewSettings,
    canEditSettings,
    canViewGeneralSettings,
    canEditGeneralSettings,
    canViewEmailSettings,
    canEditEmailSettings,
    canViewSecuritySettings,
    canEditSecuritySettings,
    canViewBackupSettings,
    canEditBackupSettings,
    canViewNotificationSettings,
    canEditNotificationSettings,
    canPerformBackup,
    canSendTestEmail,
    settingsAccess
};