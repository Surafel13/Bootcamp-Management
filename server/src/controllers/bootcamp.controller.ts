import { Request, Response } from "express";
import User from "../models/user.model.js";
import Bootcamp from "../models/bootcamp.model.js";
import Session from "../models/session.model.js";
import Enrollment from "../models/enrollment.model.js";
import Task from "../models/task.model.js";
import Resource from "../models/resource.model.js";
import Group from "../models/group.model.js";
import InstructorAssignment from "../models/instructorAssignment.model.js";
import Notification from "../models/notification.model.js";
import { validateBootcamp, validateInstructorAssignment } from "../validators/bootcamp.validator.js";
import logger from "../utils/logger.js";


export const createBootcamp = async (req: Request, res: Response) => {
  const validationResult = validateBootcamp(req.body);

  if (!validationResult.success) {
    console.log("debug", validationResult.error.issues);
    return res.status(400).json({
      status: "error",
      message: "Validation failed",
      errors: validationResult.error.issues.map(err => ({
        field: err.path.join("."),
        message: err.message
      }))
    });
  }

  const { name, description, duration, startDate, endDate, enrollmentDeadline, instructor, division, creator } = validationResult.data;

  try {
    const bootcamp = await Bootcamp.create({
      name,
      description,
      duration,
      startDate,
      endDate,
      enrollmentDeadline,
      instructor,
      division,
      creator,
    });

    const students = await User.find({
      "memberships.division": division,
      "memberships.role": "student",
      status: "active"
    });

    await Notification.insertMany(
      students.map(user => ({
        user: user._id,
        message: `New bootcamp "${name}" is now open for enrollment! Deadline: ${new Date(enrollmentDeadline).toLocaleDateString()}`,
        type: "general",
      }))
    );

    res.status(201).json({
      status: "success",
      data: { bootcamp }
    });
  } catch (error) {
    logger.error("Error creating bootcamp:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getBootcamp = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const bootcamp = await Bootcamp.findById(id);

    if (!bootcamp) {
      res.status(404).json({ message: "Bootcamp not found" });
      return;
    }

    res.status(200).json(bootcamp);
  } catch (error) {
    logger.error("Error getting bootcamp:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getBootcamps = async (req: Request, res: Response) => {
  const { search, status, division, page = 1, limit = 10 } = req.query;
  const filter: Record<string, any> = {};

  // Search by name or description
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  // Filter by status
  if (status) {
    filter.status = status;
  }

  // Extract division IDs from memberships
  const userDivisions = req.user!.memberships?.map(m => m.division) || [];
  const isSuperAdmin = req.user!.roles.includes("super_admin");

  if (isSuperAdmin) {
    if (division) filter.division = division;
  } else {
    // Use the divisions from memberships
    if (userDivisions.length > 0) {
      filter.division = { $in: userDivisions };
    }
    // If user has no divisions, they shouldn't see any bootcamps
    // The filter with empty array will return no results, which is correct
  }

  try {
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const bootcamps = await Bootcamp.find(filter)
      .populate("division", "name")
      .populate("instructor", "name email")
      .populate("creator", "name")
      .sort("-createdAt")
      .skip(skip)
      .limit(limitNum);

    const total = await Bootcamp.countDocuments(filter);

    // Add counts for each bootcamp
    const bootcampsWithCounts = await Promise.all(
      bootcamps.map(async (bootcamp) => {
        const [sessionsCount, enrollmentsCount, tasksCount] = await Promise.all([
          Session.countDocuments({ bootcamp: bootcamp._id }),
          Enrollment.countDocuments({ bootcamp: bootcamp._id }),
          Task.countDocuments({ bootcamp: bootcamp._id }),
        ]);

        return {
          ...bootcamp.toObject(),
          currentStatus: bootcamp.getStatus ? bootcamp.getStatus() : bootcamp.status,
          counts: {
            sessions: sessionsCount,
            students: enrollmentsCount,
            tasks: tasksCount,
          },
        };
      })
    );

    res.status(200).json({
      status: "success",
      results: bootcampsWithCounts.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      data: { bootcamps: bootcampsWithCounts },
    });
  } catch (error) {
    logger.error("Error getting bootcamps:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateBootcamp = async (req: Request, res: Response) => {
  const { id } = req.params;

  const validationResult = validateBootcamp(req.body);

  if (!validationResult.success) {
    return res.status(400).json({
      status: "error",
      message: "Validation failed",
      errors: validationResult.error.issues.map(err => ({
        field: err.path.join("."),
        message: err.message
      }))
    });
  }

  const { name, description, duration, startDate, endDate, enrollmentDeadline, instructor, division } = validationResult.data;

  try {
    const bootcamp = await Bootcamp.findByIdAndUpdate(
      id,
      { name, description, duration, startDate, endDate, enrollmentDeadline, instructor, division },
      { new: true }
    );

    res.status(200).json(bootcamp);
  } catch (error) {
    logger.error("Error updating bootcamp:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get bootcamp detail with overview
export const getBootcampDetail = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const bootcamp = await Bootcamp.findById(id)
      .populate("division", "name description")
      .populate("instructor", "name email")
      .populate("creator", "name");

    if (!bootcamp) {
      return res.status(404).json({ message: "Bootcamp not found" });
    }

    // Get counts and statistics
    const [
      sessionsCount,
      enrollmentsCount,
      tasksCount,
      resourcesCount,
      groupsCount,
      instructorAssignments,
      sessions,
      enrollments,
    ] = await Promise.all([
      Session.countDocuments({ bootcamp: id }),
      Enrollment.countDocuments({ bootcamp: id }),
      Task.countDocuments({ bootcamp: id }),
      Resource.countDocuments({ bootcamp: id }),
      Group.countDocuments({ bootcamp: id }),
      InstructorAssignment.find({ bootcamp: id, status: "active" })
        .populate("instructor", "name email")
        .select("instructor permissions startDate endDate"),
      Session.find({ bootcamp: id }).select("status"),
      Enrollment.find({ bootcamp: id }).select("status"),
    ]);

    // Calculate statistics
    const upcomingSessions = sessions.filter(s => s.status === "upcoming").length;
    const completedSessions = sessions.filter(s => s.status === "completed").length;
    const activeEnrollments = enrollments.filter(e => e.status === "active").length;

    const bootcampDetail = {
      ...bootcamp.toObject(),
      currentStatus: bootcamp.getStatus ? bootcamp.getStatus() : bootcamp.status,
      counts: {
        sessions: sessionsCount,
        students: enrollmentsCount,
        tasks: tasksCount,
        resources: resourcesCount,
        groups: groupsCount,
        instructors: instructorAssignments.length,
      },
      statistics: {
        upcomingSessions,
        completedSessions,
        activeEnrollments,
      },
      instructorAssignments,
    };

    res.status(200).json({
      status: "success",
      data: { bootcamp: bootcampDetail },
    });
  } catch (error) {
    logger.error("Error getting bootcamp detail:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all sessions for a bootcamp
export const getBootcampSessions = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const sessions = await Session.find({ bootcamp: id })
      .populate("instructor", "name email")
      .populate("division", "name")
      .sort("startTime");

    res.status(200).json({
      status: "success",
      results: sessions.length,
      data: { sessions },
    });
  } catch (error) {
    logger.error("Error getting bootcamp sessions:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all resources for a bootcamp
export const getBootcampResources = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const resources = await Resource.find({ bootcamp: id })
      .populate("uploadedBy", "name")
      .populate("session", "title startTime")
      .sort("-createdAt");

    const resourcesWithContext = resources.map((resource) => ({
      ...resource.toObject(),
      purpose: resource.session ? "session-specific" : "bootcamp-general",
    }));

    res.status(200).json({
      status: "success",
      results: resourcesWithContext.length,
      data: { resources: resourcesWithContext },
    });
  } catch (error) {
    logger.error("Error getting bootcamp resources:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all groups for a bootcamp
export const getBootcampGroups = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const groups = await Group.find({ bootcamp: id })
      .populate("members", "name email")
      .populate("createdBy", "name")
      .sort("name");

    res.status(200).json({
      status: "success",
      results: groups.length,
      data: { groups },
    });
  } catch (error) {
    logger.error("Error getting bootcamp groups:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all tasks for a bootcamp
export const getBootcampTasks = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const tasks = await Task.find({ bootcamp: id })
      .populate("session", "title startTime")
      .sort("-createdAt");

    res.status(200).json({
      status: "success",
      results: tasks.length,
      data: { tasks },
    });
  } catch (error) {
    logger.error("Error getting bootcamp tasks:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all enrollments for a bootcamp
export const getBootcampEnrollments = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const enrollments = await Enrollment.find({ bootcamp: id })
      .populate("student", "name email status")
      .sort("-createdAt");

    res.status(200).json({
      status: "success",
      results: enrollments.length,
      data: { enrollments },
    });
  } catch (error) {
    logger.error("Error getting bootcamp enrollments:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get bootcamp statistics
export const getBootcampStatistics = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const bootcamp = await Bootcamp.findById(id);
    if (!bootcamp) {
      return res.status(404).json({ message: "Bootcamp not found" });
    }

    const [sessions, enrollments, tasks, submissions, attendances] = await Promise.all([
      Session.find({ bootcamp: id }),
      Enrollment.find({ bootcamp: id }),
      Task.find({ bootcamp: id }),
      // Get submissions for tasks in this bootcamp
      Task.find({ bootcamp: id }).then(tasks => {
        const taskIds = tasks.map(t => t._id);
        return require("../models/submission.model.js").default.find({ task: { $in: taskIds } });
      }),
      // Get attendances for sessions in this bootcamp
      Session.find({ bootcamp: id }).then(sessions => {
        const sessionIds = sessions.map(s => s._id);
        return require("../models/attendance.model.js").default.find({ session: { $in: sessionIds } });
      }),
    ]);

    const statistics = {
      overview: {
        totalSessions: sessions.length,
        upcomingSessions: sessions.filter((s: any) => s.status === "upcoming").length,
        ongoingSessions: sessions.filter((s: any) => s.status === "active").length,
        completedSessions: sessions.filter((s: any) => s.status === "completed").length,
        totalStudents: enrollments.length,
        activeStudents: enrollments.filter((e: any) => e.status === "active").length,
        totalTasks: tasks.length,
      },
      attendance: {
        totalRecords: attendances.length,
        present: attendances.filter((a: any) => a.status === "present").length,
        late: attendances.filter((a: any) => a.status === "late").length,
        absent: attendances.filter((a: any) => a.status === "absent").length,
        attendanceRate: attendances.length > 0
          ? ((attendances.filter((a: any) => a.status === "present" || a.status === "late").length / attendances.length) * 100).toFixed(2)
          : 0,
      },
      tasks: {
        totalSubmissions: submissions.length,
        graded: submissions.filter((s: any) => s.status === "graded").length,
        pending: submissions.filter((s: any) => s.status === "submitted").length,
        completionRate: tasks.length > 0 && enrollments.length > 0
          ? ((submissions.length / (tasks.length * enrollments.length)) * 100).toFixed(2)
          : 0,
      },
    };

    res.status(200).json({
      status: "success",
      data: { statistics },
    });
  } catch (error) {
    logger.error("Error getting bootcamp statistics:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createInstructorAssignment = async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const validationResult = validateInstructorAssignment(req.body);

  if (!validationResult.success) {
    return res.status(400).json({
      status: "error",
      message: "Validation failed",
      errors: validationResult.error.issues.map(err => ({
        field: err.path.join("."),
        message: err.message
      }))
    });
  }

  const { startDate, endDate, permissions, instructor } = validationResult.data;

  try {
    const bootcamp = await Bootcamp.findById(id);
    if (!bootcamp) {
      return res.status(404).json({ message: "Bootcamp not found" });
    }

    // Make sure assignedBy comes from the authenticated user
    const assignedBy = req.user?._id;
    if (!assignedBy) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const instructorAssignment = await InstructorAssignment.create({
      bootcamp: id,
      assignedBy, // This should be the authenticated user's ID
      startDate,
      endDate,
      permissions,
      instructor,
      status: "active"
    });

    res.status(201).json({
      status: "success",
      data: { instructorAssignment },
    });
  } catch (error) {
    logger.error("Error creating instructor assignment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get bootcamp instructors with proper population
export const getBootcampInstructors = async (req: Request, res: Response) => {
  const id = req.params.id as string;

  try {
    const assignments = await InstructorAssignment.find({ 
      bootcamp: id,
      status: "active"
    })
    .populate({
      path: "instructor",
      select: "name email role status"
    })
    .populate({
      path: "assignedBy", // Use assignedBy, not createdBy
      select: "name email"
    })
    .populate({
      path: "bootcamp",
      select: "name"
    });

    res.status(200).json({
      status: "success",
      data: { assignments }
    });
  } catch (error) {
    logger.error("Error getting bootcamp instructors:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update instructor assignment
export const updateInstructorAssignment = async (req: Request, res: Response) => {
  const { id, assignmentId } = req.params;

  try {
    const assignment = await InstructorAssignment.findOneAndUpdate(
      { 
        _id: assignmentId, 
        bootcamp: id,
        status: "active" 
      },
      { ...req.body },
      { new: true, runValidators: true }
    );

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    res.status(200).json({
      status: "success",
      data: { assignment }
    });
  } catch (error) {
    logger.error("Error updating instructor assignment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Revoke instructor assignment
export const revokeInstructorAssignment = async (req: Request, res: Response) => {
  const { id, assignmentId } = req.params;

  try {
    const assignment = await InstructorAssignment.findOneAndUpdate(
      { 
        _id: assignmentId, 
        bootcamp: id 
      },
      { 
        status: "revoked",
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    res.status(200).json({
      status: "success",
      message: "Instructor assignment revoked successfully"
    });
  } catch (error) {
    logger.error("Error revoking instructor assignment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteBootcamp = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const bootcamp = await Bootcamp.findByIdAndDelete(id);
    if (!bootcamp) {
      return res.status(404).json({ message: "Bootcamp not found" });
    }

    res.status(204).json({ status: "success", data: null });
  } catch (error) {
    logger.error("Error deleting bootcamp:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};