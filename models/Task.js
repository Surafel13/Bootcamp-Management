const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  deadline: Date,
  division: { type: mongoose.Schema.Types.ObjectId, ref: 'Division', required: true },
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session' },
  allowedTypes: [{ type: String, enum: ['file', 'github', 'text'] }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Task', taskSchema);