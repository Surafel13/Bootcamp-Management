const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

router.use(protect);

// Student submits task
router.post('/', restrictTo('student'), submissionController.submitTask);

// Admin grades task
router.patch('/:submissionId/grade', restrictTo('division_admin', 'super_admin'), submissionController.gradeSubmission);

module.exports = router;