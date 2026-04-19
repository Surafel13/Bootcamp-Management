import type { Request, Response, NextFunction } from "express";
import Session from "../models/session.model.js";
import Attendance from "../models/attendance.model.js";
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import { sendEmail } from "../services/email.service.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import env from "../config/env.js";
import type { ISession } from "../types/types.js";
import { Types } from "mongoose";
import type { IUser } from "../types/types.js";
import mongoose from "mongoose";

interface TokenPayload extends jwt.JwtPayload {
	sessionId: Types.ObjectId;
}

// Memory store for QR tokens (use Redis in production)
const usedTokens = new Set<string>();
const activeTokens = new Map<string, boolean>();

export const createSession = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const { division, startTime: rawStartTime, endTime: rawEndTime, instructor } = req.body;

		const startTime = new Date(rawStartTime);
		const endTime = new Date(rawEndTime);
		const now = new Date();

		// 1. Must be at least 1 hour in advance
		if (startTime.getTime() - now.getTime() < 60 * 60 * 1000) {
			return next(
				new AppError("Sessions must be scheduled at least 1 hour in advance", 422, {
					startTime: "Too soon",
				}),
			);
		}

		// 2. Minimum duration: 30 minutes
		const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
		if (duration < 30) {
			return next(
				new AppError("Session must be at least 30 minutes long", 400, {
					duration: "Minimum 30 minutes required",
				}),
			);
		}

		// 3. No overlapping sessions in the same division
		const overlappingDivisionSession = await Session.findOne({
			division,
			$or: [
				{ startTime: { $lt: endTime }, endTime: { $gt: startTime } },
				{ startTime: { $gte: startTime, $lt: endTime } },
				{ endTime: { $gt: startTime, $lte: endTime } },
			],
		});
		if (overlappingDivisionSession) {
			return next(
				new AppError("Overlapping session in the same division", 422, {
					session: "Conflict with another session",
				}),
			);
		}

		// 4. No double-booking of instructors
		const overlappingInstructorSession = await Session.findOne({
			instructor,
			$or: [
				{ startTime: { $lt: endTime }, endTime: { $gt: startTime } },
				{ startTime: { $gte: startTime, $lt: endTime } },
				{ endTime: { $gt: startTime, $lte: endTime } },
			],
		});
		if (overlappingInstructorSession) {
			return next(
				new AppError("Instructor is already booked for another session", 422, {
					instructor: "Double-booking detected",
				}),
			);
		}

		const session = await Session.create(req.body);

		// Notify students in the division
		const students = await User.find({
			role: "student",
			divisions: { $in: division.map((div: string) => new mongoose.Types.ObjectId(div)) },
			status: "active",
		});

		for (const student of students) {
			await Notification.create({
				user: student._id,
				message: `New session scheduled: "${session.title}" on ${startTime.toLocaleDateString()}`,
				type: "session",
			});
			sendEmail(
				student.email,
				`New Session: ${session.title}`,
				`Hello ${student.name},\n\nA new session has been scheduled:\n\nTitle: ${session.title}\nDate: ${startTime.toLocaleString()}\nLocation: ${session.location || session.onlineLink || "TBD"}`,
			).catch(() => {});
		}

		res.status(201).json({
			message: `New session scheduled: "${session.title}" on ${startTime.toLocaleDateString()}`,
		});
	},
);

export const getAllSessions = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
	const { division, status, from, to } = req.query;
	const filter: Record<string, any> = {};

	// Students can only see their own divisions' sessions
	if (req.user!.role === "student") {
		const user = req.user as IUser;
		if (!user.divisions) {
			return next(new AppError("User divisions not found", 400));
		}

		filter.division = { $in: user.divisions.map((div) => new mongoose.Types.ObjectId(div)) };
	} else if (division) {
		filter.division = { $in: (division as string[]).map((div) => new mongoose.Types.ObjectId(div)) };
	}

	if (status) filter.status = status;
	if (from || to) {
		filter.startTime = {};
		if (from) filter.startTime.$gte = new Date(from as string);
		if (to) filter.startTime.$lte = new Date(to as string);
	}

	const sessions = await Session.find(filter)
		.populate("division", "name")
		.populate("instructor", "name email")
		.sort("startTime");

	res.status(200).json({
		status: "success",
		results: sessions.length,
		data: { sessions },
	});
});

export const getSessionById = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const session = await Session.findById(req.params.id)
			.populate("division", "name")
			.populate("instructor", "name email");

		if (!session)
			return next(new AppError("Session not found", 404, { id: "Not found" }));

		res.status(200).json({ status: "success", data: { session } });
	},
);

export const updateSession = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		// If rescheduling, re-validate overlap
		if (req.body.startTime || req.body.endTime) {
			const existing = await Session.findById(req.params.id);
			if (!existing)
				return next(new AppError("Session not found", 404, { id: "Not found" }));

			const start = new Date(req.body.startTime || existing.startTime);
			const end = new Date(req.body.endTime || existing.endTime);
			const duration = (end.getTime() - start.getTime()) / (1000 * 60);

			if (duration < 30)
				return next(new AppError("Session must be at least 30 minutes long", 400, { duration: "Too short" }));

			const divisionOverlap = await Session.findOne({
				division: existing.division,
				status: "active",
				_id: { $ne: existing._id },
				$or: [{ startTime: { $lt: end }, endTime: { $gt: start } }],
			});
			if (divisionOverlap)
				return next(new AppError("Time slot conflicts with an existing session in this division", 409, { schedule: "Overlap" }));
		}

		const session = await Session.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true,
		}).populate("division", "name").populate("instructor", "name email");

		if (!session)
			return next(new AppError("Session not found", 404, { id: "Not found" }));

		res.status(200).json({ status: "success", data: { session } });
	},
);

export const cancelSession = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const session = await Session.findByIdAndUpdate(
			req.params.id,
			{ status: "cancelled" },
			{ new: true },
		);

		if (!session)
			return next(new AppError("Session not found", 404, { id: "Not found" }));

		// Ensure division is an ObjectId
		let divisionId: mongoose.Types.ObjectId;
		if (session.division instanceof mongoose.Types.ObjectId) {
			divisionId = session.division;
		} else if (typeof session.division === "string") {
			divisionId = new mongoose.Types.ObjectId(session.division);
		} else {
			return next(new AppError("Invalid division ID", 400));
		}

		// Notify all students in division – urgent
		const students = await User.find({
			role: "student",
			divisions: { $in: [divisionId] },
			status: "active",
		});

		for (const student of students) {
			await Notification.create({
				user: student._id,
				message: `CANCELLED: Session "${session.title}" has been cancelled.`,
				type: "session",
			});
			sendEmail(
				student.email,
				`[URGENT] Session Cancelled: ${session.title}`,
				`Hello ${student.name},\n\nThe session "${session.title}" scheduled for ${new Date(session.startTime).toLocaleString()} has been CANCELLED.\n\nPlease check the portal for updates.`,
			).catch(() => {});
		}

		res.status(200).json({
			status: "success",
			message: "Session cancelled and students notified",
			data: { session },
		});
	},
);

export const getSessionAttendance = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const session = await Session.findById(req.params.id);
		if (!session)
			return next(new AppError("Session not found", 404, { id: "Not found" }));

		const attendance = await Attendance.find({ session: req.params.id })
			.populate("student", "name email")
			.sort("student");

		res.status(200).json({
			status: "success",
			results: attendance.length,
			data: { attendance },
		});
	},
);

// QR Generation (moved here from attendance controller)
export const generateQR = catchAsync(async (req: Request, res: Response) => {
	const { sessionId } = req.params;
	const qrSecret = crypto.randomBytes(16).toString("hex");

	const token = jwt.sign({ sessionId, qrSecret }, env.JWT_QR_SECRET, {
		expiresIn: env.JWT_EXPIRES_IN,
	});

	activeTokens.set(token, true);
	setTimeout(() => activeTokens.delete(token), 16000);

	res.status(200).json({ status: "success", qrToken: token });
});

export { usedTokens, activeTokens };
