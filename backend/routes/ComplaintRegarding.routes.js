const express = require('express');
const ComplaintRegarding = require('../models/ComplaintRegarding.model');
const { protect, staffOrAdmin } = require('../middleware/auth.middleware');

const router = express.Router();

// @route   GET /api/complaint-regarding
// @desc    Get all complaint regardings
// @access  Private/Staff/Admin
router.get('/', protect, staffOrAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 100, status, category } = req.query;
    
    let query = {};
    if (status && status !== 'all') query.status = status;
    if (category && category !== 'all') query.category = category;
    
    const regardings = await ComplaintRegarding.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await ComplaintRegarding.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: regardings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get complaint regardings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching complaint regardings'
    });
  }
});

// @route   POST /api/complaint-regarding
// @desc    Create a new complaint regarding
// @access  Public
router.post('/', async (req, res) => {
  try {
    const regarding = await ComplaintRegarding.create(req.body);
    res.status(201).json({
      success: true,
      data: regarding
    });
  } catch (error) {
    console.error('Create complaint regarding error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating complaint regarding'
    });
  }
});

module.exports = router;