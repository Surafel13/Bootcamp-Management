const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const signToken = (id, secret, expires) => {
  return jwt.sign({ id }, secret, { expiresIn: expires });
};

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) return next(new AppError('Please provide email and password', 400));

  // 1. Find user and include password
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // 2. Generate Tokens
  const accessToken = signToken(user._id, process.env.JWT_SECRET, '24h');
  const refreshToken = signToken(user._id, process.env.JWT_REFRESH_SECRET, '7d');

  res.status(200).json({
    status: 'success',
    accessToken,
    refreshToken,
    data: { user }
  });
});

exports.refresh = catchAsync(async (req, res, next) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return next(new AppError('Refresh token required', 400));

  const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  const user = await User.findById(decoded.id);

  if (!user) return next(new AppError('User no longer exists', 401));

  const newAccessToken = signToken(user._id, process.env.JWT_SECRET, '24h');

  res.status(200).json({ status: 'success', accessToken: newAccessToken });
});