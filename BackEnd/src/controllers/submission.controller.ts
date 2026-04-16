import type { Request, Response, NextFunction } from "express";
import Submission from "../models/submission.model.js";
import Notification from "../models/notification.model.js";
import { sendEmail } from "../services/email.service.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import type { IUser, ITask } from "../types/types.js";

export const gradeSubmission = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { score, feedback } = req.body;
    const { submissionId } = req.params;

    // 1. Update the submission
    const submission = await Submission.findByIdAndUpdate(
      submissionId,
      {
        score,
        feedback,
        status: "graded",
      },
      { new: true, runValidators: true },
    ).populate("student task");

    if (!submission) {
      return next(new AppError("No submission found with that ID", 404, {
        id: "Submission not found"
      }));
    }

    const task = submission.task as ITask;

    // 2. Create an In-App Notification
    await Notification.create({
      user: submission.student._id,
      message: `Your submission for "${task.title}" has been graded. Score: ${score}`,
      type: "grade",
    });

    // 3. Trigger Email Notification to the student
    const student = submission.student as IUser;
    const studentEmail = student.email;
    const emailSubject = `Task Graded: ${task.title}`;
    const emailText = `
    Hello ${student.name},
    
    Your submission for the task "${task.title}" has been reviewed.
    
    Score: ${score}/100
    Feedback: ${feedback || "No specific feedback provided."}
    
    You can view full details in the student portal.
  `;

    // Send email (using the email service)
    await sendEmail(studentEmail, emailSubject, emailText);

    res.status(200).json({
      status: "success",
      data: submission,
    });
  },
);

export const submitTask = catchAsync(async (req: Request, res: Response) => {
  // Logic for student to submit a task
  const newSubmission = await Submission.create({
    ...req.body,
    student: req?.user?._id,
  });
  res.status(201).json({ status: "success", data: newSubmission });
});
