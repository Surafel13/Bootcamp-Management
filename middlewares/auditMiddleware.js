const AuditLog = require('../models/AuditLog');

// This middleware logs any write operations (POST, PATCH, DELETE)
exports.logAction = (req, res, next) => {
  // Only log if the user is authenticated and the method is not GET
  if (req.user && req.method !== 'GET') {
    // We use res.on('finish') to ensure we only log if the request was successful
    res.on('finish', async () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          await AuditLog.create({
            user: req.user._id,
            action: req.method,
            path: req.originalUrl,
            entityId: req.params.id || null
          });
        } catch (err) {
          console.error('Audit Log Error:', err);
        }
      }
    });
  }
  next();
};