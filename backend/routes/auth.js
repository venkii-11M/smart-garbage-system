const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Collector = require('../models/Collector');

// User Registration
router.post('/register/user', async (req, res) => {
  try {
    const { name, phone, email, password, address } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({ 
        error: 'User with this email or phone already exists' 
      });
    }

    // Create user (in production, hash password with bcrypt)
    const user = new User({
      name,
      phone,
      email,
      password, // In production: await bcrypt.hash(password, 10)
      address
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// User Login
router.post('/login/user', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // In production: const isMatch = await bcrypt.compare(password, user.password);
    if (password !== user.password) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address
      }
    });

  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Collector Login
router.post('/login/collector', async (req, res) => {
  try {
    const { email, password } = req.body;

    const collector = await Collector.findOne({ email });
    if (!collector) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    if (password !== collector.password) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    res.json({
      success: true,
      message: 'Login successful',
      collector: {
        _id: collector._id,
        name: collector.name,
        email: collector.email,
        phone: collector.phone,
        vehicleNumber: collector.vehicleNumber,
        area: collector.area,
        totalCollected: collector.totalCollected
      }
    });

  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;