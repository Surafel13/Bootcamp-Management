const jwt = require('jsonwebtoken');
const Attendance = require('../models/Attendance');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Memory store for tokens (Use Redis for multi-server setups)
const usedTokens = new Set();
const activeTokens = new Map();

exports.generateQR = catchAsync(async (req, res) => {
  const { sessionId } = req.params;
  const qrSecret = require('crypto').randomBytes(16).toString('hex');
  
  const token = jwt.sign({ sessionId, qrSecret }, process.env.JWT_QR_SECRET, { expiresIn: '15s' });
  
  activeTokens.set(token, true);
  setTimeout(() => activeTokens.delete(token), 16000); // Clean up

  res.status(200).json({ status: 'success', qrToken: token });
});

exports.scanQR = catchAsync(async (req, res, next) => {
  const { qrToken } = req.body;

  // 1. Check if token was used
  if (usedTokens.has(qrToken)) return next(new AppError('QR already used', 400));

  try {
    // 2. Verify JWT
    const decoded = jwt.verify(qrToken, process.env.JWT_QR_SECRET);
    
    // 3. Verify in active store
    if (!activeTokens.has(qrToken)) return next(new AppError('QR expired', 400));

    // 4. Create Attendance
    await Attendance.create({
      student: req.user._id,
      session: decoded.sessionId,
      status: 'attend'
    });

    // 5. Invalidate
    usedTokens.add(qrToken);
    activeTokens.delete(qrToken);

    res.status(200).json({ status: 'success', message: 'Attendance recorded' });
  } catch (err) {
    return next(new AppError('Invalid or expired QR code', 400));
  }
});

exports.manualUpdate = catchAsync(async (req, res, next) => {
  const attendance = await Attendance.findById(req.params.id).populate('session');
  
  if (!attendance) return next(new AppError('Attendance not found', 404));

  // Logic: Calculate if 24 hours have passed since the session ended
  const sessionEndTime = new Date(attendance.session.endTime);
  const currentTime = new Date();
  const hoursSinceEnd = (currentTime - sessionEndTime) / (1000 * 60 * 60);

  if (hoursSinceEnd > 24) {
    return next(new AppError('Attendance records are locked after 24 hours.', 403));
  }

  attendance.status = req.body.status;
  attendance.updatedAt = Date.now();
  await attendance.save();

  res.status(200).json({ status: 'success', data: attendance });
});