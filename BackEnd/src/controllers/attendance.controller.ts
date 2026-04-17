import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import Attendance from "../models/attendance.model.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import env from "../config/env.js";
import type { ISession } from "../types/types.js";
import { Types } from "mongoose";
import { usedTokens, activeTokens } from "./session.controller.js";

interface TokenPayload extends jwt.JwtPayload {
	sessionId: Types.ObjectId;
}

// QR scan – student checks in (must be on allowed IP)
export const scanQR = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const { qrToken } = req.body;

		if (!qrToken)
			return next(new AppError("QR token is required", 400, { qrToken: "Missing" }));

		if (usedTokens.has(qrToken))
			return next(
				new AppError("QR already used", 400, { qrToken: "This QR code has already been used" }),
			);

		try {
			const decoded = jwt.verify(qrToken, env.JWT_QR_SECRET) as TokenPayload;

			if (!activeTokens.has(qrToken))
				return next(new AppError("QR expired", 400, { qrToken: "QR code has expired" }));

			// Check if attendance already exists for this student/session
			const existing = await Attendance.findOne({
				student: req.user!._id,
				session: decoded.sessionId,
			});
			if (existing)
				return next(new AppError("Attendance already recorded for this session", 409, { attendance: "Duplicate" }));

			// Determine if late (>10 mins after session start – would need session lookup; mark present for QR path)
			await Attendance.create({
				student: req.user!._id,
				session: decoded.sessionId,
				status: "present",
			});

			usedTokens.add(qrToken);
			activeTokens.delete(qrToken);

			res.status(200).json({ status: "success", message: "Attendance recorded" });
		} catch {
			return next(new AppError("Invalid or expired QR code", 400, { qrToken: "Invalid or expired" }));
		}
	},
);

// Manual override by admin/instructor
export const manualUpdate = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const { id, status, note } = req.body;

		if (!id) return next(new AppError("Attendance ID is required", 400, { id: "Required" }));

		const allowed = ["present", "absent", "late", "excused"];
		if (!status || !allowed.includes(status))
			return next(new AppError(`Status must be one of: ${allowed.join(", ")}`, 400, { status: "Invalid" }));

		if (status === "excused" && !note)
			return next(new AppError("Excused status requires a note", 422, { note: "Required for excused status" }));

		const attendance = await Attendance.findById(id).populate("session");

		if (!attendance)
			return next(new AppError("Attendance record not found", 404, { attendance: "No record found" }));

		const session = attendance.session as ISession;
		const sessionEndTime = new Date(session.endTime).getTime();
		const hoursSinceEnd = (Date.now() - sessionEndTime) / (1000 * 60 * 60);

		if (hoursSinceEnd > 24) {
			return next(
				new AppError("Attendance records are locked after 24 hours", 403, {
					time: "Modification window expired",
				}),
			);
		}

		attendance.status = status as any;
		if (note) attendance.note = note;
		attendance.updatedAt = new Date();
		await attendance.save();

		res.status(200).json({ status: "success", data: { attendance } });
	},
);

// List attendance records (admin/instructor)
export const getAllAttendance = catchAsync(async (req: Request, res: Response) => {
	const { session, student, status } = req.query;
	const filter: Record<string, any> = {};

	if (session) filter.session = session;
	if (student) filter.student = student;
	if (status) filter.status = status;

	const records = await Attendance.find(filter)
		.populate("student", "name email")
		.populate("session", "title startTime endTime")
		.sort("-markedAt");

	res.status(200).json({
		status: "success",
		results: records.length,
		data: { attendance: records },
	});
});

// Attendance for a specific session
export const getAttendanceBySession = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const records = await Attendance.find({ session: req.params.sessionId })
			.populate("student", "name email")
			.sort("student");

		res.status(200).json({
			status: "success",
			results: records.length,
			data: { attendance: records },
		});
	},
);

// Student's own attendance history
export const getMyAttendance = catchAsync(async (req: Request, res: Response) => {
	const records = await Attendance.find({ student: req.user!._id })
		.populate("session", "title startTime endTime division")
		.sort("-markedAt");

	res.status(200).json({
		status: "success",
		results: records.length,
		data: { attendance: records },
	});
});
