// controllers/feedback.controller.ts
import type { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import Feedback from "../models/feedback.model.js";
import Attendance from "../models/attendance.model.js";
import Session from "../models/session.model.js";
import Bootcamp from "../models/bootcamp.model.js";
import Enrollment from "../models/enrollment.model.js";
import AppError from "../utils/appError.js";

// Helper function to check if user has access to session's division
const hasSessionAccess = async (userId: mongoose.Types.ObjectId, sessionId: string): Promise<boolean> => {
  const session = await Session.findById(sessionId).populate("bootcamp");
  if (!session) return false;

  const user = await User.findById(userId);
  if (!user) return false;

  // Super admin has access
  if (user.roles.includes("super_admin")) return true;

  // Division admin check
  if (user.roles.includes("division_admin")) {
    const bootcamp = session.bootcamp as any;
    return user.memberships.some(
      (m) => m.division.toString() === bootcamp.division.toString()
    );
  }

  return false;
};

// Student submits feedback for a session
export const submitFeedback = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { session: sessionId, rating, comment } = req.body;

    if (!sessionId || !rating) {
      return next(new AppError("Session and rating are required", 400));
    }

    if (rating < 1 || rating > 5) {
      return next(new AppError("Rating must be between 1 and 5", 422));
    }

    const session = await Session.findById(sessionId).populate("bootcamp");
    if (!session) {
      return next(new AppError("Session not found", 404));
    }

    // Check if student is enrolled in the bootcamp
    const enrollment = await Enrollment.findOne({
      student: req.user!._id,
      bootcamp: session.bootcamp,
      status: "active",
    });

    if (!enrollment) {
      return next(new AppError("You are not enrolled in this bootcamp", 403));
    }

    // 48-hour time window check
    const hoursSinceEnd = (Date.now() - new Date(session.endTime).getTime()) / (1000 * 60 * 60);
    if (hoursSinceEnd > 48) {
      return next(
        new AppError("Feedback window has closed (48 hours after session end)", 422)
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
        new AppError("Only students who attended the session can submit feedback", 403)
      );
    }

    // Check for duplicate feedback
    const existing = await Feedback.findOne({ 
      session: sessionId, 
      student: req.user!._id 
    });
    
    if (existing) {
      return next(new AppError("You have already submitted feedback for this session", 409));
    }

    const feedback = await Feedback.create({
      session: sessionId,
      student: req.user!._id,
      rating,
      comment: comment || "",
    });

    // Never expose student identity in response
    res.status(201).json({
      status: "success",
      data: {
        feedback: {
          _id: feedback._id,
          session: feedback.session,
          rating: feedback.rating,
          comment: feedback.comment,
          createdAt: feedback.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Aggregated feedback for a session (anonymous to instructor)
export const getSessionFeedback = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionId = req.params.sessionId as string;

    const session = await Session.findById(sessionId).populate("bootcamp");
    if (!session) {
      return next(new AppError("Session not found", 404));
    }

    // Check permission for staff
    const user = req.user!;
    const isSuperAdmin = user.roles.includes("super_admin");
    const isDivisionAdmin = user.roles.includes("division_admin");

    if (!isSuperAdmin && !isDivisionAdmin) {
      // For instructors, check instructor assignment
      const hasPermission = await checkInstructorPermissionForSession(user._id, sessionId, "view_feedback");
      if (!hasPermission) {
        return next(new AppError("You don't have permission to view feedback for this session", 403));
      }
    } else if (isDivisionAdmin && !isSuperAdmin) {
      // Check if admin has access to this division
      const bootcamp = session.bootcamp as any;
      const hasAccess = user.memberships.some(
        (m) => m.division.toString() === bootcamp.division.toString()
      );
      if (!hasAccess) {
        return next(new AppError("You don't have access to this session's feedback", 403));
      }
    }

    const feedbackList = await Feedback.find({ session: sessionId });

    const totalResponses = feedbackList.length;
    const averageRating = totalResponses > 0
      ? Math.round((feedbackList.reduce((sum, f) => sum + f.rating, 0) / totalResponses) * 10) / 10
      : 0;

    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    feedbackList.forEach((f) => {
      distribution[f.rating] = (distribution[f.rating] || 0) + 1;
    });

    // Only return comments, never student IDs
    const comments = feedbackList
      .filter((f) => f.comment && f.comment.trim())
      .map((f) => f.comment);

    res.status(200).json({
      status: "success",
      data: {
        session: { _id: session._id, title: session.title, startTime: session.startTime },
        totalResponses,
        averageRating,
        distribution,
        comments,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Student's own feedback history
export const getMyFeedback = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const feedbackList = await Feedback.find({ student: req.user!._id })
      .populate("session", "title startTime endTime bootcamp")
      .sort("-createdAt");

    // Calculate stats for student
    const stats = {
      total: feedbackList.length,
      average: feedbackList.length > 0
        ? Math.round((feedbackList.reduce((sum, f) => sum + f.rating, 0) / feedbackList.length) * 10) / 10
        : 0,
      byRating: {
        1: feedbackList.filter(f => f.rating === 1).length,
        2: feedbackList.filter(f => f.rating === 2).length,
        3: feedbackList.filter(f => f.rating === 3).length,
        4: feedbackList.filter(f => f.rating === 4).length,
        5: feedbackList.filter(f => f.rating === 5).length,
      },
    };

    res.status(200).json({
      status: "success",
      results: feedbackList.length,
      data: { 
        feedback: feedbackList,
        stats,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Student updates their own feedback
export const updateFeedback = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    const feedback = await Feedback.findOne({ _id: id, student: req.user!._id });
    
    if (!feedback) {
      return next(new AppError("Feedback not found or you don't have permission to edit it", 404));
    }

    // Check if session has ended more than 7 days ago
    const session = await Session.findById(feedback.session);
    if (session) {
      const daysSinceEnd = (Date.now() - new Date(session.endTime).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceEnd > 7) {
        return next(new AppError("Feedback can only be edited within 7 days of the session ending", 422));
      }
    }

    if (rating) {
      if (rating < 1 || rating > 5) {
        return next(new AppError("Rating must be between 1 and 5", 422));
      }
      feedback.rating = rating;
    }
    
    if (comment !== undefined) {
      feedback.comment = comment;
    }

    await feedback.save();

    res.status(200).json({
      status: "success",
      data: { 
        feedback: {
          _id: feedback._id,
          session: feedback.session,
          rating: feedback.rating,
          comment: feedback.comment,
          updatedAt: feedback.updatedAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Admin view of all feedback (Filtered by division for division_admin)
export const getAllFeedback = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { bootcamp, session, fromDate, toDate } = req.query;
    const filter: any = {};

    const user = req.user!;
    const isSuperAdmin = user.roles.includes("super_admin");
    const isDivisionAdmin = user.roles.includes("division_admin");

    // Apply filters
    if (bootcamp) filter.bootcamp = bootcamp;
    if (session) filter.session = session;

    // Date range filter
    if (fromDate || toDate) {
      filter.createdAt = {};
      if (fromDate) filter.createdAt.$gte = new Date(fromDate as string);
      if (toDate) filter.createdAt.$lte = new Date(toDate as string);
    }

    if (!isSuperAdmin && isDivisionAdmin) {
      // Division admin: get sessions in their divisions
      const userDivisionIds = user.memberships.map(m => m.division);
      
      const sessions = await Session.find({
        division: { $in: userDivisionIds },
      }).select("_id");
      
      const sessionIds = sessions.map(s => s._id);
      
      if (sessionIds.length === 0) {
        return res.status(200).json({
          status: "success",
          results: 0,
          data: { feedback: [], stats: {} },
        });
      }
      
      filter.session = { $in: sessionIds };
    }

    const feedback = await Feedback.find(filter)
      .populate("session", "title startTime endTime division bootcamp")
      .populate("student", "name email") // Only for admins
      .sort("-createdAt");

    // Calculate overall stats
    const stats = {
      total: feedback.length,
      averageRating: feedback.length > 0
        ? Math.round((feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length) * 10) / 10
        : 0,
      distribution: {
        1: feedback.filter(f => f.rating === 1).length,
        2: feedback.filter(f => f.rating === 2).length,
        3: feedback.filter(f => f.rating === 3).length,
        4: feedback.filter(f => f.rating === 4).length,
        5: feedback.filter(f => f.rating === 5).length,
      },
    };

    res.status(200).json({
      status: "success",
      results: feedback.length,
      data: { 
        feedback,
        stats,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get feedback stats for a bootcamp (admin/instructor)
export const getBootcampFeedbackStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { bootcampId } = req.params;

    const sessions = await Session.find({ bootcamp: bootcampId }).select("_id");
    const sessionIds = sessions.map(s => s._id);

    const feedback = await Feedback.find({
      session: { $in: sessionIds },
    });

    // Calculate stats per session
    const sessionStats = await Promise.all(
      sessions.map(async (session) => {
        const sessionFeedback = feedback.filter(f => f.session.toString() === session._id.toString());
        const avg = sessionFeedback.length > 0
          ? Math.round((sessionFeedback.reduce((sum, f) => sum + f.rating, 0) / sessionFeedback.length) * 10) / 10
          : 0;
        
        return {
          sessionId: session._id,
          sessionTitle: session.title,
          totalResponses: sessionFeedback.length,
          averageRating: avg,
        };
      })
    );

    const overallStats = {
      totalSessions: sessions.length,
      totalFeedback: feedback.length,
      averageRating: feedback.length > 0
        ? Math.round((feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length) * 10) / 10
        : 0,
      distribution: {
        1: feedback.filter(f => f.rating === 1).length,
        2: feedback.filter(f => f.rating === 2).length,
        3: feedback.filter(f => f.rating === 3).length,
        4: feedback.filter(f => f.rating === 4).length,
        5: feedback.filter(f => f.rating === 5).length,
      },
    };

    res.status(200).json({
      status: "success",
      data: {
        bootcampId,
        overallStats,
        sessionStats,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Helper function (implement this based on your instructor permission logic)
const checkInstructorPermissionForSession = async (
  userId: mongoose.Types.ObjectId,
  sessionId: string,
  permission: string
): Promise<boolean> => {
  const session = await Session.findById(sessionId).populate("bootcamp");
  if (!session) return false;

  const InstructorAssignment = mongoose.model("InstructorAssignment");
  const assignment = await InstructorAssignment.findOne({
    instructor: userId,
    bootcamp: session.bootcamp,
    status: "active",
    startDate: { $lte: new Date() },
    endDate: { $gte: new Date() },
  });

  return assignment?.permissions.includes(permission) || false;
};

// Import User model at the top
import User from "../models/user.model.js";