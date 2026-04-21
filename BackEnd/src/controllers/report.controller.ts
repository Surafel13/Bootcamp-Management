import type { Request, Response, NextFunction } from "express";
import Attendance from "../models/attendance.model.js";
import Submission from "../models/submission.model.js";
import Feedback from "../models/feedback.model.js";
import Session from "../models/session.model.js";
import AuditLog from "../models/auditLog.model.js";
import catchAsync from "../utils/catchAsync.js";

export const getAttendanceReport = catchAsync(async (req: Request, res: Response) => {
	const { division, from, to } = req.query;
	const filter: any = {};

	if (division) filter.division = division;
	if (from || to) {
		filter.startTime = {};
		if (from) filter.startTime.$gte = new Date(from as string);
		if (to) filter.startTime.$lte = new Date(to as string);
	}

	const sessions = await Session.find(filter).select("_id title startTime").sort("startTime");
	const sessionIds = sessions.map(s => s._id);

	const attendanceStats = await Attendance.aggregate([
		{ $match: { session: { $in: sessionIds } } },
		{
			$group: {
				_id: "$status",
				count: { $sum: 1 }
			}
		}
	]);

	res.status(200).json({
		status: "success",
		data: {
			totalSessions: sessions.length,
			stats: attendanceStats,
			sessions: sessions
		}
	});
});

export const getTaskReport = catchAsync(async (req: Request, res: Response) => {
	const { division } = req.query;
	const filter: any = {};
	if (division) filter.division = division;

	const submissionStats = await Submission.aggregate([
		{
			$group: {
				_id: "$status",
				count: { $sum: 1 },
				averageScore: { $avg: "$score" }
			}
		}
	]);

	res.status(200).json({
		status: "success",
		data: {
			stats: submissionStats
		}
	});
});

export const getFeedbackReport = catchAsync(async (req: Request, res: Response) => {
	const { division } = req.query;
	
    const matchStage: any = {};
    if (division) {
        // We'd need to join with sessions to filter by division
    }

	const feedbackStats = await Feedback.aggregate([
		{
			$group: {
				_id: null,
				averageRating: { $avg: "$rating" },
				totalFeedback: { $sum: 1 }
			}
		}
	]);

	res.status(200).json({
		status: "success",
		data: {
			stats: feedbackStats[0] || { averageRating: 0, totalFeedback: 0 }
		}
	});
});

export const getAuditLogs = catchAsync(async (req: Request, res: Response) => {
    const logs = await AuditLog.find()
        .populate("user", "name email")
        .sort("-timestamp")
        .limit(100);

    res.status(200).json({
        status: "success",
        results: logs.length,
        data: { logs }
    });
});
