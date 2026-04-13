const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  // ... your schema definition
});

// This runs every time .save() is called
sessionSchema.pre('save', async function(next) {
  const Session = mongoose.model('Session');
  
  const overlapping = await Session.findOne({
    division: this.division,
    _id: { $ne: this._id }, // Don't check the session against itself (important for updates)
    $or: [
      { startTime: { $lt: this.endTime }, endTime: { $gt: this.startTime } }
    ]
  });

  if (overlapping) {
    const err = new Error('Overlap detected: This division already has a session scheduled at this time.');
    return next(err);
  }
  
  next();
});

module.exports = mongoose.model('Session', sessionSchema);