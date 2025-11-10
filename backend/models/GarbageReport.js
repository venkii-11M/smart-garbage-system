const mongoose = require('mongoose');

const garbageReportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  userPhone: { type: String, required: true },
  userAddress: { type: String },
  
  photoUrl: { type: String, required: true },
  description: { type: String },
  
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true },
    address: { type: String }
  },
  
  status: {
    type: String,
    enum: ['pending', 'assigned', 'collected', 'cancelled'],
    default: 'pending'
  },
  
  collectorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Collector' },
  collectorName: { type: String },
  
  assignedAt: { type: Date },
  collectedAt: { type: Date },
  
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  
  createdAt: { type: Date, default: Date.now }
});

garbageReportSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('GarbageReport', garbageReportSchema);