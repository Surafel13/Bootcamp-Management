import type { Request, Response, NextFunction } from "express";
import Feedback from "../models/feedback.model.js";
import Attendance from "../models/attendance.model.js";
import Session from "../models/session.model.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";

// Student submits feedback for a session
export const submitFeedback = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const { session: sessionId, rating, comment } = req.body;

		if (!sessionId || !rating)
			return next(new AppError("Session and rating are required", 400, { session: "Required", rating: "Required" }));

		if (rating < 1 || rating > 5)
			return next(new AppError("Rating must be between 1 and 5", 422, { rating: "Out of range" }));

		const session = await Session.findById(sessionId);
		if (!session)
			return next(new AppError("Session not found", 404, { session: "Not found" }));

		// 48-hour time window check
		const hoursSinceEnd = (Date.now() - new Date(session.endTime).getTime()) / (1000 * 60 * 60);
		if (hoursSinceEnd > 48) {
			return next(
				new AppError("Feedback window has closed (48 hours after session end)", 422, {
					time: "Feedback window expired",
				}),
			);
		}

		// Only students who attended (present or late) can submit feedback
		const attendance = await Attendance.findOne({
			student: req.user!._id,
			session: sessionId,
			status: { $in: ["present", "late"] },
		});

		if (!attendance) {
			return next(
				new AppError("Only students who attended the session can submit feedback", 403, {
					attendance: "No valid attendance record",
				}),
			);
		}

		// Check for duplicate feedback
		const existing = await Feedback.findOne({ session: sessionId, student: req.user!._id });
		if (existing)
			return next(new AppError("You have already submitted feedback for this session", 409, { feedback: "Duplicate" }));

		const feedback = await Feedback.create({
			session: sessionId,
			student: req.user!._id,
			rating,
			comment,
		});

		// Never expose student identity in response
		res.status(201).json({
			status: "success",
			data: {
				feedback: { _id: feedback._id, session: feedback.session, rating: feedback.rating, comment: feedback.comment },
			},
		});
	},
);

// Aggregated feedback for a session (anonymous to instructor)
export const getSessionFeedback = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const { sessionId } = req.params;

		const session = await Session.findById(sessionId);
		if (!session)
			return next(new AppError("Session not found", 404, { session: "Not found" }));

		const feedbackList = await Feedback.find({ session: sessionId });

		const totalResponses = feedbackList.length;
		const averageRating =
			totalResponses > 0
				? Math.round((feedbackList.reduce((sum, f) => sum + f.rating, 0) / totalResponses) * 10) / 10
				: 0;

		const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
		feedbackList.forEach((f) => { distribution[f.rating] = (distribution[f.rating] || 0) + 1; });

		// Only return comments, never student IDs
		const comments = feedbackList
			.filter((f) => f.comment)
			.map((f) => f.comment);

		res.status(200).json({
			status: "success",
			data: {
				session: { _id: session._id, title: session.title },
				totalResponses,
				averageRating,
				distribution,
				comments,
			},
		});
	},
);

// Student's own feedback history
export const getMyFeedback = catchAsync(async (req: Request, res: Response) => {
	const feedbackList = await Feedback.find({ student: req.user!._id })
		.populate("session", "title startTime")
		.sort("-createdAt");

	res.status(200).json({
		status: "success",
		results: feedbackList.length,
		data: { feedback: feedbackList },
	});
});
