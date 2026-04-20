import Task from "../models/task.model.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import { sendEmail } from "../services/email.service.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import type { Request, Response, NextFunction } from "express";

export const createTask = catchAsync(async (req: Request, res: Response) => {
	const task = await Task.create(req.body);

	// Notify all active students in the division
	const students = await User.find({
		role: "student",
		divisions: req.body.division,
		status: "active",
	} as any);

	for (const student of students) {
		await Notification.create({
			user: student._id,
			message: `New task assigned: "${task.title}" – Deadline: ${new Date(task.deadline).toLocaleDateString()}`,
			type: "task",
		});
		sendEmail(
			student.email,
			`New Task Assigned: ${task.title}`,
			`Hello ${student.name},\n\nA new task has been assigned to your division.\n\nTask: ${task.title}\nDeadline: ${new Date(task.deadline).toLocaleString()}\n\n${task.description || ""}`,
		).catch(() => {});
	}

	res.status(201).json({ status: "success", data: { task } });
});

export const getAllTasks = catchAsync(async (req: Request, res: Response) => {
	const { division } = req.query;
	const filter: Record<string, any> = {};

	const isAdmin = req.user!.roles.some(r => ["division_admin", "super_admin"].includes(r));
	if (req.user!.roles.includes("student") && !isAdmin) {
		filter.division = { $in: req.user!.divisions };
	} else if (division) {
		filter.division = division;
	}

	const tasks = await Task.find(filter as any)
		.populate("division", "name")
		.populate("session", "title startTime")
		.sort("-createdAt");

	res.status(200).json({
		status: "success",
		results: tasks.length,
		data: { tasks },
	});
});

export const getTaskById = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const task = await Task.findById(req.params.id)
			.populate("division", "name")
			.populate("session", "title startTime");

		if (!task)
			return next(new AppError("Task not found", 404, { id: "Not found" }));

		res.status(200).json({ status: "success", data: { task } });
	},
);

export const updateTask = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true,
		}).populate("division", "name");

		if (!task)
			return next(new AppError("Task not found", 404, { id: "Not found" }));

		res.status(200).json({ status: "success", data: { task } });
	},
);

export const deleteTask = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const task = await Task.findByIdAndDelete(req.params.id);
		if (!task)
			return next(new AppError("Task not found", 404, { id: "Not found" }));

		res.status(204).json({ status: "success", data: null });
	},
);
