const Submission = require('../models/Submission');
const User = require('../models/User');
const Notification = require('../models/Notification');
const emailService = require('../services/emailService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.gradeSubmission = catchAsync(async (req, res, next) => {
  const { score, feedback } = req.body;
  const { submissionId } = req.params;

  // 1. Update the submission
  const submission = await Submission.findByIdAndUpdate(
    submissionId,
    {
      score,
      feedback,
      status: 'graded'
    },
    { new: true, runValidators: true }
  ).populate('student task');

  if (!submission) {
    return next(new AppError('No submission found with that ID', 404));
  }

  // 2. Create an In-App Notification
  await Notification.create({
    user: submission.student._id,
    message: `Your submission for "${submission.task.title}" has been graded. Score: ${score}`,
    type: 'grade'
  });

  // 3. Trigger Email Notification to the student
  const studentEmail = submission.student.email;
  const emailSubject = `Task Graded: ${submission.task.title}`;
  const emailText = `
    Hello ${submission.student.name},
    
    Your submission for the task "${submission.task.title}" has been reviewed.
    
    Score: ${score}/100
    Feedback: ${feedback || 'No specific feedback provided.'}
    
    You can view full details in the student portal.
  `;

  // Send email (using the email service)
  await emailService.sendEmail(studentEmail, emailSubject, emailText);

  res.status(200).json({
    status: 'success',
    data: submission
  });
});

exports.submitTask = catchAsync(async (req, res) => {
  // Logic for student to submit a task
  const newSubmission = await Submission.create({
    ...req.body,
    student: req.user._id
  });
  res.status(201).json({ status: 'success', data: newSubmission });
});