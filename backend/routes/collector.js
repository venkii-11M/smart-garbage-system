const express = require('express');
const router = express.Router();
const Collector = require('../models/Collector');
const GarbageReport = require('../models/GarbageReport');

// Get collector profile and statistics
router.get('/profile/:collectorId', async (req, res) => {
  try {
    const { collectorId } = req.params;
    
    const collector = await Collector.findById(collectorId);
    if (!collector) {
      return res.status(404).json({ error: 'Collector not found' });
    }

    // Get statistics
    const totalAssigned = await GarbageReport.countDocuments({ collectorId });
    const pendingTasks = await GarbageReport.countDocuments({ 
      collectorId, 
      status: 'assigned' 
    });
    const completedTasks = await GarbageReport.countDocuments({ 
      collectorId, 
      status: 'collected' 
    });

    res.json({
      success: true,
      collector: {
        _id: collector._id,
        name: collector.name,
        phone: collector.phone,
        email: collector.email,
        vehicleNumber: collector.vehicleNumber,
        area: collector.area,
        totalCollected: collector.totalCollected,
        isActive: collector.isActive
      },
      statistics: {
        totalAssigned,
        pendingTasks,
        completedTasks
      }
    });

  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update collector profile
router.put('/profile/:collectorId', async (req, res) => {
  try {
    const { collectorId } = req.params;
    const { name, phone, email, vehicleNumber, area } = req.body;

    const collector = await Collector.findByIdAndUpdate(
      collectorId,
      { name, phone, email, vehicleNumber, area },
      { new: true }
    );

    if (!collector) {
      return res.status(404).json({ error: 'Collector not found' });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      collector
    });

  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;