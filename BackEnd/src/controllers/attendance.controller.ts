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
		const { qrToken } = req.body;
		const studentId = req.user!._id;

		if (!qrToken) {
			return next(new AppError("Missing qrToken", 400));
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

			// Corrected property name from `divisons` to `divisions` to match the schema definition
			if (!student.divisions?.some((div: Types.ObjectId) => div.toString() === session.division.toString())) {
				return next(new AppError("Student does not belong to this division", 403));
			}

			// 6. Student must not already be marked present
			const existingAttendance = await Attendance.findOne({
				student: studentId,
				session: decoded.sessionId,
			});

			if (existingAttendance) {
				return next(new AppError("Already marked attendance", 400));
			}

			// 7. Calculate status (Late if >10 minutes after session start)
			const sessionStart = new Date(session.startTime).getTime();
			const now = new Date().getTime();
			const diffInMinutes = (now - sessionStart) / (1000 * 60);
			const status = diffInMinutes > 10 ? "late" : "present";

			// 8. Create Attendance
			await Attendance.create({
				student: new Types.ObjectId(studentId),
				session: new Types.ObjectId(decoded.sessionId),
				status,
				markedAt: new Date()
			});

			// 8. Invalidate token
			usedTokens.add(qrToken);
			activeTokens.delete(qrToken);

			res.status(200).json({ 
				status: "success", 
				message: `Attendance recorded as ${status.toUpperCase()}`,
				data: {
					status,
					studentName: student.name,
					timestamp: new Date()
				}
			});
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
		// Correct the type for `student` in the query
		const records = await Attendance.find({
			student: new Types.ObjectId(req.params.studentId as string),
		}).populate("session", "startTime endTime");

		// Ensure `req.user.id` is properly typed
		if (!req.user || !req.user._id) {
			throw new AppError("User not authenticated", 401);
		}
		const studentId = req.user._id;

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

// Fetch all attendance records for admins/instructors
export const getAllAttendance = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const attendanceRecords = await Attendance.find();
    res.status(200).json({
        status: "success",
        data: attendanceRecords,
    });
});

// Fetch attendance for a specific session
export const getAttendanceBySession = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { sessionId } = req.params;
    const attendanceRecords = await Attendance.find({ session: sessionId });

    if (!attendanceRecords.length) {
        return next(new AppError("No attendance records found for this session", 404));
    }

    res.status(200).json({
        status: "success",
        data: attendanceRecords,
    });
});

// Fetch attendance history for the logged-in student
export const getMyAttendance = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // Ensure req.user is defined and has an id property
    if (!req.user || !req.user._id) {
        return next(new AppError("User not authenticated", 401));
    }

    const studentId = req.user._id;
    const attendanceRecords = await Attendance.find({ student: studentId });

    res.status(200).json({
        status: "success",
        data: attendanceRecords,
    });
});

// Admin/Instructor manually marks a student (e.g., Excused or Absent)
export const markManual = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { studentId, sessionId, status, note } = req.body;

    if (!studentId || !sessionId || !status) {
        return next(new AppError("Student ID, Session ID, and Status are required", 400));
    }

    const allowed = ["present", "absent", "late", "excused"];
    if (!allowed.includes(status)) {
        return next(new AppError("Invalid status", 400));
    }

    // Check if session exists
    const session = await Session.findById(sessionId);
    if (!session) return next(new AppError("Session not found", 404));

    // Check for existing record
    let attendance = await Attendance.findOne({ student: studentId, session: sessionId });

    if (attendance) {
        attendance.status = status;
        attendance.note = note || attendance.note;
        attendance.updatedAt = new Date();
        await attendance.save();
    } else {
        attendance = await Attendance.create({
            student: studentId,
            session: sessionId,
            status,
            note,
            markedAt: new Date(),
        });
    }

    res.status(200).json({
        status: "success",
        data: attendance,
    });
});

