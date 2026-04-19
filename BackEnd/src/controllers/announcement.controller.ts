import type { Request, Response, NextFunction } from "express";
import Announcement from "../models/announcement.model.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";

// Create a new announcement
export const createAnnouncement = catchAsync(async (req: Request, res: Response) => {
	const { title, content } = req.body;

	if (!title || !content) {
		return res.status(400).json({
			status: "fail",
			message: "Title and content are required fields",
		});
	}

	const announcement = await Announcement.create({
		title,
		content,
		createdBy: req.user!._id,
	});

	res.status(201).json({
		status: "success",
		data: { announcement },
	});
});

// Get all announcements
export const getAllAnnouncements = catchAsync(async (_req: Request, res: Response) => {
	const announcements = await Announcement.find().sort("-createdAt");
	res.status(200).json({
		status: "success",
		results: announcements.length,
		data: { announcements },
	});
});

// Delete an announcement
export const deleteAnnouncement = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const announcement = await Announcement.findByIdAndDelete(req.params.id);

		if (!announcement) {
			return next(new AppError("Announcement not found", 404));
		}

		res.status(204).json({
			status: "success",
			data: null,
		});
	},
);