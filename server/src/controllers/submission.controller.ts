// controllers/submission.controller.ts
import type { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import Submission from "../models/submission.model.js";
import Task from "../models/task.model.js";
import Notification from "../models/notification.model.js";
import Enrollment from "../models/enrollment.model.js";
import User from "../models/user.model.js";
import Bootcamp from "../models/bootcamp.model.js";
import AppError from "../utils/appError.js";
import type { IUser, ITask } from "../types/types.js";
import { sendTaskGradeEmail } from "../queues/email.queue.js";

// Helper function to check if student is enrolled in task's bootcamp
const isStudentEnrolledInTask = async (studentId: mongoose.Types.ObjectId, taskId: string): Promise<boolean> => {
  const task = await Task.findById(taskId).populate("bootcamp");
  if (!task) return false;
  
  const enrollment = await Enrollment.findOne({
    student: studentId,
    bootcamp: task.bootcamp,
    status: "active",
  });
  
  return !!enrollment;
};

// Helper function to check if user has permission to grade
const hasGradingPermission = async (userId: mongoose.Types.ObjectId, taskId: string): Promise<boolean> => {
  const task = await Task.findById(taskId).populate("bootcamp");
  if (!task) return false;
  
  const user = await User.findById(userId);
  if (!user) return false;
  
  // Super admin has all permissions
  if (user.roles.includes("super_admin")) return true;
  
  // Division admin check
  if (user.roles.includes("division_admin")) {
    const bootcamp = task.bootcamp as any;
    return user.memberships.some(
      (m) => m.division.toString() === bootcamp.division.toString()
    );
  }
  
  // Instructor assignment check
  const InstructorAssignment = mongoose.model("InstructorAssignment");
  const assignment = await InstructorAssignment.findOne({
    instructor: userId,
    bootcamp: task.bootcamp,
    status: "active",
    startDate: { $lte: new Date() },
    endDate: { $gte: new Date() },
    permissions: { $in: ["grade_submissions"] },
  });
  
  return !!assignment;
};

// Student submits a task
export const submitTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { task: taskId, githubLink, fileUrl, text } = req.body;

    if (!taskId) {
      return next(new AppError("Task ID is required", 400));
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return next(new AppError("Task not found", 404));
    }

    // Check if student is enrolled in the bootcamp
    const isEnrolled = await isStudentEnrolledInTask(req.user!._id, taskId);
    if (!isEnrolled) {
      return next(new AppError("You are not enrolled in the bootcamp for this task", 403));
    }

    // Check if task is active
    if (task.status !== "active") {
      return next(new AppError("This task is no longer accepting submissions", 422));
    }

    // Deadline enforcement
    if (!task.allowLateSubmission && new Date() > task.deadline) {
      return next(new AppError("Submission deadline has passed. Late submissions are not allowed for this task", 422));
    }

    // Validate submission based on allowed types
    const allowedTypes = task.allowedTypes || [];
    
    if (allowedTypes.includes("github") && githubLink) {
      // Validate GitHub link format
      if (!/^https?:\/\/(www\.)?github\.com\/.+/.test(githubLink)) {
        return next(new AppError("Invalid GitHub link format", 422));
      }
    }
    
    if (allowedTypes.includes("file") && !fileUrl) {
      // File validation would happen via multer
    }
    
    if (allowedTypes.includes("text") && !text) {
      return next(new AppError("Text submission is required for this task", 422));
    }

    // Check if already submitted – if so, increment version (resubmission)
    const existing = await Submission.findOne({
      student: req.user!._id,
      task: taskId,
    }).sort("-version");

    const version = existing ? existing.version + 1 : 1;

    // Determine if late
    const isLate = new Date() > task.deadline;

    const newSubmission = await Submission.create({
      task: taskId,
      student: req.user!._id,
      githubLink: githubLink || null,
      fileUrl: fileUrl || null,
      text: text || null,
      version,
      status: "submitted",
      submittedAt: new Date(),
      isLate,
    });

    // Notify instructors/admins about new submission
    const bootcamp = await Bootcamp.findById(task.bootcamp);
    const instructors = await User.find({
      $or: [
        { roles: "division_admin", "memberships.division": bootcamp?.division },
        { roles: "super_admin" },
      ],
    });

    for (const instructor of instructors) {
      await Notification.create({
        user: instructor._id,
        message: `New submission for "${task.title}" from ${req.user!.name}`,
        type: "submission",
      });
    }

    res.status(201).json({ 
      status: "success", 
      data: { 
        submission: {
          _id: newSubmission._id,
          task: newSubmission.task,
          version: newSubmission.version,
          status: newSubmission.status,
          submittedAt: newSubmission.submittedAt,
          isLate: newSubmission.isLate,
        }
      } 
    });
  } catch (error) {
    next(error);
  }
};

// Student updates their submission (allowed only before deadline)
export const updateSubmission = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { githubLink, fileUrl, text } = req.body;

    const submission = await Submission.findById(id).populate("task");
    if (!submission) {
      return next(new AppError("Submission not found", 404));
    }

    // Ownership check
    if (submission.student.toString() !== req.user!._id.toString()) {
      return next(new AppError("You do not have permission to update this submission", 403));
    }

    const task = submission.task as any;
    
    // Prevent update if already graded
    if (submission.status === "graded") {
      return next(new AppError("Cannot update a graded submission", 422));
    }
    
    // Deadline enforcement
    if (!task.allowLateSubmission && new Date() > task.deadline) {
      return next(new AppError("Submission deadline has passed. Cannot update.", 422));
    }

    // Update fields
    if (githubLink !== undefined) submission.githubLink = githubLink;
    if (fileUrl !== undefined) submission.fileUrl = fileUrl;
    if (text !== undefined) submission.text = text;
    
    submission.updatedAt = new Date();

    await submission.save();

    res.status(200).json({ 
      status: "success", 
      data: { 
        submission: {
          _id: submission._id,
          version: submission.version,
          status: submission.status,
          updatedAt: submission.updatedAt,
        }
      } 
    });
  } catch (error) {
    next(error);
  }
};

// Instructor/admin grades a submission
export const gradeSubmission = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { score, feedback, status } = req.body;
    const { submissionId } = req.params;

    const allowedStatuses = ["graded", "returned"];
    if (status && !allowedStatuses.includes(status)) {
      return next(new AppError(`Status must be one of: ${allowedStatuses.join(", ")}`, 400));
    }

    const submission = await Submission.findById(submissionId)
      .populate("student")
      .populate({
        path: "task",
        populate: { path: "bootcamp", select: "name" }
      });

    if (!submission) {
      return next(new AppError("No submission found with that ID", 404));
    }

    // Check grading permission
    const hasPermission = await hasGradingPermission(req.user!._id, submission.task.toString());
    if (!hasPermission) {
      return next(new AppError("You don't have permission to grade this submission", 403));
    }

    const task = submission.task as any;
    const student = submission.student as IUser;

    // Validate score
    if (score !== undefined && (score < 0 || score > task.maxScore)) {
      return next(new AppError(`Score must be between 0 and ${task.maxScore}`, 422));
    }

    submission.score = score !== undefined ? score : submission.score;
    submission.feedback = feedback !== undefined ? feedback : submission.feedback;
    submission.status = status || "graded";
    submission.gradedAt = new Date();
    submission.gradedBy = req.user!._id;

    await submission.save();

    // In-app notification
    await Notification.create({
      user: student._id,
      message: `Your submission for "${task.title}" has been graded. Score: ${score || submission.score}/${task.maxScore}`,
      type: "grade",
    });

    // Email notification
    sendTaskGradeEmail(
      (student as any).email,
      {
        taskTitle: task.title,
        score: score || submission.score,
        maxScore: task.maxScore,
        feedback: feedback || submission.feedback,
      }
    ).catch(() => console.error(`Failed to send grade email to ${(student as any).email}`));

    res.status(200).json({ 
      status: "success", 
      data: { 
        submission: {
          _id: submission._id,
          score: submission.score,
          feedback: submission.feedback,
          status: submission.status,
          gradedAt: submission.gradedAt,
        }
      } 
    });
  } catch (error) {
    next(error);
  }
};

// Admin/instructor: list all submissions
export const getAllSubmissions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { task, student, status, bootcamp } = req.query;
    const filter: Record<string, any> = {};

    const user = req.user!;
    const isSuperAdmin = user.roles.includes("super_admin");
    const isDivisionAdmin = user.roles.includes("division_admin");

    if (isSuperAdmin) {
      if (task) filter.task = task;
      if (student) filter.student = student;
      if (bootcamp) {
        const tasks = await Task.find({ bootcamp }).select("_id");
        filter.task = { $in: tasks.map(t => t._id) };
      }
    } else if (isDivisionAdmin) {
      // Get divisions the admin has access to
      const userDivisionIds = user.memberships.map(m => m.division);
      
      // Find tasks in those divisions
      const divisionTasks = await Task.find({ 
        division: { $in: userDivisionIds } 
      }).select("_id");
      
      const taskIds = divisionTasks.map(t => t._id);
      
      if (taskIds.length === 0) {
        return res.status(200).json({
          status: "success",
          results: 0,
          data: { submissions: [] },
        });
      }
      
      filter.task = { $in: taskIds };
      if (task && taskIds.includes(task as any)) filter.task = task;
      if (student) filter.student = student;
    } else {
      return next(new AppError("You don't have permission to view all submissions", 403));
    }

    if (status) filter.status = status;

    const submissions = await Submission.find(filter)
      .populate("student", "name email")
      .populate({
        path: "task",
        select: "title deadline division maxScore bootcamp",
        populate: [
          { path: "division", select: "name" },
          { path: "bootcamp", select: "name" }
        ]
      })
      .sort("-submittedAt");

    // Calculate stats
    const stats = {
      total: submissions.length,
      graded: submissions.filter(s => s.status === "graded").length,
      pending: submissions.filter(s => s.status === "submitted").length,
      returned: submissions.filter(s => s.status === "returned").length,
      averageScore: submissions
        .filter(s => s.score !== undefined)
        .reduce((sum, s) => sum + (s.score || 0), 0) / (submissions.filter(s => s.score !== undefined).length || 1),
    };

    res.status(200).json({
      status: "success",
      results: submissions.length,
      data: { submissions, stats },
    });
  } catch (error) {
    next(error);
  }
};

// Get single submission
export const getSubmissionById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate("student", "name email")
      .populate({
        path: "task",
        select: "title deadline division maxScore bootcamp allowedTypes",
        populate: [
          { path: "division", select: "name" },
          { path: "bootcamp", select: "name" }
        ]
      })
      .populate("gradedBy", "name email");

    if (!submission) {
      return next(new AppError("Submission not found", 404));
    }

    const user = req.user!;
    const isStudent = user.roles.includes("student");
    const isSuperAdmin = user.roles.includes("super_admin");
    const isDivisionAdmin = user.roles.includes("division_admin");
    const task = submission.task as any;

    // Authorization check
    if (isStudent && !isSuperAdmin && !isDivisionAdmin) {
      if ((submission.student as any)._id.toString() !== user._id.toString()) {
        return next(new AppError("You do not have permission to view this submission", 403));
      }
    } else if (isDivisionAdmin && !isSuperAdmin) {
      const hasAccess = user.memberships.some(
        (m) => m.division.toString() === task.division._id.toString()
      );
      if (!hasAccess) {
        return next(new AppError("You do not have permission to view this submission", 403));
      }
    }

    res.status(200).json({ 
      status: "success", 
      data: { submission } 
    });
  } catch (error) {
    next(error);
  }
};

// All submissions for a specific task (instructor/admin)
export const getSubmissionsByTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);
    if (!task) {
      return next(new AppError("Task not found", 404));
    }

    const user = req.user!;
    const isSuperAdmin = user.roles.includes("super_admin");
    const isDivisionAdmin = user.roles.includes("division_admin");

    // Permission check
    if (isDivisionAdmin && !isSuperAdmin) {
      const hasAccess = user.memberships.some(
        (m) => m.division.toString() === task.division.toString()
      );
      if (!hasAccess) {
        return next(new AppError("You do not have permission to view submissions for this task", 403));
      }
    }

    const submissions = await Submission.find({ task: taskId })
      .populate("student", "name email")
      .sort("-submittedAt");

    // Calculate task stats
    const stats = {
      total: submissions.length,
      submitted: submissions.filter(s => s.status === "submitted").length,
      graded: submissions.filter(s => s.status === "graded").length,
      averageScore: submissions
        .filter(s => s.score !== undefined)
        .reduce((sum, s) => sum + (s.score || 0), 0) / (submissions.filter(s => s.score !== undefined).length || 1),
    };

    res.status(200).json({
      status: "success",
      results: submissions.length,
      data: { submissions, stats, task },
    });
  } catch (error) {
    next(error);
  }
};

// Student's own submissions
export const getMySubmissions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const submissions = await Submission.find({ student: req.user!._id })
      .populate({
        path: "task",
        select: "title deadline division maxScore bootcamp allowedTypes status",
        populate: [
          { path: "division", select: "name" },
          { path: "bootcamp", select: "name" }
        ]
      })
      .sort("-submittedAt");

    // Calculate student stats
    const stats = {
      total: submissions.length,
      graded: submissions.filter(s => s.status === "graded").length,
      pending: submissions.filter(s => s.status === "submitted").length,
      averageScore: submissions
        .filter(s => s.score !== undefined)
        .reduce((sum, s) => sum + (s.score || 0), 0) / (submissions.filter(s => s.score !== undefined).length || 1),
    };

    res.status(200).json({
      status: "success",
      results: submissions.length,
      data: { submissions, stats },
    });
  } catch (error) {
    next(error);
  }
};

// Get submission stats for a bootcamp (admin/instructor)
export const getBootcampSubmissionStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { bootcampId } = req.params;

    const tasks = await Task.find({ bootcamp: bootcampId });
    const taskIds = tasks.map(t => t._id);

    const submissions = await Submission.find({
      task: { $in: taskIds },
    });

    const stats = {
      totalTasks: tasks.length,
      totalSubmissions: submissions.length,
      gradedSubmissions: submissions.filter(s => s.status === "graded").length,
      pendingGrading: submissions.filter(s => s.status === "submitted").length,
      averageScore: submissions
        .filter(s => s.score !== undefined)
        .reduce((sum, s) => sum + (s.score || 0), 0) / (submissions.filter(s => s.score !== undefined).length || 1),
      taskBreakdown: tasks.map(task => ({
        taskId: task._id,
        taskTitle: task.title,
        submissions: submissions.filter(s => s.task.toString() === task._id.toString()).length,
      })),
    };

    res.status(200).json({
      status: "success",
      data: { stats },
    });
  } catch (error) {
    next(error);
  }
};