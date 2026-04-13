const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  fileUrl: String,
  githubLink: String,
  text: String,
  version: { type: Number, default: 1 },
  status: { type: String, enum: ['submitted', 'graded', 'returned'], default: 'submitted' },
  score: { type: Number, min: 0, max: 100 },
  feedback: String,
  submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Submission', submissionSchema);