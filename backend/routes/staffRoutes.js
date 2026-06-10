// staffRoutes.js
const express = require('express');
const router = express.Router();
const { protect, staffOnly } = require('../middleware/authMiddleware');
const {
    staffLogin,
    getStaffStats,
    getAssignedComplaints,
    updateComplaintStatus,
    getComplaintDetails,
    getStaffProfile,
    updateStaffProfile,
    changeStaffPassword
} = require('../controllers/staffController');

// Public routes
router.post('/login', staffLogin);

// Protected routes (require authentication)
router.use(protect);
router.use(staffOnly);

// Staff dashboard routes
router.get('/stats', getStaffStats);
router.get('/complaints', getAssignedComplaints);
router.get('/complaints/:id', getComplaintDetails);
router.put('/complaints/:id/status', updateComplaintStatus);
router.get('/profile', getStaffProfile);
router.put('/profile', updateStaffProfile);
router.put('/change-password', changeStaffPassword);

module.exports = router;