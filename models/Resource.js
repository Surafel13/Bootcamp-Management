const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  fileUrl: String,
  type: { type: String, enum: ['pdf', 'video', 'image', 'zip', 'link'] },
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session' },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Resource', resourceSchema);