const express = require('express');
const router = express.Router();
const GarbageReport = require('../models/GarbageReport');
const Collector = require('../models/Collector');
const User = require('../models/User');

// Dashboard statistics
router.get('/dashboard', async (req, res) => {
  try {
    const totalReports = await GarbageReport.countDocuments();
    const pendingReports = await GarbageReport.countDocuments({ status: 'pending' });
    const collectedReports = await GarbageReport.countDocuments({ status: 'collected' });
    const totalCollectors = await Collector.countDocuments();
    const activeCollectors = await Collector.countDocuments({ isActive: true });
    const totalUsers = await User.countDocuments();

    res.json({
      success: true,
      stats: {
        totalReports,
        pendingReports,
        collectedReports,
        totalCollectors,
        activeCollectors,
        totalUsers
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all reports
router.get('/reports', async (req, res) => {
  try {
    const { status } = req.query;
    
    const query = {};
    if (status) query.status = status;

    const reports = await GarbageReport.find(query)
      .populate('userId', 'name email phone')
      .populate('collectorId', 'name phone vehicleNumber')
      .sort({ createdAt: -1 });

    res.json({ success: true, reports });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all collectors
router.get('/collectors', async (req, res) => {
  try {
    const collectors = await Collector.find().sort({ createdAt: -1 });
    res.json({ success: true, collectors });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;