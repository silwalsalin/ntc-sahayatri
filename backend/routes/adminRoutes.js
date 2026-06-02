const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
    adminLogin,
    getDashboardStats,
    getStaffMembers,
    createStaff,
    assignComplaint
} = require('../controllers/adminController');

// Public route - Admin login
router.post('/login', adminLogin);

// Protected routes
router.use(protect, adminOnly);

// Dashboard
router.get('/stats', getDashboardStats);

// Staff management
router.get('/staff', getStaffMembers);
router.post('/staff', createStaff);

// Complaint management
router.post('/complaints/assign', assignComplaint);

module.exports = router;