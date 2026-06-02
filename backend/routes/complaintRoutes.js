const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// Get all complaints (accessible by both admin and staff)
router.get('/', protect, async (req, res) => {
    try {
        const db = require('../config/database');
        const complaints = await new Promise((resolve, reject) => {
            db.all('SELECT * FROM complaints ORDER BY created_at DESC', [], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
        
        res.json({ success: true, data: complaints });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get single complaint
router.get('/:id', protect, async (req, res) => {
    try {
        const db = require('../config/database');
        const complaint = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM complaints WHERE id = ?', [req.params.id], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });
        
        if (!complaint) {
            return res.status(404).json({ success: false, message: 'Complaint not found' });
        }
        
        res.json({ success: true, data: complaint });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;