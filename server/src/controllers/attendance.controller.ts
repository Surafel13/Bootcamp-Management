// controllers/attendance.controller.ts
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import Attendance from "../models/attendance.model.js";
import Session from "../models/session.model.js";
import User from "../models/user.model.js";
import Bootcamp from "../models/bootcamp.model.js";
import Enrollment from "../models/enrollment.model.js";
import InstructorAssignment from "../models/instructorAssignment.model.js";
import AppError from "../utils/appError.js";
import crypto from "crypto";
import env from "../config/env.js";
import type { ISession } from "../types/types.js";
import { Types } from "mongoose";
import QRCode from "qrcode";

interface TokenPayload extends jwt.JwtPayload {
  sessionId: string;
  qrSecret: string;
  attendanceType: "present" | "late";
}

// Memory store for tokens
const usedTokens = new Set();
const activeTokens = new Map();

// Helper function to check if user has permission for a session
const hasAttendancePermission = async (userId: Types.ObjectId, sessionId: string): Promise<boolean> => {
  const session = await Session.findById(sessionId).populate("bootcamp", "division");
  if (!session) return false;

  const user = await User.findById(userId);
  if (!user) return false;

  // Super admin has all permissions
  if (user.roles.includes("super_admin")) return true;

  // Division admin for the session's division
  if (user.roles.includes("division_admin") || user.memberships.find(m => m.division.toString() === session.division.toString())) {
    const hasDivisionAccess = user.memberships.some(
      (m) => m.division.toString() === session.division.toString()
    );
    if (hasDivisionAccess) return true;
  }

  // Check instructor assignments
  const instructorAssignment = await InstructorAssignment.findOne({
    instructor: userId,
    bootcamp: session.bootcamp,
    status: "active",
    startDate: { $lte: new Date() },
    endDate: { $gte: new Date() },
  });

  return instructorAssignment?.permissions.includes("manage_attendance") || false;
};

// Helper to check if student is enrolled
const isStudentEnrolled = async (studentId: Types.ObjectId, sessionId: string): Promise<boolean> => {
  const session = await Session.findById(sessionId).populate("bootcamp");
  if (!session) return false;

  const enrollment = await Enrollment.findOne({
    student: studentId,
    bootcamp: session.bootcamp,
    status: "active",
  });

  return !!enrollment;
};

// Generate QR Code for attendance (Admin/Instructor only)
export const generateQR = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionId = req.params.sessionId as string;

    // Check permission
    const hasPermission = await hasAttendancePermission(req.user!._id, sessionId);
    if (!hasPermission) {
      return next(new AppError("You don't have permission to manage attendance for this session", 403));
    }

    const session = await Session.findById(sessionId);
    if (!session) {
      return next(new AppError("Session not found", 404));
    }

    const qrSecret = crypto.randomBytes(16).toString("hex");

    const token = jwt.sign(
      { sessionId, qrSecret, attendanceType: "present" },
      env.JWT_QR_SECRET || 'qr_scrt',
      { expiresIn: "5m" } // QR valid for 5 minutes
    );

    activeTokens.set(token, { sessionId, expiresAt: Date.now() + 5 * 60 * 1000 });
    setTimeout(() => activeTokens.delete(token), 5 * 60 * 1000);

    const qrData = JSON.stringify({
      sessionId,
      token,
      issued: new Date().toISOString(),
      sessionTitle: session.title,
    });

    const qrImage = await QRCode.toDataURL(qrData);

    res.status(200).json({
      status: "success",
      data: {
        qrImage,
        expiresIn: 300,
        sessionTitle: session.title,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Student scans QR code
export const scanQR = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { qrToken } = req.body;
    const studentId = req.user!._id;

    if (!qrToken) {
      return next(new AppError("Missing QR token", 400));
    }

    // Check if token was used
    if (usedTokens.has(qrToken)) {
      return next(new AppError("QR code already used", 400));
    }

    // Check if token exists in active store
    const tokenData = activeTokens.get(qrToken);
    if (!tokenData) {
      return next(new AppError("QR code has expired", 400));
    }

    // Verify JWT
    const decoded = jwt.verify(qrToken, env.JWT_QR_SECRET || 'qr_scrt') as TokenPayload;
    const session = await Session.findById(decoded.sessionId);
    
    if (!session) {
      return next(new AppError("Session not found", 404));
    }

    // Check if student is enrolled
    const isEnrolled = await isStudentEnrolled(studentId, decoded.sessionId);
    if (!isEnrolled) {
      return next(new AppError("You are not enrolled in this bootcamp", 403));
    }

    // Check if within session time window (optional: allow 15min before, 30min after)
    const now = new Date();
    const sessionStart = new Date(session.startTime);
    const sessionEnd = new Date(session.endTime);
    const gracePeriodStart = new Date(sessionStart.getTime() - 15 * 60 * 1000); // 15min before
    const gracePeriodEnd = new Date(sessionEnd.getTime() + 30 * 60 * 1000); // 30min after

    if (now < gracePeriodStart || now > gracePeriodEnd) {
      return next(new AppError("Attendance can only be marked during or near the session time", 400));
    }

    // Determine status based on time
    let status: "present" | "late" = "present";
    if (now > sessionStart) {
      status = "late";
    }

    // Check if already marked
    const existingAttendance = await Attendance.findOne({
      student: studentId,
      session: decoded.sessionId,
    });

    if (existingAttendance) {
      return next(new AppError("Attendance already marked for this session", 400));
    }

    // Create attendance record
    await Attendance.create({
      student: studentId,
      session: decoded.sessionId,
      status,
      markedAt: new Date(),
      qrToken,
    });

    // Invalidate token
    usedTokens.add(qrToken);
    activeTokens.delete(qrToken);

    const student = await User.findById(studentId);

    res.status(200).json({
      status: "success",
      message: `Attendance recorded as ${status.toUpperCase()}`,
      data: {
        status,
        studentName: student?.name,
        timestamp: new Date(),
        sessionTitle: session.title,
      },
    });
  } catch (err) {
    return next(new AppError("Invalid or expired QR code", 400));
  }
};

// Get all attendance (Admin/Division Admin only)
export const getAllAttendance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { division, bootcamp, session, fromDate, toDate } = req.query;
    const filter: Record<string, any> = {};

    const isSuperAdmin = req.user!.roles.includes("super_admin");
    const isDivisionAdmin = req.user!.roles.includes("division_admin");

    // Build query
    if (session) {
      filter.session = session;
    } else {
      // Get sessions based on user's access
      let sessions: any[] = [];
      
      if (isSuperAdmin) {
        const query: any = {};
        if (division) query.division = division;
        if (bootcamp) query.bootcamp = bootcamp;
        sessions = await Session.find(query).select("_id");
      } else if (isDivisionAdmin) {
        const userDivisionIds = req.user!.memberships.map((m) => m.division.toString());
        const query: any = { division: { $in: userDivisionIds } };
        if (bootcamp) query.bootcamp = bootcamp;
        sessions = await Session.find(query).select("_id");
      }

      if (sessions.length > 0) {
        filter.session = { $in: sessions.map((s) => s._id) };
      }
    }

    // Date range filter
    if (fromDate || toDate) {
      filter.markedAt = {};
      if (fromDate) filter.markedAt.$gte = new Date(fromDate as string);
      if (toDate) filter.markedAt.$lte = new Date(toDate as string);
    }

    const attendanceRecords = await Attendance.find(filter)
      .populate("student", "name email")
      .populate({
        path: "session",
        populate: {
          path: "bootcamp",
          select: "name",
        },
      })
      .sort("-markedAt");

    // Calculate statistics
    const stats = {
      total: attendanceRecords.length,
      present: attendanceRecords.filter((a) => a.status === "present").length,
      late: attendanceRecords.filter((a) => a.status === "late").length,
      absent: attendanceRecords.filter((a) => a.status === "absent").length,
      excused: attendanceRecords.filter((a) => a.status === "excused").length,
    };

    res.status(200).json({
      status: "success",
      data: {
        attendance: attendanceRecords,
        stats,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get attendance for a specific session
export const getAttendanceBySession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionId = req.params.sessionId as string;

    // Check permission
    const hasPermission = await hasAttendancePermission(req.user!._id, sessionId);
    if (!hasPermission) {
      return next(new AppError("You don't have permission to view attendance for this session", 403));
    }

    const session = await Session.findById(sessionId).populate("bootcamp");
    if (!session) {
      return next(new AppError("Session not found", 404));
    }

    // Get all students enrolled in the bootcamp
    const enrollments = await Enrollment.find({
      bootcamp: session.bootcamp,
      status: "active",
    }).populate("student", "name email");

    // Get attendance records
    const attendanceRecords = await Attendance.find({ session: sessionId });

    // Combine data
    const attendanceData = enrollments.map((enrollment) => {
      const attendance = attendanceRecords.find(
        (a) => a.student.toString() === enrollment.student._id.toString()
      );
      return {
        student: enrollment.student,
        status: attendance?.status || "absent",
        markedAt: attendance?.markedAt || null,
        note: attendance?.note || null,
        attendanceId: attendance?._id || null,
      };
    });

    const stats = {
      total: attendanceData.length,
      present: attendanceData.filter((a) => a.status === "present").length,
      late: attendanceData.filter((a) => a.status === "late").length,
      absent: attendanceData.filter((a) => a.status === "absent").length,
      excused: attendanceData.filter((a) => a.status === "excused").length,
      percentage: Math.round((attendanceData.filter((a) => a.status === "present" || a.status === "late").length / attendanceData.length) * 100),
    };

    res.status(200).json({
      status: "success",
      data: {
        session,
        attendance: attendanceData,
        stats,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get attendance for the logged-in student
export const getMyAttendance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user!._id;

    const attendanceRecords = await Attendance.find({ student: studentId })
      .populate({
        path: "session",
        populate: {
          path: "bootcamp",
          select: "name",
        },
      })
      .sort("-markedAt");

    const stats = {
      total: attendanceRecords.length,
      present: attendanceRecords.filter((a) => a.status === "present").length,
      late: attendanceRecords.filter((a) => a.status === "late").length,
      absent: attendanceRecords.filter((a) => a.status === "absent").length,
      excused: attendanceRecords.filter((a) => a.status === "excused").length,
    };

    res.status(200).json({
      status: "success",
      data: {
        attendance: attendanceRecords,
        stats,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Manual mark attendance (Admin/Instructor)
export const markManual = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { studentId, sessionId, status, note } = req.body;

    if (!studentId || !sessionId || !status) {
      return next(new AppError("Student ID, Session ID, and Status are required", 400));
    }

    const allowed = ["present", "absent", "late", "excused"];
    if (!allowed.includes(status)) {
      return next(new AppError("Invalid status", 400));
    }

    // Check permission
    const hasPermission = await hasAttendancePermission(req.user!._id, sessionId);
    if (!hasPermission) {
      return next(new AppError("You don't have permission to mark attendance for this session", 403));
    }

    const session = await Session.findById(sessionId);
    if (!session) {
      return next(new AppError("Session not found", 404));
    }

    // Check if student is enrolled
    const isEnrolled = await isStudentEnrolled(new Types.ObjectId(studentId), sessionId);
    if (!isEnrolled) {
      return next(new AppError("Student is not enrolled in this bootcamp", 400));
    }

    // Check for existing record
    let attendance = await Attendance.findOne({
      student: studentId,
      session: sessionId,
    });

    if (attendance) {
      attendance.status = status;
      attendance.note = note || attendance.note;
      attendance.updatedAt = new Date();
      attendance.markedBy = req.user!._id;
      await attendance.save();
    } else {
      attendance = await Attendance.create({
        student: studentId,
        session: sessionId,
        status,
        note,
        markedAt: new Date(),
        markedBy: req.user!._id,
      });
    }

    res.status(200).json({
      status: "success",
      message: `Attendance marked as ${status}`,
      data: { attendance },
    });
  } catch (error) {
    next(error);
  }
};

// Update attendance record (Admin/Instructor)
export const manualUpdate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const { status, note } = req.body;

    const attendance = await Attendance.findById(id).populate("session");
    if (!attendance) {
      return next(new AppError("Attendance record not found", 404));
    }

    // Check permission
    const hasPermission = await hasAttendancePermission(req.user!._id, attendance.session.toString());
    if (!hasPermission) {
      return next(new AppError("You don't have permission to update attendance for this session", 403));
    }

    // Check if within 24 hours of session end
    const session = attendance.session as any;
    const sessionEndTime = new Date(session.endTime).getTime();
    const currentTime = new Date().getTime();
    const hoursSinceEnd = (currentTime - sessionEndTime) / (1000 * 60 * 60);

    if (hoursSinceEnd > 24 && !req.user!.roles.includes("super_admin")) {
      return next(new AppError("Attendance records can only be modified within 24 hours after the session ends", 403));
    }

    if (status) attendance.status = status;
    if (note !== undefined) attendance.note = note;
    attendance.updatedAt = new Date();
    attendance.markedBy = req.user!._id;
    await attendance.save();

    res.status(200).json({
      status: "success",
      message: "Attendance updated successfully",
      data: { attendance },
    });
  } catch (error) {
    next(error);
  }
};

// Get attendance statistics for a bootcamp (Admin/Instructor)
export const getBootcampAttendanceStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const  bootcampId  = req.params.bootcampId as string;
    const { fromDate, toDate } = req.query;

    // Check if user has access to this bootcamp
    const bootcamp = await Bootcamp.findById(bootcampId);
    if (!bootcamp) {
      return next(new AppError("Bootcamp not found", 404));
    }

    const hasPermission = await hasAttendancePermission(req.user!._id, bootcampId);
    if (!hasPermission && !req.user!.roles.includes("division_admin")) {
      return next(new AppError("You don't have permission to view attendance for this bootcamp", 403));
    }

    // Get all sessions for this bootcamp
    const sessions = await Session.find({ bootcamp: bootcampId });
    const sessionIds = sessions.map((s) => s._id);

    // Build date filter
    const markedAtFilter: any = {};
    if (fromDate) markedAtFilter.$gte = new Date(fromDate as string);
    if (toDate) markedAtFilter.$lte = new Date(toDate as string);

    // Get all attendance records
    const attendanceRecords = await Attendance.find({
      session: { $in: sessionIds },
      ...(Object.keys(markedAtFilter).length > 0 && { markedAt: markedAtFilter }),
    });

    // Get enrollment count
    const enrollmentCount = await Enrollment.countDocuments({
      bootcamp: bootcampId,
      status: "active",
    });

    const stats = {
      totalSessions: sessions.length,
      totalAttendanceRecords: attendanceRecords.length,
      averageAttendancePerSession: sessions.length > 0 
        ? Math.round((attendanceRecords.length / sessions.length) * 100) / 100 
        : 0,
      statusBreakdown: {
        present: attendanceRecords.filter((a) => a.status === "present").length,
        late: attendanceRecords.filter((a) => a.status === "late").length,
        absent: attendanceRecords.filter((a) => a.status === "absent").length,
        excused: attendanceRecords.filter((a) => a.status === "excused").length,
      },
    };

    res.status(200).json({
      status: "success",
      data: { stats },
    });
  } catch (error) {
    next(error);
  }
};