import type { Request, Response, NextFunction } from "express";
import Notification from "../models/notification.model.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";

// Get all notifications for the logged-in user
export const getMyNotifications = catchAsync(async (req: Request, res: Response) => {
	const notifications = await Notification.find({ user: req.user!._id }).sort("-createdAt");
	const unreadCount = notifications.filter((n) => !n.read).length;

	res.status(200).json({
		status: "success",
		unreadCount,
		results: notifications.length,
		data: { notifications },
	});
});

// Mark a single notification as read
export const markAsRead = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const notification = await Notification.findOneAndUpdate(
			{ _id: req.params.id, user: req.user!._id },
			{ read: true },
			{ new: true },
		);

		if (!notification)
			return next(new AppError("Notification not found", 404, { id: "Not found" }));

		res.status(200).json({ status: "success", data: { notification } });
	},
);

// Mark all notifications as read
export const markAllAsRead = catchAsync(async (req: Request, res: Response) => {
	await Notification.updateMany({ user: req.user!._id, read: false }, { read: true });
	res.status(200).json({ status: "success", message: "All notifications marked as read" });
});

// Create a new notification
export const createNotification = catchAsync(async (req: Request, res: Response) => {
	const { user, message, type } = req.body;

	if (!user || !message || !type) {
		return res.status(400).json({
			status: "fail",
			message: "User, message, and type are required fields",
		});
	}

	const notification = await Notification.create({ user, message, type });

	res.status(201).json({
		status: "success",
		data: { notification },
	});
});

// Delete a notification
export const deleteNotification = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const notification = await Notification.findOneAndDelete({
			_id: req.params.id,
			user: req.user!._id,
		});

		if (!notification) {
			return next(new AppError("Notification not found", 404));
		}

		res.status(204).json({
			status: "success",
			data: null,
		});
	},
);
