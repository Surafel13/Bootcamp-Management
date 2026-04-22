import type { Request, Response, NextFunction } from "express";
import Submission from "../models/submission.model.js";
import Task from "../models/task.model.js";
import Notification from "../models/notification.model.js";
import { sendEmail } from "../services/email.service.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import type { IUser, ITask } from "../types/types.js";

// Student submits a task
export const submitTask = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const { task: taskId, githubLink } = req.body;

		const task = await Task.findById(taskId);
		if (!task)
			return next(new AppError("Task not found", 404, { task: "Not found" }));

		// Deadline enforcement
		if (!task.allowLateSubmission && new Date() > task.deadline) {
			return next(
				new AppError("Submission deadline has passed", 422, {
					deadline: "No late submissions allowed for this task",
				}),
			);
		}

		// Validate GitHub link format
		if (githubLink && !/^https?:\/\/(www\.)?github\.com\/.+/.test(githubLink)) {
			return next(
				new AppError("Invalid GitHub link format", 422, {
					githubLink: "Must be a valid github.com URL",
				}),
			);
		}

		// Check if already submitted – if so, increment version (resubmission)
		const existing = await Submission.findOne({
			student: req.user!._id,
			task: taskId,
		}).sort("-version");

		const version = existing ? existing.version + 1 : 1;

		const newSubmission = await Submission.create({
			...req.body,
			student: req.user!._id,
			version,
			status: "submitted",
		});

		res.status(201).json({ status: "success", data: { submission: newSubmission } });
	},
);

// Student updates their submission (allowed only before deadline)
export const updateSubmission = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const { id } = req.params;
		const { githubLink, fileUrl, text } = req.body;

		const submission = await Submission.findById(id).populate("task");
		if (!submission)
			return next(new AppError("Submission not found", 404, { id: "Not found" }));

		// Ownership check
		if (submission.student.toString() !== req.user!._id.toString()) {
			return next(new AppError("You do not have permission to update this submission", 403, {}));
		}

		const task = submission.task as any;
		// Deadline enforcement
		if (!task.allowLateSubmission && new Date() > task.deadline) {
			return next(
				new AppError("Submission deadline has passed. Cannot update.", 422, {
					deadline: "No late updates allowed for this task",
				}),
			);
		}

		// Update fields
		if (githubLink !== undefined) submission.githubLink = githubLink;
		if (fileUrl !== undefined) submission.fileUrl = fileUrl;
		if (text !== undefined) submission.text = text;
		
		await submission.save();

		res.status(200).json({ status: "success", data: { submission } });
	},
);

// Instructor/admin grades a submission
export const gradeSubmission = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const { score, feedback, status } = req.body;
		const { submissionId } = req.params;

		const allowedStatuses = ["graded", "returned"];
		if (status && !allowedStatuses.includes(status)) {
			return next(
				new AppError(`Status must be one of: ${allowedStatuses.join(", ")}`, 400, {
					status: "Invalid",
				}),
			);
		}

		const submission = await Submission.findByIdAndUpdate(
			submissionId,
			{ score, feedback, status: status || "graded" },
			{ new: true, runValidators: true },
		).populate("student task");

		if (!submission)
			return next(new AppError("No submission found with that ID", 404, { id: "Submission not found" }));

		const task = submission.task as ITask;
		const student = submission.student as IUser;

		// In-app notification
		await Notification.create({
			user: student._id,
			message: `Your submission for "${task.title}" has been graded. Score: ${score}/100`,
			type: "grade",
		});

		// Email notification
		sendEmail(
			student.email,
			`Task Graded: ${task.title}`,
			`Hello ${student.name},\n\nYour submission for "${task.title}" has been reviewed.\n\nScore: ${score}/100\nFeedback: ${feedback || "No specific feedback provided."}\n\nView full details in the student portal.`,
		).catch(() => {});

		res.status(200).json({ status: "success", data: { submission } });
	},
);

// Admin/instructor: list all submissions
export const getAllSubmissions = catchAsync(async (req: Request, res: Response) => {
	const { task, student, status } = req.query;
	const filter: Record<string, any> = {};

	const isSuperAdmin = req.user!.roles.includes("super_admin");
	const isDivisionAdmin = req.user!.roles.includes("division_admin");

	if (isSuperAdmin) {
		if (task) filter.task = task;
		if (student) filter.student = student;
	} else if (isDivisionAdmin) {
		// Find tasks in the admin's divisions
		const divisionTasks = await Task.find({ division: { $in: req.user!.divisions } }).select("_id");
		const taskIds = divisionTasks.map(t => t._id);
		
		filter.task = { $in: taskIds };
		if (task && taskIds.includes(task as any)) filter.task = task;
		if (student) filter.student = student;
	}

	if (status) filter.status = status;

	const submissions = await Submission.find(filter)
		.populate("student", "name email")
		.populate({
			path: "task",
			select: "title deadline division maxScore",
			populate: { path: "division", select: "name" }
		})
		.sort("-submittedAt");

	res.status(200).json({
		status: "success",
		results: submissions.length,
		data: { submissions },
	});
});

// Get single submission
export const getSubmissionById = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const submission = await Submission.findById(req.params.id)
			.populate("student", "name email")
			.populate("task", "title deadline division");

		if (!submission)
			return next(new AppError("Submission not found", 404, { id: "Not found" }));

		const isStudent = req.user!.roles.includes("student");
		const isSuperAdmin = req.user!.roles.includes("super_admin");
		const isDivisionAdmin = req.user!.roles.includes("division_admin");
		const task = submission.task as any;

		if (isStudent && !isSuperAdmin && !isDivisionAdmin) {
			if ((submission.student as any)._id.toString() !== req.user!._id.toString()) {
				return next(new AppError("You do not have permission to view this submission", 403, {}));
			}
		} else if (isDivisionAdmin && !isSuperAdmin) {
			if (!req.user!.divisions.some(d => d.toString() === task.division.toString())) {
				if (!(isStudent && (submission.student as any)._id.toString() === req.user!._id.toString())) {
					return next(new AppError("You do not have permission to view this submission", 403, {}));
				}
			}
		}

		res.status(200).json({ status: "success", data: { submission } });
	},
);

// All submissions for a specific task (instructor/admin)
export const getSubmissionsByTask = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const isSuperAdmin = req.user!.roles.includes("super_admin");
		const isDivisionAdmin = req.user!.roles.includes("division_admin");

		if (isDivisionAdmin && !isSuperAdmin) {
			const taskCheck = await Task.findById(req.params.taskId);
			if (!taskCheck) {
				return next(new AppError("Task not found", 404, {}));
			}
			if (!req.user!.divisions.some(d => d.toString() === taskCheck.division.toString())) {
				return next(new AppError("You do not have permission to view submissions for this task", 403, {}));
			}
		}

		const submissions = await Submission.find({ task: req.params.taskId })
			.populate("student", "name email")
			.sort("-submittedAt");

		res.status(200).json({
			status: "success",
			results: submissions.length,
			data: { submissions },
		});
	},
);

// Student's own submissions
export const getMySubmissions = catchAsync(async (req: Request, res: Response) => {
	const submissions = await Submission.find({ student: req.user!._id })
		.populate("task", "title deadline division")
		.sort("-submittedAt");

	res.status(200).json({
		status: "success",
		results: submissions.length,
		data: { submissions },
	});
});
