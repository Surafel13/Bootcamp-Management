import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import Attendance from "../models/attendance.model.js";
import Session from "../models/session.model.js";
import User from "../models/user.model.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import crypto from "crypto";
import env from "../config/env.js";
import type { ISession } from "../types/types.js";
import { Types } from "mongoose";
import QRCode from "qrcode";

interface TokenPayload extends jwt.JwtPayload {
	sessionId: string;
	qrSecret: string;
}

// Memory store for tokens (Use Redis for multi-server setups)
const usedTokens = new Set();
const activeTokens = new Map();

export const generateQR = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
	const { sessionId } = req.params;

	// 1. Session must exist
	const session = await Session.findById(sessionId);
	if (!session) return next(new AppError("Session not found", 404));

	const qrSecret = crypto.randomBytes(16).toString("hex");

	// 2. Token expires in 13 seconds
	const token = jwt.sign({ sessionId, qrSecret }, env.JWT_QR_SECRET || 'qr_scrt', {
		expiresIn: "13s",
	});

	activeTokens.set(token, true);
	setTimeout(() => activeTokens.delete(token), 13000); // Clean up strictly after 13s

	// Generate QR Code base64 image
	const qrData = JSON.stringify({
		sessionId,
		token,
		issued: new Date().toISOString()
	});

	const qrImage = await QRCode.toDataURL(qrData);

	res.status(200).json({
		status: "success",
		qrImage: qrImage,
		expiresIn: 13
	});
});

export const scanQR = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const { qrToken, studentId } = req.body;

		if (!qrToken || !studentId) {
			return next(new AppError("Missing qrToken or studentId", 400));
		}

		// 1. Check if token was used
		if (usedTokens.has(qrToken))
			return next(new AppError("QR already used", 400));

		// 2. Verify in active store (redundant but explicit 13s local tracking)
		if (!activeTokens.has(qrToken))
			return next(new AppError("QR expired", 400));

		try {
			// 3. Verify JWT (Checks expiration as well)
			const decoded = jwt.verify(qrToken, env.JWT_QR_SECRET || 'qr_scrt') as TokenPayload;

			// 4. Token must match sessionId
			const session = await Session.findById(decoded.sessionId);
			if (!session) return next(new AppError("Session not found", 404));

			// 5. Student must be registered in that session/course
			const student = await User.findById(studentId);
			if (!student) return next(new AppError("Student not found", 404));

			if (!student.divisions.some(div => div.toString() === session.division.toString())) {
				return next(new AppError("Unauthorized student. Not registered in this session's division.", 403));
			}

			// 6. Student must not already be marked present
			const existingAttendance = await Attendance.findOne({
				student: studentId,
				session: decoded.sessionId,
			});

			if (existingAttendance) {
				return next(new AppError("Already marked attendance", 400));
			}

			// 7. Create Attendance
			await Attendance.create({
				student: new Types.ObjectId(studentId),
				session: new Types.ObjectId(decoded.sessionId),
				status: "attend",
				markedAt: new Date()
			});

			// 8. Invalidate token
			usedTokens.add(qrToken);
			activeTokens.delete(qrToken);

			res.status(200).json({ status: "success", message: "Attendance recorded", timestamp: new Date() });
		} catch (err) {
			return next(new AppError("Invalid token or QR expired", 400));
		}
	},
);

export const getSessionAttendance = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const records = await Attendance.find({ session: req.params.sessionId }).populate("student", "name email");
		res.status(200).json({ status: "success", data: records });
	}
);

export const getStudentAttendance = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const records = await Attendance.find({ student: req.params.studentId }).populate("session", "startTime endTime");
		res.status(200).json({ status: "success", data: records });
	}
);

export const manualUpdate = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const attendance = await Attendance.findById(req.params.id).populate(
			"session",
		);

		if (!attendance)
			return next(
				new AppError("Attendance not found", 404, {
					attendance: "No record found",
				}),
			);

		// Logic: Calculate if 24 hours have passed since the session ended
		const session = attendance.session as ISession;
		const sessionEndTime = new Date(session.endTime).getTime();
		const currentTime = new Date().getTime();
		const hoursSinceEnd = (currentTime - sessionEndTime) / (1000 * 60 * 60);

		if (hoursSinceEnd > 24) {
			return next(
				new AppError("Attendance records are locked after 24 hours.", 403, {
					time: "Modification window expired",
				}),
			);
		}

		attendance.status = req.body.status;
		attendance.updatedAt = new Date();
		await attendance.save();

		res.status(200).json({ status: "success", data: attendance });
	},
);
