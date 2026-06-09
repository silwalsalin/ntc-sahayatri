const express = require('express');
const User = require('../models/User.model');
const Complaint = require('../models/Complaint.model');
const ComplaintRegarding = require('../models/ComplaintRegarding.model');
const { protect, adminOnly } = require('../middleware/auth.middleware');

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users with pagination and filters
// @access  Private/Admin
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 100, role, status, search } = req.query;
    
    let query = {};
    
    if (role && role !== 'all') {
      query.role = role;
    }
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { nameEn: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search } }
      ];
    }
    
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await User.countDocuments(query);
    
    // Get complaint counts for each user
    const usersWithStats = await Promise.all(users.map(async (user) => {
      const complaints = await Complaint.find({ email: user.email });
      const complaintRegardings = await ComplaintRegarding.find({ email: user.email });
      
      return {
        ...user.toObject(),
        complaintsCount: complaints.length,
        complaintRegardingsCount: complaintRegardings.length,
        complaints: complaints,
        complaintRegardings: complaintRegardings
      };
    }));
    
    res.status(200).json({
      success: true,
      data: usersWithStats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
});

// @route   GET /api/users/check
// @desc    Check if user exists by email
// @access  Private/Admin
router.get('/check', protect, adminOnly, async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }
    
    const user = await User.findOne({ email: email.toLowerCase() });
    
    res.status(200).json({
      success: true,
      exists: !!user,
      user: user ? user.getPublicData() : null
    });
  } catch (error) {
    console.error('Check user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking user'
    });
  }
});

// @route   GET /api/users/:id
// @desc    Get single user by ID
// @access  Private/Admin
router.get('/:id', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Get user's complaints
    const complaints = await Complaint.find({ email: user.email });
    const complaintRegardings = await ComplaintRegarding.find({ email: user.email });
    
    res.status(200).json({
      success: true,
      data: {
        ...user.toObject(),
        complaintsCount: complaints.length,
        complaintRegardingsCount: complaintRegardings.length,
        complaints,
        complaintRegardings
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user'
    });
  }
});

// @route   POST /api/users
// @desc    Create a new user
// @access  Private/Admin
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { name, nameEn, email, phone, role, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email: email.toLowerCase() }, { phone }] 
    });
    
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email or phone already exists'
      });
    }
    
    const user = await User.create({
      name,
      nameEn,
      email: email.toLowerCase(),
      phone,
      role: role || 'user',
      password,
      status: 'active',
      createdBy: req.user._id
    });
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user.getPublicData()
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating user'
    });
  }
});

// @route   PUT /api/users/:id
// @desc    Update a user
// @access  Private/Admin
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { name, nameEn, email, phone, role, status } = req.body;
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if email/phone already exists for other users
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ email: email.toLowerCase(), _id: { $ne: req.params.id } });
      if (existingEmail) {
        return res.status(409).json({
          success: false,
          message: 'Email already exists'
        });
      }
    }
    
    if (phone && phone !== user.phone) {
      const existingPhone = await User.findOne({ phone, _id: { $ne: req.params.id } });
      if (existingPhone) {
        return res.status(409).json({
          success: false,
          message: 'Phone number already exists'
        });
      }
    }
    
    // Update fields
    if (name) user.name = name;
    if (nameEn) user.nameEn = nameEn;
    if (email) user.email = email.toLowerCase();
    if (phone) user.phone = phone;
    if (role) user.role = role;
    if (status) user.status = status;
    
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user.getPublicData()
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating user'
    });
  }
});

// @route   PATCH /api/users/:id/status
// @desc    Update user status (active/inactive/suspended)
// @access  Private/Admin
router.patch('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status || !['active', 'inactive', 'suspended'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be active, inactive, or suspended'
      });
    }
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Prevent admin from changing their own status
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You cannot change your own status'
      });
    }
    
    user.status = status;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: `User status updated to ${status}`,
      data: user.getPublicData()
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user status'
    });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete a user
// @access  Private/Admin
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }
    
    await user.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user'
    });
  }
});

// @route   GET /api/users/stats/summary
// @desc    Get user statistics
// @access  Private/Admin
router.get('/stats/summary', protect, adminOnly, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: 'active' });
    const inactiveUsers = await User.countDocuments({ status: 'inactive' });
    const suspendedUsers = await User.countDocuments({ status: 'suspended' });
    
    const usersByRole = {
      admin: await User.countDocuments({ role: 'admin' }),
      staff: await User.countDocuments({ role: 'staff' }),
      user: await User.countDocuments({ role: 'user' })
    };
    
    // Get users who have submitted complaints
    const usersWithComplaints = await Complaint.distinct('email');
    const complainantsCount = usersWithComplaints.length;
    
    res.status(200).json({
      success: true,
      data: {
        total: totalUsers,
        active: activeUsers,
        inactive: inactiveUsers,
        suspended: suspendedUsers,
        byRole: usersByRole,
        complainants: complainantsCount
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics'
    });
  }
});

module.exports = router;