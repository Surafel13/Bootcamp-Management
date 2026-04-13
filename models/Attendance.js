const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
  status: { type: String, enum: ['attend', 'permission', 'absent'], required: true },
  markedAt: { type: Date, default: Date.now },
  updatedAt: Date
});

// Ensure one attendance per student per session
attendanceSchema.index({ student: 1, session: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);