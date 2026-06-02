const express = require('express');
const router = express.Router();
const { protect, staffOnly } = require('../middleware/authMiddleware');
const {
    staffLogin,
    getStaffStats,
    getAssignedComplaints,
    updateComplaintStatus,
    getComplaintDetails
} = require('../controllers/staffController');

// Public route - Staff login
router.post('/login', staffLogin);

// Protected routes (require authentication)
router.use(protect, staffOnly);

// Dashboard statistics
router.get('/stats', getStaffStats);

// Complaints management
router.get('/complaints', getAssignedComplaints);
router.get('/complaints/:id', getComplaintDetails);
router.patch('/complaints/:id/status', updateComplaintStatus);

module.exports = router;