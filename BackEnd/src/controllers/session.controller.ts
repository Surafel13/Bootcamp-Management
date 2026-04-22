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
import * as QRCode from "qrcode";

interface TokenPayload extends jwt.JwtPayload {
	sessionId: Types.ObjectId;
	attendanceType: "present" | "late";
}

// Memory store for QR tokens (use Redis in production)
const usedTokens = new Set<string>();
const activeTokens = new Map<string, boolean>();
const activeSessionQR = new Map<string, { token: string, image: string, expiresAt: number }>();

export const createSession = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const { division, startTime, endTime, instructor } = req.body;

		const start = new Date(startTime);
		const end = new Date(endTime);
		const now = new Date();


		// 2. Minimum duration: 1 minute
		const duration = (end.getTime() - start.getTime()) / (1000 * 60);
		if (duration < 1) {
			return next(
				new AppError("Session must be at least 1 minute long", 400, {
					duration: "Minimum 1 minute required",
				}),
			);
		}

		// 3. No overlapping sessions in same division
		const divisionOverlap = await Session.findOne({
			division,
			status: "active",
			$or: [{ startTime: { $lt: end }, endTime: { $gt: start } }],
		});
		if (divisionOverlap)
			return next(
				new AppError("A session already exists in this time slot for this division", 409, {
					schedule: "Division overlap",
				}),
			);

		// 4. Instructor cannot be double-booked
		if (instructor) {
			const instructorOverlap = await Session.findOne({
				instructor: new Types.ObjectId(instructor),
				status: "active",
				$or: [{ startTime: { $lt: end }, endTime: { $gt: start } }],
			});
			if (instructorOverlap)
				return next(
					new AppError("Instructor already has a session in this time slot", 409, {
						instructor: "Double-booking detected",
					}),
				);
		}

		const session = await Session.create(req.body);

		// Notify students in the division
		// Ensure `session.division` is strictly cast to ObjectId
		const divisionId =
			session.division instanceof Types.ObjectId
				? session.division
				: new Types.ObjectId(session.division.toString());

		const students = await User.find({
			role: "student",
			divisions: { $in: [divisionId] },
			status: "active",
		} as any);
		for (const student of students) {
			await Notification.create({
				user: student._id,
				message: `New session scheduled: "${session.title}" on ${start.toLocaleDateString()}`,
				type: "session",
			});
			sendEmail(
				student.email,
				`New Session: ${session.title}`,
				`Hello ${student.name},\n\nA new session has been scheduled:\n\nTitle: ${session.title}\nDate: ${start.toLocaleString()}\nLocation: ${session.location || session.onlineLink || "TBD"}`,
			).catch(() => {});
		}

		res.status(201).json({ status: "success", data: { session } });
	},
);

export const getAllSessions = catchAsync(async (req: Request, res: Response) => {
	const { division, status, from, to } = req.query;
	const filter: Record<string, any> = {};

	// Restriction Logic:
	// 1. Super Admins see everything (no default filter).
	// 2. Division Admins & Students see only their assigned divisions.
	const isSuperAdmin = req.user!.roles.includes("super_admin");
	
	if (!isSuperAdmin) {
		filter.division = { $in: req.user!.divisions };
	} else if (division) {
		filter.division = division;
	}

	if (status) filter.status = status;
	if (from || to) {
		filter.startTime = {};
		if (from) filter.startTime.$gte = new Date(from as string);
		if (to) filter.startTime.$lte = new Date(to as string);
	}

	// Auto-complete expired sessions
	await Session.updateMany(
		{ endTime: { $lt: new Date() }, status: { $in: ["upcoming", "active"] } },
		{ status: "completed" }
	);

	const sessions = await Session.find(filter)
		.populate("division", "name")
		.populate("instructor", "name email")
		.sort("-startTime");

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

			if (duration < 1)
				return next(new AppError("Session must be at least 1 minute long", 400, { duration: "Too short" }));

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

		// Notify all students in division – urgent
		const students = await User.find({
			role: "student",
			divisions: { $in: [session.division as any] },
			status: "active",
		} as any);

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
export const generateQR = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
	console.log(`Generating QR for session: ${req.params.sessionId}`);
	const { sessionId } = req.params;
	
	const session = await Session.findById(sessionId);
	if (!session) return next(new AppError("Session not found", 404));

	const now = new Date();
	const startTime = new Date(session.startTime);
	const endTime = new Date(session.endTime);

	// Security Gate: strictly at or after startTime
	if (now.getTime() < startTime.getTime()) {
		const diffMs = startTime.getTime() - now.getTime();
		const hoursLeft = Math.floor(diffMs / (1000 * 60 * 60));
		const minutesLeft = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
		return next(new AppError(`QR generation is not allowed yet. Session starts in ${hoursLeft} hours and ${minutesLeft} minutes.`, 400));
	}

	if (now.getTime() > endTime.getTime()) {
		return next(new AppError("This session has already ended. Cannot generate QR.", 400));
	}

	session.qrGenerationCount = (session.qrGenerationCount || 0) + 1;
	await session.save();

	const attendanceType = req.body.attendanceType || "present";
	const qrSecret = crypto.randomBytes(16).toString("hex");

	const token = jwt.sign({ 
		sessionId, 
		qrSecret, 
		attendanceType,
		generationCount: session.qrGenerationCount 
	}, env.JWT_QR_SECRET || "qr_scrt", {
		expiresIn: "20s",
	});

	activeTokens.set(token, true);
	
	const qrData = JSON.stringify({
		sessionId,
		token,
		issued: new Date().toISOString(),
		generationCount: session.qrGenerationCount
	});

	const qrImage = await QRCode.toDataURL(qrData);

	activeSessionQR.set(sessionId as string, { token, image: qrImage, expiresAt: Date.now() + 20000 });
	
	setTimeout(() => {
		activeTokens.delete(token);
		const current = activeSessionQR.get(sessionId as string);
		if (current && current.token === token) activeSessionQR.delete(sessionId as string);
	}, 20000);

	res.status(200).json({ status: "success", qrImage, qrToken: token, expiresIn: 20 });
});

export const getActiveQR = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
	const { sessionId } = req.params;
	const activeQR = activeSessionQR.get(sessionId as string);

	if (!activeQR || Date.now() > activeQR.expiresAt) {
		return res.status(200).json({ status: "success", qrImage: null, qrToken: null });
	}

	res.status(200).json({ 
		status: "success", 
		qrImage: activeQR.image, 
		qrToken: activeQR.token,
		expiresIn: Math.ceil((activeQR.expiresAt - Date.now()) / 1000)
	});
});

export { usedTokens, activeTokens };
