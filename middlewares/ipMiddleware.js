const IpRange = require('../models/IpRange');
const ipaddr = require('ipaddr.js');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const ipToLong = (ip) => {
  const addr = ipaddr.parse(ip);
  const octets = addr.toByteArray();
  return octets.reduce((int, octet) => (int << 8) + octet, 0) >>> 0;
};

exports.checkIPRange = catchAsync(async (req, res, next) => {
  let clientIp = req.ip || req.connection.remoteAddress;
  if (clientIp.includes('::ffff:')) clientIp = clientIp.split('::ffff:')[1];

  const ranges = await IpRange.find({ isActive: true });
  const clientLong = ipToLong(clientIp);

  const isAllowed = ranges.some(range => {
    return clientLong >= ipToLong(range.startIP) && clientLong <= ipToLong(range.endIP);
  });

  if (!isAllowed && process.env.NODE_ENV === 'production') {
    return next(new AppError('Forbidden: Outside allowed network', 403));
  }
  next();
});