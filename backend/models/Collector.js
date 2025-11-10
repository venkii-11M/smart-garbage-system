const mongoose = require('mongoose');

const collectorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  vehicleNumber: { type: String },
  area: { type: String },
  fcmToken: { type: String },
  isActive: { type: Boolean, default: true },
  totalCollected: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Collector', collectorSchema);