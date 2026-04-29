import cron from "node-cron";
import Group from "../models/group.model.js";
import Progress from "../models/progress.model.js";
import Task from "../models/task.model.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import { sendEmail } from "./email.service.js";
import logger from "../utils/logger.js";

// Helper: get ISO week number
function getISOWeek(date: Date): { week: number; year: number } {
	const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
	d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
	const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
	const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
	return { week, year: d.getUTCFullYear() };
}

/**
 * Checks for groups that haven't submitted their weekly progress.
 * Runs every Sunday at 20:00 (8 PM).
 */
export const checkMissingProgress = async () => {
	logger.info("Running Cron: Check Missing Weekly Progress");
	const { week, year } = getISOWeek(new Date());

	try {
		const allGroups = await Group.find().populate("members", "name email");

		for (const group of allGroups) {
			const submission = await Progress.findOne({
				group: group._id,
				weekNumber: week,
				year: year,
			});

			if (!submission) {
				// Notify all members
				for (const member of (group.members as any)) {
					await Notification.create({
						user: member._id,
						message: `ALERT: Weekly progress for group "${group.name}" is missing for week ${week}.`,
						type: "progress",
					});

					sendEmail(
						member.email,
						`[BMS] Missing Weekly Progress: ${group.name}`,
						`Hello ${member.name},\n\nOur records show that your group "${group.name}" has not yet submitted the weekly progress report for Week ${week}, ${year}.\n\nPlease ensure it is submitted as soon as possible.`
					).catch(() => {});
				}
			}
		}
	} catch (err) {
		logger.error("Cron Job Error (Progress):", err);
	}
};

/**
 * Checks for tasks with deadlines in the next 24 hours.
 * Runs daily at 09:00 AM.
 */
export const checkTaskDeadlines = async () => {
	logger.info("Running Cron: Check Task Deadlines");
	const tomorrow = new Date();
	tomorrow.setDate(tomorrow.getDate() + 1);

	try {
		const upcomingTasks = await Task.find({
			deadline: { $gt: new Date(), $lte: tomorrow },
			status: "active"
		});

		for (const task of upcomingTasks) {
			// Notify all students in the division
			const students = await User.find({
				role: "student",
				divisions: task.division,
				status: "active"
			} as any);

			for (const student of students) {
				await Notification.create({
					user: student._id,
					message: `Reminder: Task "${task.title}" is due tomorrow!`,
					type: "task"
				});
			}
		}
	} catch (err) {
		logger.error("Cron Job Error (Tasks):", err);
	}
};

export const initCronJobs = () => {
	// Every Sunday at 8:00 PM
	cron.schedule("0 20 * * 0", checkMissingProgress);

	// Daily at 9:00 AM
	cron.schedule("0 9 * * *", checkTaskDeadlines);
    
    logger.info("Cron Jobs Initialized");
};
