import type { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import Attendance from "../models/attendance.model.js";
import Submission from "../models/submission.model.js";
import Feedback from "../models/feedback.model.js";
import Session from "../models/session.model.js";
import Task from "../models/task.model.js";
import Bootcamp from "../models/bootcamp.model.js";
import Enrollment from "../models/enrollment.model.js";
import User from "../models/user.model.js";
import AuditLog from "../models/auditLog.model.js";
import AppError from "../utils/appError.js";

// Helper function to get user's accessible divisions
const getUserDivisions = (user: any): mongoose.Types.ObjectId[] => {
  if (user.roles.includes("super_admin")) {
    return []; // Empty means all divisions
  }
  return user.memberships.map((m: any) => m.division);
};

// Helper function to build division filter
const buildDivisionFilter = (user: any, divisionParam?: string): any => {
  const isSuperAdmin = user.roles.includes("super_admin");
  const userDivisions = getUserDivisions(user);
  
  if (divisionParam) {
    // Check if user has access to requested division
    if (!isSuperAdmin && !userDivisions.some(d => d.toString() === divisionParam)) {
      throw new AppError("You don't have access to this division", 403);
    }
    return { division: divisionParam };
  }
  
  if (!isSuperAdmin && userDivisions.length > 0) {
    return { division: { $in: userDivisions } };
  }
  
  return {};
};

// Get attendance report
export const getAttendanceReport = async (req: Request, res: Response) => {
  const { division, from, to, bootcamp } = req.query;
  const user = req.user!;
  
  // Build filters
  const divisionFilter = buildDivisionFilter(user, division as string);
  const sessionFilter: any = { ...divisionFilter };
  
  if (bootcamp) {
    sessionFilter.bootcamp = bootcamp;
  }
  
  if (from || to) {
    sessionFilter.startTime = {};
    if (from) sessionFilter.startTime.$gte = new Date(from as string);
    if (to) sessionFilter.startTime.$lte = new Date(to as string);
  }
  
  const sessions = await Session.find(sessionFilter)
    .populate("bootcamp", "name")
    .select("_id title startTime endTime bootcamp")
    .sort("startTime");
  
  const sessionIds = sessions.map(s => s._id);
  
  // Get attendance statistics
  const attendanceStats = await Attendance.aggregate([
    { $match: { session: { $in: sessionIds } } },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 }
      }
    }
  ]);
  
  // Calculate attendance rate per session
  const sessionAttendance = await Promise.all(
    sessions.map(async (session) => {
      const totalStudents = await Enrollment.countDocuments({
        bootcamp: session.bootcamp,
        status: "active",
      });
      
      const presentCount = await Attendance.countDocuments({
        session: session._id,
        status: { $in: ["present", "late"] },
      });
      
      return {
        sessionId: session._id,
        sessionTitle: session.title,
        startTime: session.startTime,
        totalStudents,
        presentCount,
        attendanceRate: totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0,
      };
    })
  );
  
  // Calculate overall stats
  const totalAttendance = attendanceStats.reduce((sum, stat) => sum + stat.count, 0);
  const presentCount = attendanceStats.find(s => s._id === "present")?.count || 0;
  const lateCount = attendanceStats.find(s => s._id === "late")?.count || 0;
  const absentCount = attendanceStats.find(s => s._id === "absent")?.count || 0;
  
  res.status(200).json({
    status: "success",
    data: {
      summary: {
        totalSessions: sessions.length,
        totalAttendanceRecords: totalAttendance,
        presentCount,
        lateCount,
        absentCount,
        overallAttendanceRate: totalAttendance > 0 
          ? Math.round(((presentCount + lateCount) / totalAttendance) * 100) 
          : 0,
      },
      sessions: sessionAttendance,
      stats: attendanceStats,
    },
  });
}

// Get task report
export const getTaskReport = async (req: Request, res: Response) => {
  const { division, bootcamp, status } = req.query;
  const user = req.user!;
  
  // Build filters
  const divisionFilter = buildDivisionFilter(user, division as string);
  const taskFilter: any = { ...divisionFilter };
  
  if (bootcamp) {
    taskFilter.bootcamp = bootcamp;
  }
  
  if (status) {
    taskFilter.status = status;
  }
  
  const tasks = await Task.find(taskFilter)
    .populate("bootcamp", "name")
    .populate("division", "name")
    .sort("-createdAt");
  
  const taskIds = tasks.map(t => t._id);
  
  // Get submission statistics
  const submissionStats = await Submission.aggregate([
    { $match: { task: { $in: taskIds } } },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        averageScore: { $avg: "$score" },
        totalScore: { $sum: "$score" },
      }
    }
  ]);
  
  // Calculate per task stats
  const taskStats = await Promise.all(
    tasks.map(async (task) => {
      const submissions = await Submission.find({ task: task._id });
      const totalStudents = await Enrollment.countDocuments({
        bootcamp: task.bootcamp,
        status: "active",
      });
      
      const submittedCount = submissions.length;
      const gradedCount = submissions.filter(s => s.status === "graded").length;
      const averageScore = submissions.length > 0
        ? Math.round((submissions.reduce((sum, s) => sum + (s.score || 0), 0) / submissions.length) * 10) / 10
        : 0;
      
      return {
        taskId: task._id,
        taskTitle: task.title,
        deadline: task.deadline,
        maxScore: task.maxScore,
        totalStudents,
        submittedCount,
        submissionRate: totalStudents > 0 ? Math.round((submittedCount / totalStudents) * 100) : 0,
        gradedCount,
        pendingGrading: submittedCount - gradedCount,
        averageScore,
      };
    })
  );
  
  // Calculate overall stats
  const totalSubmissions = submissionStats.reduce((sum, stat) => sum + stat.count, 0);
  const gradedSubmissions = submissionStats.find(s => s._id === "graded")?.count || 0;
  const pendingSubmissions = submissionStats.find(s => s._id === "submitted")?.count || 0;
  const overallAverageScore = submissionStats
    .filter(s => s.averageScore)
    .reduce((sum, s) => sum + (s.averageScore || 0), 0) / (submissionStats.filter(s => s.averageScore).length || 1);
  
  res.status(200).json({
    status: "success",
    data: {
      summary: {
        totalTasks: tasks.length,
        totalSubmissions,
        gradedSubmissions,
        pendingSubmissions,
        overallAverageScore: Math.round(overallAverageScore * 10) / 10,
        completionRate: tasks.length > 0 
          ? Math.round((gradedSubmissions / (tasks.length * (tasks[0]?.maxScore || 1))) * 100)
          : 0,
      },
      tasks: taskStats,
      stats: submissionStats,
    },
  });
}

// Get feedback report
export const getFeedbackReport = async (req: Request, res: Response) => {
  const { division, bootcamp, from, to } = req.query;
  const user = req.user!;
  
  // Build session filter
  const divisionFilter = buildDivisionFilter(user, division as string);
  const sessionFilter: any = { ...divisionFilter };
  
  if (bootcamp) {
    sessionFilter.bootcamp = bootcamp;
  }
  
  if (from || to) {
    sessionFilter.endTime = {};
    if (from) sessionFilter.endTime.$gte = new Date(from as string);
    if (to) sessionFilter.endTime.$lte = new Date(to as string);
  }
  
  const sessions = await Session.find(sessionFilter).select("_id title startTime endTime");
  const sessionIds = sessions.map(s => s._id);
  
  // Get feedback statistics
  const feedbackStats = await Feedback.aggregate([
    { $match: { session: { $in: sessionIds } } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        totalFeedback: { $sum: 1 },
        rating1: { $sum: { $cond: [{ $eq: ["$rating", 1] }, 1, 0] } },
        rating2: { $sum: { $cond: [{ $eq: ["$rating", 2] }, 1, 0] } },
        rating3: { $sum: { $cond: [{ $eq: ["$rating", 3] }, 1, 0] } },
        rating4: { $sum: { $cond: [{ $eq: ["$rating", 4] }, 1, 0] } },
        rating5: { $sum: { $cond: [{ $eq: ["$rating", 5] }, 1, 0] } },
      }
    }
  ]);
  
  // Get per session feedback
  const sessionFeedback = await Promise.all(
    sessions.map(async (session) => {
      const feedback = await Feedback.find({ session: session._id });
      const avgRating = feedback.length > 0
        ? Math.round((feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length) * 10) / 10
        : 0;
      
      return {
        sessionId: session._id,
        sessionTitle: session.title,
        startTime: session.startTime,
        totalResponses: feedback.length,
        averageRating: avgRating,
        hasComments: feedback.filter(f => f.comment).length,
      };
    })
  );
  
  const stats = feedbackStats[0] || {
    averageRating: 0,
    totalFeedback: 0,
    rating1: 0,
    rating2: 0,
    rating3: 0,
    rating4: 0,
    rating5: 0,
  };
  
  res.status(200).json({
    status: "success",
    data: {
      summary: {
        totalSessions: sessions.length,
        totalFeedback: stats.totalFeedback,
        averageRating: Math.round(stats.averageRating * 10) / 10,
        ratingDistribution: {
          1: stats.rating1,
          2: stats.rating2,
          3: stats.rating3,
          4: stats.rating4,
          5: stats.rating5,
        },
      },
      sessions: sessionFeedback,
    },
  });
}

// Get audit logs
export const getAuditLogs = async (req: Request, res: Response) => {
  const { action, user: userId, from, to, limit = 100 } = req.query;
  const user = req.user!;
  
  const filter: any = {};
  
  if (action) filter.action = action;
  if (userId) filter.user = userId;
  
  if (from || to) {
    filter.timestamp = {};
    if (from) filter.timestamp.$gte = new Date(from as string);
    if (to) filter.timestamp.$lte = new Date(to as string);
  }
  
  // For division admins, only show logs from their divisions
  if (!user.roles.includes("super_admin") && user.roles.includes("division_admin")) {
    const userDivisions = getUserDivisions(user);
    filter.division = { $in: userDivisions };
  }
  
  const logs = await AuditLog.find(filter)
    .populate("user", "name email")
    .sort("-timestamp")
    .limit(Number(limit));
  
  const total = await AuditLog.countDocuments(filter);
  
  res.status(200).json({
    status: "success",
    results: logs.length,
    data: {
      logs,
      pagination: {
        total,
        limit: Number(limit),
        hasMore: logs.length < total,
      },
    },
  });
}

// Get dashboard stats
export const getDashboardStats = async (req: Request, res: Response) => {
  const user = req.user!;
  const isSuperAdmin = user.roles.includes("super_admin");
  const isDivisionAdmin = user.roles.includes("division_admin");
  
  // Get accessible divisions
  let divisionFilter: any = {};
  let divisionIds: mongoose.Types.ObjectId[] = [];
  
  if (!isSuperAdmin) {
    divisionIds = getUserDivisions(user);
    if (divisionIds.length === 0) {
      return res.status(200).json({
        status: "success",
        data: {
          totalStudents: 0,
          totalBootcamps: 0,
          totalSessions: 0,
          avgAttendance: "0%",
          avgRating: "0.0",
          pendingSubmissions: 0,
          activeTasks: 0,
        },
      });
    }
    divisionFilter = { division: { $in: divisionIds } };
  }
  
  // Get bootcamps in divisions
  const bootcamps = await Bootcamp.find(divisionFilter);
  const bootcampIds = bootcamps.map(b => b._id);
  
  // Total students enrolled
  const totalStudents = await Enrollment.countDocuments({
    bootcamp: { $in: bootcampIds },
    status: "active",
  });
  
  // Total bootcamps
  const totalBootcamps = bootcamps.length;
  
  // Total sessions
  const totalSessions = await Session.countDocuments(
    bootcampIds.length > 0 ? { bootcamp: { $in: bootcampIds } } : {}
  );
  
  // Get sessions for attendance calculation
  const sessions = await Session.find(
    bootcampIds.length > 0 ? { bootcamp: { $in: bootcampIds } } : {}
  ).select("_id");
  const sessionIds = sessions.map(s => s._id);
  
  // Attendance stats
  const attendanceStats = await Attendance.aggregate([
    { $match: { session: { $in: sessionIds } } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        presentOrLate: {
          $sum: {
            $cond: [{ $in: ["$status", ["present", "late"]] }, 1, 0]
          }
        }
      }
    }
  ]);
  
  const avgAttendance = attendanceStats.length > 0 && attendanceStats[0].total > 0
    ? Math.round((attendanceStats[0].presentOrLate / attendanceStats[0].total) * 100)
    : 0;
  
  // Feedback stats
  const feedbackStats = await Feedback.aggregate([
    { $match: { session: { $in: sessionIds } } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        totalFeedback: { $sum: 1 },
      }
    }
  ]);
  
  const avgRating = feedbackStats.length > 0 
    ? feedbackStats[0].averageRating.toFixed(1)
    : "0.0";
  
  // Tasks stats
  const tasks = await Task.find(
    bootcampIds.length > 0 ? { bootcamp: { $in: bootcampIds }, status: "active" } : { status: "active" }
  );
  const taskIds = tasks.map(t => t._id);
  
  const submissionStats = await Submission.aggregate([
    { $match: { task: { $in: taskIds }, status: "submitted" } },
    { $count: "pending" }
  ]);
  
  const pendingSubmissions = submissionStats[0]?.pending || 0;
  const activeTasks = tasks.length;
  
  // Recent activity
  const recentSubmissions = await Submission.find({ task: { $in: taskIds } })
    .populate("student", "name")
    .populate("task", "title")
    .sort("-submittedAt")
    .limit(5);
  
  const recentFeedback = await Feedback.find({ session: { $in: sessionIds } })
    .populate("student", "name")
    .populate("session", "title")
    .sort("-createdAt")
    .limit(5);
  
  res.status(200).json({
    status: "success",
    data: {
      overview: {
        totalStudents,
        totalBootcamps,
        totalSessions,
        avgAttendance: `${avgAttendance}%`,
        avgRating,
        pendingSubmissions,
        activeTasks,
      },
      recentActivity: {
        submissions: recentSubmissions,
        feedback: recentFeedback,
      },
    },
  });
}

// Get bootcamp-specific report
export const getBootcampReport = async (req: Request, res: Response) => {
  const  bootcampId  = req.params.bootcampId as string;
  const user = req.user!;
  
  const bootcamp = await Bootcamp.findById(bootcampId).populate("division");
  if (!bootcamp) {
    throw new AppError("Bootcamp not found", 404);
  }
  
  // Check access
  if (!user.roles.includes("super_admin")) {
    const hasAccess = user.memberships.some(
      (m: any) => m.division.toString() === bootcamp.division._id.toString()
    );
    if (!hasAccess) {
      throw new AppError("You don't have access to this bootcamp", 403);
    }
  }
  
  // Get sessions
  const sessions = await Session.find({ bootcamp: bootcampId });
  const sessionIds = sessions.map(s => s._id);
  
  // Enrollment stats
  const enrollmentStats = await Enrollment.aggregate([
    { $match: { bootcamp: new mongoose.Types.ObjectId(bootcampId) } },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);
  
  // Attendance stats
  const attendanceStats = await Attendance.aggregate([
    { $match: { session: { $in: sessionIds } } },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);
  
  // Task stats
  const tasks = await Task.find({ bootcamp: bootcampId });
  const taskIds = tasks.map(t => t._id);
  
  const submissionStats = await Submission.aggregate([
    { $match: { task: { $in: taskIds } } },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        averageScore: { $avg: "$score" },
      },
    },
  ]);
  
  // Feedback stats
  const feedbackStats = await Feedback.aggregate([
    { $match: { session: { $in: sessionIds } } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        totalFeedback: { $sum: 1 },
      },
    },
  ]);
  
  res.status(200).json({
    status: "success",
    data: {
      bootcamp: {
        id: bootcamp._id,
        name: bootcamp.name,
        division: bootcamp.division,
        startDate: bootcamp.startDate,
        endDate: bootcamp.endDate,
      },
      enrollment: enrollmentStats,
      attendance: attendanceStats,
      tasks: {
        total: tasks.length,
        submissions: submissionStats,
      },
      feedback: feedbackStats[0] || { averageRating: 0, totalFeedback: 0 },
      sessions: sessions.length,
    },
  });
}