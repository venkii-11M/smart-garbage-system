const express = require('express');
const router = express.Router();
const User = require('../models/User');
const GarbageReport = require('../models/GarbageReport');

// Get user profile and statistics
router.get('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get statistics
    const totalReports = await GarbageReport.countDocuments({ userId });
    const pendingReports = await GarbageReport.countDocuments({ 
      userId, 
      status: 'pending' 
    });
    const completedReports = await GarbageReport.countDocuments({ 
      userId, 
      status: 'collected' 
    });

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        address: user.address,
        profileImage: user.profileImage
      },
      statistics: {
        totalReports,
        pendingReports,
        completedReports
      }
    });

  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user profile
router.put('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, phone, email, address } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { name, phone, email, address },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user
    });

  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user's reports
router.get('/reports/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.query;

    const query = { userId };
    if (status && status !== 'all') {
      query.status = status;
    }

    const reports = await GarbageReport.find(query)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      reports
    });

  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;