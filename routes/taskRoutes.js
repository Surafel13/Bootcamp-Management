const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

router.use(protect);

router.post('/', restrictTo('division_admin', 'super_admin'), taskController.createTask);
router.get('/', taskController.getAllTasks);

module.exports = router;