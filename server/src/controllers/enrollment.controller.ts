// controllers/enrollment.controller.ts
import type { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import Enrollment from "../models/enrollment.model.js";
import Bootcamp from "../models/bootcamp.model.js";
import Notification from "../models/notification.model.js";
import AppError from "../utils/appError.js";
import User from "../models/user.model.js";

// Helper function to check if user has access to bootcamp's division
const hasDivisionAccess = async (userId: mongoose.Types.ObjectId, bootcampId: string): Promise<boolean> => {
  const user = await User.findById(userId);
  const bootcamp = await Bootcamp.findById(bootcampId);
  
  if (!user || !bootcamp) return false;
  
  // Super admin has access to everything
  if (user.roles.includes("super_admin")) return true;
  
  // Check if user has membership in the bootcamp's division
  return user.memberships.some(
    (m) => m.division.toString() === bootcamp.division.toString()
  );
};

// Student enrolls in a bootcamp
export const enrollInBootcamp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { bootcamp: bootcampId } = req.body;
    
    if (!bootcampId) {
      return next(new AppError("Bootcamp ID is required", 400));
    }

    const bootcamp = await Bootcamp.findById(bootcampId);
    if (!bootcamp) {
      return next(new AppError("Bootcamp not found", 404));
    }

    // Check enrollment deadline
    if (new Date() > new Date(bootcamp.enrollmentDeadline)) {
      return next(
        new AppError("Enrollment deadline has passed", 422, {
          enrollmentDeadline: "Cannot enroll after deadline",
        }),
      );
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      student: req.user!._id,
      bootcamp: bootcampId,
    });

    if (existingEnrollment) {
      return next(
        new AppError("You are already enrolled in this bootcamp", 409, {
          enrollment: "Duplicate enrollment",
        }),
      );
    }

    const enrollment = await Enrollment.create({
      student: req.user!._id,
      bootcamp: bootcampId,
      status: "active",
    });

    // Notify bootcamp creator (admin/instructor)
    await Notification.create({
      user: bootcamp.creator,
      message: `${req.user!.name} has enrolled in "${bootcamp.name}"`,
      type: "enrollment",
    });

    res.status(201).json({ 
      status: "success", 
      data: { enrollment } 
    });
  } catch (error) {
    next(error);
  }
};

// Get all enrollments (filtered by role)
export const getAllEnrollments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { bootcamp, student, status } = req.query;
    const filter: Record<string, any> = {};

    const user = req.user!;
    const isSuperAdmin = user.roles.includes("super_admin");
    const isDivisionAdmin = user.roles.includes("division_admin");
    const isStudent = user.roles.includes("student");

    if (isStudent && !isSuperAdmin && !isDivisionAdmin) {
      // Students can only see their own enrollments
      filter.student = user._id;
    } else if (isDivisionAdmin && !isSuperAdmin) {
      // Division admins can see enrollments in their divisions
      const userDivisionIds = user.memberships.map(m => m.division);
      
      // Find all bootcamps in admin's divisions
      const divisionBootcamps = await Bootcamp.find({
        division: { $in: userDivisionIds },
      }).select("_id");
      
      const bootcampIds = divisionBootcamps.map(b => b._id);
      
      if (bootcampIds.length === 0) {
        return res.status(200).json({
          status: "success",
          results: 0,
          data: { enrollments: [] },
        });
      }
      
      filter.bootcamp = { $in: bootcampIds };
    }

    // Apply additional filters
    if (bootcamp) filter.bootcamp = bootcamp;
    if (student && !isStudent) filter.student = student;
    if (status) filter.status = status;

    const enrollments = await Enrollment.find(filter)
      .populate("student", "name email memberships")
      .populate("bootcamp", "name startDate endDate division status")
      .sort("-createdAt");

    res.status(200).json({
      status: "success",
      results: enrollments.length,
      data: { enrollments },
    });
  } catch (error) {
    next(error);
  }
};

// Get single enrollment
export const getEnrollmentById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id)
      .populate("student", "name email memberships")
      .populate("bootcamp", "name startDate endDate division status");

    if (!enrollment) {
      return next(new AppError("Enrollment not found", 404));
    }

    const user = req.user!;
    const isSuperAdmin = user.roles.includes("super_admin");
    const isDivisionAdmin = user.roles.includes("division_admin");
    const isStudent = user.roles.includes("student");

    // Authorization check
    if (isStudent && !isSuperAdmin && !isDivisionAdmin) {
      if (enrollment.student._id.toString() !== user._id.toString()) {
        return next(new AppError("You do not have permission to view this enrollment", 403));
      }
    } else if (isDivisionAdmin && !isSuperAdmin) {
      // Check if admin has access to this bootcamp's division
      const bootcamp = enrollment.bootcamp as any;
      const hasAccess = user.memberships.some(
        (m) => m.division.toString() === bootcamp.division.toString()
      );
      
      if (!hasAccess) {
        return next(new AppError("You do not have permission to view this enrollment", 403));
      }
    }

    res.status(200).json({ 
      status: "success", 
      data: { enrollment } 
    });
  } catch (error) {
    next(error);
  }
};

// Update enrollment status (admin only)
export const updateEnrollmentStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ["active", "dropped", "completed"];

    if (!allowedStatuses.includes(status)) {
      return next(
        new AppError(`Status must be one of: ${allowedStatuses.join(", ")}`, 400),
      );
    }

    const enrollment = await Enrollment.findById(req.params.id)
      .populate("student", "name email")
      .populate("bootcamp", "name division");

    if (!enrollment) {
      return next(new AppError("Enrollment not found", 404));
    }

    // Check if user has permission
    const user = req.user!;
    const isSuperAdmin = user.roles.includes("super_admin");
    const isDivisionAdmin = user.roles.includes("division_admin");
    
    if (!isSuperAdmin && !isDivisionAdmin) {
      return next(new AppError("Only admins can update enrollment status", 403));
    }

    // Division admin check
    if (isDivisionAdmin && !isSuperAdmin) {
      const bootcamp = enrollment.bootcamp as any;
      const hasAccess = user.memberships.some(
        (m) => m.division.toString() === bootcamp.division.toString()
      );
      
      if (!hasAccess) {
        return next(new AppError("You do not have permission to update this enrollment", 403));
      }
    }

    enrollment.status = status;
    await enrollment.save();

    // Notify student about status change
    if (status !== "active") {
      await Notification.create({
        user: enrollment.student._id,
        message: `Your enrollment in "${(enrollment.bootcamp as any).name}" has been ${status}`,
        type: "enrollment",
      });
    }

    res.status(200).json({ 
      status: "success", 
      data: { enrollment } 
    });
  } catch (error) {
    next(error);
  }
};

// Drop from bootcamp (student or admin)
export const dropEnrollment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id)
      .populate("bootcamp", "name division");

    if (!enrollment) {
      return next(new AppError("Enrollment not found", 404));
    }

    const user = req.user!;
    const isSuperAdmin = user.roles.includes("super_admin");
    const isDivisionAdmin = user.roles.includes("division_admin");

    // Check permissions
    let hasPermission = false;
    
    if (isSuperAdmin) {
      hasPermission = true;
    } else if (isDivisionAdmin) {
      const bootcamp = enrollment.bootcamp as any;
      hasPermission = user.memberships.some(
        (m) => m.division.toString() === bootcamp.division.toString()
      );
    } else {
      // Student can only drop their own enrollment
      hasPermission = enrollment.student.toString() === user._id.toString();
    }

    if (!hasPermission) {
      return next(new AppError("You do not have permission to drop this enrollment", 403));
    }

    // Prevent dropping if status is already dropped or completed
    if (enrollment.status === "completed") {
      return next(new AppError("Cannot drop a completed bootcamp", 400));
    }

    enrollment.status = "dropped";
    await enrollment.save();

    res.status(200).json({
      status: "success",
      message: "Enrollment dropped successfully",
      data: { enrollment },
    });
  } catch (error) {
    next(error);
  }
};

// Get my enrollments (student)
export const getMyEnrollments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const enrollments = await Enrollment.find({ 
      student: req.user!._id,
      status: { $ne: "dropped" } // Exclude dropped by default
    })
      .populate("bootcamp", "name description startDate endDate division status")
      .sort("-createdAt");

    // Separate active and completed enrollments
    const active = enrollments.filter(e => e.status === "active");
    const completed = enrollments.filter(e => e.status === "completed");

    res.status(200).json({
      status: "success",
      results: enrollments.length,
      data: {
        enrollments,
        active,
        completed,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get bootcamp enrollment stats (admin)
export const getBootcampEnrollmentStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bootcampId  = req.params.bootcampId as string;
    
    const bootcamp = await Bootcamp.findById(bootcampId);
    if (!bootcamp) {
      return next(new AppError("Bootcamp not found", 404));
    }

    // Check permission
    const user = req.user!;
    const isSuperAdmin = user.roles.includes("super_admin");
    const isDivisionAdmin = user.roles.includes("division_admin");
    
    if (!isSuperAdmin && !isDivisionAdmin) {
      return next(new AppError("Only admins can view enrollment stats", 403));
    }

    if (isDivisionAdmin && !isSuperAdmin) {
      const hasAccess = user.memberships.some(
        (m) => m.division.toString() === bootcamp.division.toString()
      );
      if (!hasAccess) {
        return next(new AppError("You do not have access to this bootcamp", 403));
      }
    }

    const stats = await Enrollment.aggregate([
      { $match: { bootcamp: new mongoose.Types.ObjectId(bootcampId) } },
      { 
        $group: { 
          _id: "$status", 
          count: { $sum: 1 } 
        } 
      }
    ]);

    const enrolledCount = await Enrollment.countDocuments({ 
      bootcamp: bootcampId, 
      status: "active" 
    });

    const droppedCount = await Enrollment.countDocuments({ 
      bootcamp: bootcampId, 
      status: "dropped" 
    });

    const completedCount = await Enrollment.countDocuments({ 
      bootcamp: bootcampId, 
      status: "completed" 
    });

    res.status(200).json({
      status: "success",
      data: {
        total: enrolledCount + droppedCount + completedCount,
        active: enrolledCount,
        dropped: droppedCount,
        completed: completedCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Check if student is enrolled in a bootcamp (utility endpoint)
export const checkEnrollmentStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { bootcampId } = req.params;
    const studentId = req.user!._id;

    const enrollment = await Enrollment.findOne({
      student: studentId,
      bootcamp: bootcampId,
    });

    res.status(200).json({
      status: "success",
      data: {
        isEnrolled: !!enrollment,
        status: enrollment?.status || null,
      },
    });
  } catch (error) {
    next(error);
  }
};