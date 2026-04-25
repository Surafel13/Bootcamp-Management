import Task from "../models/task.model.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import type { Request, Response, NextFunction } from "express";
import AppError from "../utils/appError.js";
import { sendTaskStartEmail } from "../queues/email.queue.js";
import Session from "../models/session.model.js";

export const createTask = async (req: Request, res: Response) => {
  const task = await Task.create(req.body);

  // Get the session to find the division and students
  const session = await Session.findById(req.body.session).populate("division");
  
  if (!session) {
    return res.status(404).json({ status: "error", message: "Session not found" });
  }

  // Notify all active students in the division
  const students = await User.find({
    role: "student",
    divisions: session.division._id,
    status: "active",
  } as any);

  for (const student of students) {
    await Notification.create({
      user: student._id,
      message: `New task assigned: "${task.title}" – Deadline: ${new Date(task.deadline).toLocaleDateString()}`,
      type: "task",
    });
    sendTaskStartEmail(
      student.name,
      student.email,
      task.title,
    ).catch(() => {});
  }

  res.status(201).json({ status: "success", data: { task } });
};

export const getAllTasks = async (req: Request, res: Response) => {
  const { division, session, bootcamp } = req.query;
  const filter: Record<string, any> = {};

  const isSuperAdmin = req.user!.roles.includes("super_admin");
  const isDivisionAdmin = req.user!.roles.includes("division_admin") || req.user!.memberships.some(m => m.role === "division_admin");
  const isStudent = req.user!.roles.includes("student");

  // Add session filter if provided
  if (session) {
    filter.session = session;
  }

  // Add bootcamp filter if provided
  if (bootcamp) {
    filter.bootcamp = bootcamp;
  }

  if (isSuperAdmin) {
    if (division) filter.division = req.activeDivisionId;
  } else {
    filter.division = { $in: req.activeDivisionId };
  }

  console.log(`Fetching tasks for user ${req.user!.email} (Roles: ${req.user!.roles}). Filter:`, JSON.stringify(filter));

  const tasks = await Task.find(filter as any)
    .populate("division", "name")
    .populate("session", "title startTime")
    .populate("bootcamp", "name")
    .sort("-createdAt");

  res.status(200).json({
    status: "success",
    results: tasks.length,
    data: { tasks },
  });
};

export const getTaskById =
	async (req: Request, res: Response, next: NextFunction) => {
		const task = await Task.findById(req.params.id)
			.populate("division", "name")
			.populate("session", "title startTime");

		if (!task)
			return next(new AppError("Task not found", 404, { id: "Not found" }));

		res.status(200).json({ status: "success", data: { task } });
	}

export const updateTask =
	async (req: Request, res: Response, next: NextFunction) => {
		const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true,
		}).populate("division", "name");

		if (!task)
			return next(new AppError("Task not found", 404, { id: "Not found" }));

		res.status(200).json({ status: "success", data: { task } });
	}

export const deleteTask =
	async (req: Request, res: Response, next: NextFunction) => {
		const task = await Task.findByIdAndDelete(req.params.id);
		if (!task)
			return next(new AppError("Task not found", 404, { id: "Not found" }));

		res.status(204).json({ status: "success", data: null });
	}
	