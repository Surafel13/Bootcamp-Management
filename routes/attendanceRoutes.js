const express = require('express');
const router = express.Router();
const authController = require('../middlewares/authMiddleware');
const ipMiddleware = require('../middlewares/ipMiddleware');
const attendanceController = require('../controllers/attendanceController');

// QR Scanning (Student) - Must be on allowed IP
router.post('/scan', 
  authController.protect, 
  authController.restrictTo('student'),
  ipMiddleware.checkIPRange, 
  attendanceController.scanQR
);

// Manual Update (Admin)
router.patch('/manual',
  authController.protect,
  authController.restrictTo('division_admin', 'super_admin'),
  attendanceController.manualUpdate
);

module.exports = router;