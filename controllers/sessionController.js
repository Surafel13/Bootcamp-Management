const Session = require('../models/Session');
const catchAsync = require('../utils/catchAsync'); // Assuming you use a wrapper for async errors

exports.createSession = catchAsync(async (req, res, next) => {
  const { division, startTime, endTime } = req.body;

  // 1. Check for overlapping sessions
  const overlapping = await Session.findOne({
    division: division,
    $or: [
      { startTime: { $lt: endTime }, endTime: { $gt: startTime } } 
      // Improved logic: (NewStart < ExistingEnd) AND (NewEnd > ExistingStart)
    ]
  });

  if (overlapping) {
    return res.status(400).json({
      status: 'fail',
      message: 'A session already exists in this time slot for this division.'
    });
  }

  // 2. Check for minimum duration (30 mins)
  const duration = (new Date(endTime) - new Date(startTime)) / (1000 * 60);
  if (duration < 30) {
    return res.status(400).json({ message: 'Session must be at least 30 minutes long.' });
  }

  // 3. Create session
  const newSession = await Session.create(req.body);

  res.status(201).json({ status: 'success', data: newSession });
});