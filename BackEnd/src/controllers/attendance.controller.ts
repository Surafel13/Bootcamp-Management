import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import Attendance from "../models/attendance.model.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import crypto from "crypto";
import env from "../config/env.js";
import type { ISession } from "../types/types.js";
import { Types } from "mongoose";

interface TokenPayload extends jwt.JwtPayload {
	sessionId: Types.ObjectId;
}

// Memory store for tokens (Use Redis for multi-server setups)
const usedTokens = new Set();
const activeTokens = new Map();

export const generateQR = catchAsync(async (req: Request, res: Response) => {
	const { sessionId } = req.params;
	const qrSecret = crypto.randomBytes(16).toString("hex");

	// const token = jwt.sign({ sessionId, qrSecret }, env.JWT_QR_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
	const token = jwt.sign({ sessionId, qrSecret }, env.JWT_QR_SECRET, {
		expiresIn: env.JWT_EXPIRES_IN,
	});

	activeTokens.set(token, true);
	setTimeout(() => activeTokens.delete(token), 16000); // Clean up

	res.status(200).json({ status: "success", qrToken: token });
});

export const scanQR = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const { qrToken } = req.body;

		// 1. Check if token was used
		if (usedTokens.has(qrToken))
			return next(
				new AppError("QR already used", 400, {
					qrToken: "This QR code has already been used",
				}),
			);

		try {
			// 2. Verify JWT
			const decoded = jwt.verify(qrToken, env.JWT_QR_SECRET) as TokenPayload;

			// 3. Verify in active store
			if (!activeTokens.has(qrToken))
				return next(
					new AppError("QR expired", 400, {
						qrToken: "QR code has expired",
					}),
				);

			// 4. Create Attendance
			await Attendance.create({
				student: req?.user?._id.toString()!,
				session: decoded.sessionId,
				status: "attend",
			});

			// 5. Invalidate
			usedTokens.add(qrToken);
			activeTokens.delete(qrToken);

			res
				.status(200)
				.json({ status: "success", message: "Attendance recorded" });
		} catch (err) {
			return next(
				new AppError("Invalid or expired QR code", 400, {
					qrToken: "Invalid or expired",
				}),
			);
		}
	},
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
