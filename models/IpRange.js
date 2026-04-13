const mongoose = require('mongoose');

const ipRangeSchema = new mongoose.Schema({
  name: String,
  startIP: String, // e.g., "192.168.1.1"
  endIP: String,   // e.g., "192.168.1.50"
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('IpRange', ipRangeSchema);