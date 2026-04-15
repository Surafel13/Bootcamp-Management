import Task from "../models/task.model.js";
import User from "../models/user.model.js";
import { sendEmail } from "../services/email.service.js";
import catchAsync from "../utils/catchAsync.js";
import type { Request, Response } from "express";

export const createTask = catchAsync(async (req: Request, res: Response) => {
  const task = await Task.create(req.body);

  // Trigger Notifications: Find all students in that division
  const students = await User.find({
    role: "student",
    divisions: req.body.division,
    status: "active",
  });

  // Notify students (Asyncly)
  students.forEach((student) => {
    sendEmail(
      student.email,
      `New Task Assigned: ${task.title}`,
      `Hello ${student.name}, a new task has been assigned to your division. Deadline: ${task.deadline}`,
    );
  });

  res.status(201).json({ status: "success", data: task });
});

export const getAllTasks = catchAsync(async (req: Request, res: Response) => {
  const tasks = await Task.find({ division: { $in: req?.user?.divisions! } });
  res
    .status(200)
    .json({ status: "success", results: tasks.length, data: tasks });
});
