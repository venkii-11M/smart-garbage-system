const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  address: { type: String },
  fcmToken: { type: String },
  role: { type: String, default: 'user' },
  profileImage: { type: String, default: '' },
  totalReports: { type: Number, default: 0 },
  pendingReports: { type: Number, default: 0 },
  completedReports: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);