import type { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import Feedback from "../models/feedback.model.js";
import Group from "../models/group.model.js";
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import Bootcamp from "../models/bootcamp.model.js";
import Enrollment from "../models/enrollment.model.js";
import AppError from "../utils/appError.js";
import Progress from "../models/progress.model.js";

// Helper: get ISO week number
function getISOWeek(date: Date): { week: number; year: number } {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return { week, year: d.getUTCFullYear() };
}

// Helper to check if user has access to group's bootcamp/division
const hasGroupAccess = async (userId: mongoose.Types.ObjectId, groupId: string): Promise<boolean> => {
  const group = await Group.findById(groupId).populate({
    path: "bootcamp",
    populate: { path: "division" }
  });
  
  if (!group) return false;
  
  const user = await User.findById(userId);
  if (!user) return false;
  
  // Super admin has access
  if (user.roles.includes("super_admin")) return true;
  
  // Division admin check
  if (user.roles.includes("division_admin")) {
    const bootcamp = group.bootcamp as any;
    return user.memberships.some(
      (m) => m.division.toString() === bootcamp.division._id.toString()
    );
  }
  
  // Student check - must be member of group
  if (user.roles.includes("student")) {
    return group.members.some((m) => m.toString() === userId.toString());
  }
  
  return false;
};

// Submit weekly group progress
export const submitProgress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { group: groupId, title, description, fileUrl, link } = req.body;

    if (!groupId) {
      return next(new AppError("Group ID is required", 400));
    }
    
    if (!title || !description) {
      return next(new AppError("Title and description are required", 400));
    }
    
    if (description.length < 50) {
      return next(
        new AppError("Description must be at least 50 characters", 422)
      );
    }

    // Verify the student belongs to the group
    const group = await Group.findById(groupId).populate("bootcamp", "name division");
    if (!group) {
      return next(new AppError("Group not found", 404));
    }

    const isMember = group.members.some((m) => m.toString() === req.user!._id.toString());
    if (!isMember) {
      return next(new AppError("You are not a member of this group", 403));
    }

    // Check if student is enrolled in the bootcamp
    const enrollment = await Enrollment.findOne({
      student: req.user!._id,
      bootcamp: group.bootcamp,
      status: "active",
    });

    if (!enrollment) {
      return next(new AppError("You are not enrolled in the bootcamp for this group", 403));
    }

    const { week: weekNumber, year } = getISOWeek(new Date());

    // Check if progress already submitted for this week
    const existingProgress = await Progress.findOne({
      group: groupId,
      weekNumber,
      year,
    });

    if (existingProgress) {
      return next(new AppError(`Progress for week ${weekNumber} has already been submitted`, 409));
    }

    const progress = await Progress.create({
      group: groupId,
      submittedBy: req.user!._id,
      title,
      description,
      fileUrl: fileUrl || null,
      link: link || null,
      weekNumber,
      year,
      status: "submitted",
    });

    // Notify instructors/admins about new progress
    const bootcamp = group.bootcamp as any;
    const instructors = await User.find({
      $or: [
        { roles: "division_admin", "memberships.division": bootcamp.division._id },
        { roles: "super_admin" },
      ],
    });

    for (const instructor of instructors) {
      await Notification.create({
        user: instructor._id,
        message: `New weekly progress submitted for group "${group.name}" - Week ${weekNumber}`,
        type: "progress",
      });
    }

    res.status(201).json({ 
      status: "success", 
      data: { 
        progress: {
          _id: progress._id,
          title: progress.title,
          weekNumber: progress.weekNumber,
          year: progress.year,
          status: progress.status,
          createdAt: progress.createdAt,
        }
      } 
    });
  } catch (error) {
    next(error);
  }
};

// Update progress (student can update their own progress within same week)
export const updateProgress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { title, description, fileUrl, link } = req.body;

    const progress = await Progress.findById(id).populate("group");
    if (!progress) {
      return next(new AppError("Progress record not found", 404));
    }

    // Check if user submitted this progress
    if (progress.submittedBy.toString() !== req.user!._id.toString()) {
      return next(new AppError("You don't have permission to update this progress", 403));
    }

    // Check if still within same week
    const { week: currentWeek, year: currentYear } = getISOWeek(new Date());
    if (progress.weekNumber !== currentWeek || progress.year !== currentYear) {
      return next(new AppError("Progress can only be updated during the same week", 422));
    }

    // Check if already reviewed
    if (progress.status === "reviewed") {
      return next(new AppError("Cannot update progress that has already been reviewed", 422));
    }

    if (title) progress.title = title;
    if (description) {
      if (description.length < 50) {
        return next(new AppError("Description must be at least 50 characters", 422));
      }
      progress.description = description;
    }
    if (fileUrl !== undefined) progress.fileUrl = fileUrl;
    if (link !== undefined) progress.link = link;
    
    progress.updatedAt = new Date();
    await progress.save();

    res.status(200).json({ 
      status: "success", 
      data: { progress } 
    });
  } catch (error) {
    next(error);
  }
};

// Review progress (admin/instructor)
export const reviewProgress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { feedback, score, status } = req.body;

    const progress = await Progress.findById(id)
      .populate("group")
      .populate("submittedBy", "name email");

    if (!progress) {
      return next(new AppError("Progress record not found", 404));
    }

    // Check permission
    const hasAccess = await hasGroupAccess(req.user!._id, progress.group._id.toString());
    if (!hasAccess) {
      return next(new AppError("You don't have permission to review this progress", 403));
    }

    if (feedback) progress.feedback = feedback;
    if (score !== undefined) progress.score = score;
    progress.status = status || "reviewed";
    progress.reviewedAt = new Date();
    progress.reviewedBy = req.user!._id;

    await progress.save();

    // Notify student
    await Notification.create({
      user: progress.submittedBy._id,
      message: `Your weekly progress for "${progress.title}" has been reviewed. ${feedback ? `Feedback: ${feedback}` : ""}`,
      type: "progress",
    });

    res.status(200).json({ 
      status: "success", 
      data: { progress } 
    });
  } catch (error) {
    next(error);
  }
};

// Get all progress (admin only with division filtering)
export const getAllProgress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { group, week, year, bootcamp, status } = req.query;
    const filter: Record<string, any> = {};

    const user = req.user!;
    const isSuperAdmin = user.roles.includes("super_admin");
    const isDivisionAdmin = user.roles.includes("division_admin");

    if (group) filter.group = group;
    if (week) filter.weekNumber = Number(week);
    if (year) filter.year = Number(year);
    if (status) filter.status = status;

    // Division admin filtering
    if (isDivisionAdmin && !isSuperAdmin) {
      const userDivisionIds = user.memberships.map(m => m.division);
      
      // Find groups in admin's divisions
      const groups = await Group.find({
        division: { $in: userDivisionIds },
      }).select("_id");
      
      const groupIds = groups.map(g => g._id);
      
      if (groupIds.length === 0) {
        return res.status(200).json({
          status: "success",
          results: 0,
          data: { progress: [], stats: {} },
        });
      }
      
      filter.group = { $in: groupIds };
    }

    // Bootcamp filter
    if (bootcamp) {
      const groupsInBootcamp = await Group.find({ bootcamp }).select("_id");
      filter.group = { $in: groupsInBootcamp.map(g => g._id) };
    }

    const progressRecords = await Progress.find(filter)
      .populate("group", "name division bootcamp")
      .populate("submittedBy", "name email")
      .populate("reviewedBy", "name email")
      .sort("-year -weekNumber -createdAt");

    // Calculate stats
    const stats = {
      total: progressRecords.length,
      submitted: progressRecords.filter(p => p.status === "submitted").length,
      reviewed: progressRecords.filter(p => p.status === "reviewed").length,
      averageScore: progressRecords
        .filter(p => p.score !== undefined)
        .reduce((sum, p) => sum + (p.score || 0), 0) / (progressRecords.filter(p => p.score !== undefined).length || 1),
    };

    res.status(200).json({
      status: "success",
      results: progressRecords.length,
      data: { progress: progressRecords, stats },
    });
  } catch (error) {
    next(error);
  }
};

// Get progress by group
export const getProgressByGroup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const groupId = req.params.groupId as string;
    
    const group = await Group.findById(groupId);
    if (!group) {
      return next(new AppError("Group not found", 404));
    }

    // Check access
    const hasAccess = await hasGroupAccess(req.user!._id, groupId);
    if (!hasAccess) {
      return next(new AppError("You don't have access to this group's progress", 403));
    }

    const progressRecords = await Progress.find({ group: groupId })
      .populate("submittedBy", "name email")
      .populate("reviewedBy", "name email")
      .sort("-year -weekNumber");

    // Calculate group stats
    const stats = {
      totalWeeks: progressRecords.length,
      submittedWeeks: progressRecords.filter(p => p.status === "submitted").length,
      reviewedWeeks: progressRecords.filter(p => p.status === "reviewed").length,
      averageScore: progressRecords
        .filter(p => p.score !== undefined)
        .reduce((sum, p) => sum + (p.score || 0), 0) / (progressRecords.filter(p => p.score !== undefined).length || 1),
    };

    res.status(200).json({
      status: "success",
      results: progressRecords.length,
      data: { 
        group: { _id: group._id, name: group.name },
        progress: progressRecords,
        stats,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Student's own group progress submissions
export const getMyProgress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Find groups this student belongs to
    const groups = await Group.find({ members: req.user!._id }).select("_id name bootcamp");
    const groupIds = groups.map((g) => g._id);

    if (groupIds.length === 0) {
      return res.status(200).json({
        status: "success",
        results: 0,
        data: { progress: [], stats: {} },
      });
    }

    const progressRecords = await Progress.find({ group: { $in: groupIds } })
      .populate("group", "name division bootcamp")
      .populate("reviewedBy", "name email")
      .sort("-year -weekNumber");

    // Calculate student stats
    const stats = {
      total: progressRecords.length,
      reviewed: progressRecords.filter(p => p.status === "reviewed").length,
      pending: progressRecords.filter(p => p.status === "submitted").length,
      averageScore: progressRecords
        .filter(p => p.score !== undefined)
        .reduce((sum, p) => sum + (p.score || 0), 0) / (progressRecords.filter(p => p.score !== undefined).length || 1),
      weeksByGroup: groups.map(group => ({
        groupName: group.name,
        submissions: progressRecords.filter(p => p.group._id.toString() === group._id.toString()).length,
      })),
    };

    res.status(200).json({
      status: "success",
      results: progressRecords.length,
      data: { progress: progressRecords, stats },
    });
  } catch (error) {
    next(error);
  }
};

// Get weekly progress summary (admin)
export const getWeeklySummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { week, year, division } = req.query;
    const user = req.user!;
    
    let targetWeek = week ? Number(week) : getISOWeek(new Date()).week;
    let targetYear = year ? Number(year) : getISOWeek(new Date()).year;
    
    // Build division filter
    let divisionFilter: any = {};
    if (!user.roles.includes("super_admin")) {
      const userDivisionIds = user.memberships.map(m => m.division);
      if (division && !userDivisionIds.some(d => d.toString() === division)) {
        return next(new AppError("You don't have access to this division", 403));
      }
      divisionFilter = division 
        ? { division }
        : { division: { $in: userDivisionIds } };
    } else if (division) {
      divisionFilter = { division };
    }
    
    // Find groups in divisions
    const groups = await Group.find(divisionFilter).select("_id name");
    const groupIds = groups.map(g => g._id);
    
    // Get progress for the week
    const progressRecords = await Progress.find({
      group: { $in: groupIds },
      weekNumber: targetWeek,
      year: targetYear,
    }).populate("group", "name");
    
    const stats = {
      week: targetWeek,
      year: targetYear,
      totalGroups: groups.length,
      submittedCount: progressRecords.length,
      pendingCount: groups.length - progressRecords.length,
      submissionRate: groups.length > 0 
        ? Math.round((progressRecords.length / groups.length) * 100) 
        : 0,
      averageScore: progressRecords
        .filter(p => p.score !== undefined)
        .reduce((sum, p) => sum + (p.score || 0), 0) / (progressRecords.filter(p => p.score !== undefined).length || 1),
    };
    
    res.status(200).json({
      status: "success",
      data: {
        summary: stats,
        groups: progressRecords,
      },
    });
  } catch (error) {
    next(error);
  }
};