const jwt = require('jsonwebtoken');
const db = require('../config/database');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');

            // Get user from database
            const user = await new Promise((resolve, reject) => {
                db.get(
                    'SELECT id, name, name_en, email, phone, role, status FROM users WHERE id = ?',
                    [decoded.id],
                    (err, user) => {
                        if (err) reject(err);
                        resolve(user);
                    }
                );
            });

            if (!user) {
                return res.status(401).json({ success: false, message: 'User not found' });
            }

            if (user.status !== 'active') {
                return res.status(401).json({ success: false, message: 'Account is inactive' });
            }

            req.user = user;
            next();
        } catch (error) {
            console.error(error);
            return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }
};

const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ success: false, message: 'Admin access required' });
    }
};

const staffOnly = (req, res, next) => {
    if (req.user && (req.user.role === 'staff' || req.user.role === 'admin')) {
        next();
    } else {
        return res.status(403).json({ success: false, message: 'Staff access required' });
    }
};

module.exports = { protect, adminOnly, staffOnly };