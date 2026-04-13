const Task = require('../models/Task');
const User = require('../models/User');
const emailService = require('../services/emailService');
const catchAsync = require('../utils/catchAsync');

exports.createTask = catchAsync(async (req, res) => {
  const task = await Task.create(req.body);

  // Trigger Notifications: Find all students in that division
  const students = await User.find({ 
    role: 'student', 
    divisions: req.body.division,
    status: 'active' 
  });

  // Notify students (Asyncly)
  students.forEach(student => {
    emailService.sendEmail(
      student.email,
      `New Task Assigned: ${task.title}`,
      `Hello ${student.name}, a new task has been assigned to your division. Deadline: ${task.deadline}`
    );
  });

  res.status(201).json({ status: 'success', data: task });
});

exports.getAllTasks = catchAsync(async (req, res) => {
  const tasks = await Task.find({ division: { $in: req.user.divisions } });
  res.status(200).json({ status: 'success', results: tasks.length, data: tasks });
});