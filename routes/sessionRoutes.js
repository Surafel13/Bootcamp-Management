const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

router.post('/:sessionId/generate-qr', protect, restrictTo('division_admin', 'super_admin'), attendanceController.generateQR);

module.exports = router;