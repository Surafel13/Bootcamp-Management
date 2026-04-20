import type { Request, Response, NextFunction } from "express";
import Feedback from "../models/feedback.model.js";
import Group from "../models/group.model.js";
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import Progress from "../models/progress.model.js";

// Helper: get ISO week number
function getISOWeek(date: Date): { week: number; year: number } {
	const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
	d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
	const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
	const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
	return { week, year: d.getUTCFullYear() };
}

// Submit weekly group progress
export const submitProgress = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const { group: groupId, title, description, fileUrl, link } = req.body;

		if (!groupId)
			return next(new AppError("Group ID is required", 400, { group: "Required" }));
		if (!title || !description)
			return next(new AppError("Title and description are required", 400, {}));
		if (description.length < 50)
			return next(
				new AppError("Description must be at least 50 characters", 422, {
					description: `Currently ${description.length} characters. Need ${50 - description.length} more.`,
				}),
			);

		// Verify the student belongs to the group
		const group = await Group.findById(groupId);
		if (!group) return next(new AppError("Group not found", 404, { group: "Not found" }));

		const isMember = group.members.some((m) => m.toString() === req.user!._id.toString());
		if (!isMember)
			return next(new AppError("You are not a member of this group", 403, { group: "Access denied" }));

		const { week: weekNumber, year } = getISOWeek(new Date());

		const progress = await Progress.create({
			group: groupId,
			submittedBy: req.user!._id,
			title,
			description,
			fileUrl,
			link,
			weekNumber,
			year,
		});

		res.status(201).json({ status: "success", data: { progress } });
	},
);

export const getAllProgress = catchAsync(async (req: Request, res: Response) => {
	const { group, week, year } = req.query;
	const filter: Record<string, any> = {};

	if (group) filter.group = group;
	if (week) filter.weekNumber = Number(week);
	if (year) filter.year = Number(year);

	const records = await Progress.find(filter)
		.populate("group", "name division")
		.populate("submittedBy", "name email")
		.sort("-createdAt");

	res.status(200).json({
		status: "success",
		results: records.length,
		data: { progress: records },
	});
});

export const getProgressByGroup = catchAsync(async (req: Request, res: Response) => {
	const records = await Progress.find({ group: req.params.groupId })
		.populate("submittedBy", "name email")
		.sort("-year -weekNumber");

	res.status(200).json({
		status: "success",
		results: records.length,
		data: { progress: records },
	});
});

// Student's own group progress submissions
export const getMyProgress = catchAsync(async (req: Request, res: Response) => {
	// Find groups this student belongs to
	const groups = await Group.find({ members: req.user!._id }).select("_id");
	const groupIds = groups.map((g) => g._id);

	const records = await Progress.find({ group: { $in: groupIds } })
		.populate("group", "name division")
		.populate("submittedBy", "name email")
		.sort("-year -weekNumber");

	res.status(200).json({
		status: "success",
		results: records.length,
		data: { progress: records },
	});
});
