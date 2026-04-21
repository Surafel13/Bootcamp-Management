import type { Request, Response, NextFunction } from "express";
import Division from "../models/division.model.js";
import Session from "../models/session.model.js";
import Attendance from "../models/attendance.model.js";
import Feedback from "../models/feedback.model.js";
import User from "../models/user.model.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import { Types } from "mongoose";

export const createDivision = catchAsync(async (req: Request, res: Response) => {
	const division = await Division.create(req.body);
	res.status(201).json({ status: "success", data: { division } });
});

export const getAllDivisions = catchAsync(async (_req: Request, res: Response) => {
	const divisions = await Division.find().sort("name");
	res.status(200).json({
		status: "success",
		results: divisions.length,
		data: { divisions },
	});
});

export const getDivisionById = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const division = await Division.findById(req.params.id);
		if (!division)
			return next(new AppError("Division not found", 404, { id: "Not found" }));
		res.status(200).json({ status: "success", data: { division } });
	},
);

export const updateDivision = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const division = await Division.findByIdAndUpdate(
			req.params.id,
			req.body,
			{ new: true, runValidators: true },
		);
		if (!division)
			return next(new AppError("Division not found", 404, { id: "Not found" }));
		res.status(200).json({ status: "success", data: { division } });
	},
);

export const deleteDivision = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const division = await Division.findByIdAndDelete(req.params.id);
		if (!division)
			return next(new AppError("Division not found", 404, { id: "Not found" }));
		res.status(204).json({ status: "success", data: null });
	},
);

// Division statistics: total students, sessions, avg attendance, avg rating
export const getDivisionStats = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const divisionId = req.params.id;

		// Ensure `divisionId` is cast to `ObjectId`
		const division = await Division.findById(new Types.ObjectId(divisionId as string));
		if (!division)
			return next(new AppError("Division not found", 404, { id: "Not found" }));

		const [totalStudents, sessions, feedbackStats] = await Promise.all([
			User.countDocuments({
				roles: "student",
				divisions: new Types.ObjectId(divisionId as string),
				status: "active",
			} as any),
			Session.find({ division: divisionId }),
			Feedback.aggregate([
				{
					$lookup: {
						from: "sessions",
						localField: "session",
						foreignField: "_id",
						as: "sessionData",
					},
				},
				{ $unwind: "$sessionData" },
				{ $match: { "sessionData.division": division._id } },
				{
					$group: {
						_id: null,
						averageRating: { $avg: "$rating" },
						totalFeedback: { $sum: 1 },
					},
				},
			]),
		]);

		const totalSessions = sessions.length;
		const sessionIds = sessions.map((s: { _id: Types.ObjectId }) => s._id);

		// Calculate avg attendance rate
		let averageAttendance = 0;
		if (sessionIds.length > 0) {
			const attendanceData = await Attendance.aggregate([
				{ $match: { session: { $in: sessionIds }, status: { $in: ["present", "late"] } } },
				{ $group: { _id: "$session", count: { $sum: 1 } } },
			]);
			const totalPresent = attendanceData.reduce((sum, d) => sum + d.count, 0);
			const totalPossible = totalStudents * totalSessions;
			averageAttendance = totalPossible > 0
				? Math.round((totalPresent / totalPossible) * 100 * 10) / 10
				: 0;
		}

		res.status(200).json({
			status: "success",
			data: {
				division: { _id: division._id, name: division.name },
				totalStudents,
				totalSessions,
				averageAttendance,
				averageRating: feedbackStats[0]?.averageRating
					? Math.round(feedbackStats[0].averageRating * 10) / 10
					: 0,
				totalFeedback: feedbackStats[0]?.totalFeedback || 0,
			},
		});
	},
);
