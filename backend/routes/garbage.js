const express = require('express');
const router = express.Router();
const multer = require('multer');
const GarbageReport = require('../models/GarbageReport');
const Collector = require('../models/Collector');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// User submits garbage report
router.post('/report', upload.single('photo'), async (req, res) => {
  try {
    const { userId, userName, userPhone, userAddress, description, latitude, longitude, address } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'Photo is required' });
    }

    const report = new GarbageReport({
      userId,
      userName,
      userPhone,
      userAddress,
      photoUrl: `/uploads/${req.file.filename}`,
      description,
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
        address
      }
    });

    await report.save();

    res.status(201).json({
      success: true,
      message: 'Garbage report submitted successfully',
      report
    });

  } catch (error) {
    console.error('Error submitting report:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all pending reports
router.get('/pending', async (req, res) => {
  try {
    const reports = await GarbageReport.find({ status: 'pending' })
      .sort({ createdAt: -1 });
    
    res.json({ success: true, reports });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Collector accepts task
router.post('/accept/:reportId', async (req, res) => {
  try {
    const { reportId } = req.params;
    const { collectorId, collectorName } = req.body;

    const report = await GarbageReport.findById(reportId);
    
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    if (report.status !== 'pending') {
      return res.status(400).json({ error: 'Report already assigned' });
    }

    report.status = 'assigned';
    report.collectorId = collectorId;
    report.collectorName = collectorName;
    report.assignedAt = new Date();

    await report.save();

    res.json({
      success: true,
      message: 'Task accepted successfully',
      report
    });

  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark as collected
router.post('/collect/:reportId', async (req, res) => {
  try {
    const { reportId } = req.params;
    const { collectorId } = req.body;

    const report = await GarbageReport.findById(reportId);
    
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    report.status = 'collected';
    report.collectedAt = new Date();
    await report.save();

    await Collector.findByIdAndUpdate(collectorId, {
      $inc: { totalCollected: 1 }
    });

    res.json({
      success: true,
      message: 'Garbage collected successfully',
      report
    });

  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get collector's tasks
router.get('/collector/:collectorId/tasks', async (req, res) => {
  try {
    const { collectorId } = req.params;
    const { status } = req.query;

    const query = { collectorId };
    if (status) {
      query.status = status;
    }

    const tasks = await GarbageReport.find(query)
      .sort({ assignedAt: -1 });

    res.json({ success: true, tasks });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;