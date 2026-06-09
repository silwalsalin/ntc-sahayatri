const express = require('express');
const Complaint = require('../models/Complaint.model');
const { protect, staffOrAdmin } = require('../middleware/auth.middleware');

const router = express.Router();

// @route   GET /api/complaints
// @desc    Get all complaints
// @access  Private/Staff/Admin
router.get('/', protect, staffOrAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 100, status, category } = req.query;
    
    let query = {};
    if (status && status !== 'all') query.status = status;
    if (category && category !== 'all') query.category = category;
    
    const complaints = await Complaint.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await Complaint.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: complaints,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get complaints error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching complaints'
    });
  }
});

// @route   POST /api/complaints
// @desc    Create a new complaint
// @access  Public
router.post('/', async (req, res) => {
  try {
    const complaint = await Complaint.create(req.body);
    res.status(201).json({
      success: true,
      data: complaint
    });
  } catch (error) {
    console.error('Create complaint error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating complaint'
    });
  }
});

module.exports = router;