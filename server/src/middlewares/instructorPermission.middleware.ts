import type { Request, Response, NextFunction } from "express";
import InstructorAssignment from "../models/instructorAssignment.model.js";
import Session from "../models/session.model.js";
import Task from "../models/task.model.js";
import AppError from "../utils/appError.js";

type Permission =
  | "manage_attendance"
  | "upload_resources"
  | "create_tasks"
  | "grade_submissions"
  | "view_feedback";

/**
 * Middleware to check if an instructor has a specific permission for a bootcamp
 * @param permission - The permission to check
 * @param bootcampSource - Where to get the bootcamp ID from: 'body', 'params', 'query', or 'session', 'task'
 */
export const checkInstructorPermission = (
  permission: Permission,
  bootcampSource: "body" | "params" | "query" | "session" | "task" = "body"
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Super admins and division admins bypass this check
    const isSuperAdmin = req.user!.roles.includes("super_admin");
    const isDivisionAdmin = req.user!.roles.includes("division_admin") || req.user!.memberships.some(m => m.role === "division_admin");

    if (isSuperAdmin || isDivisionAdmin) {
      return next();
    }

    // Get bootcamp ID based on source
    let bootcampId: string | undefined;

    if (bootcampSource === "session") {
      // Get bootcamp from session
      const sessionId = req.body.session || req.params.sessionId || req.query.session;
      if (!sessionId) {
        return next(
          new AppError("Session ID is required", 400, { session: "Required" })
        );
      }
      const session = await Session.findById(sessionId).select("bootcamp");
      if (!session) {
        return next(new AppError("Session not found", 404, { session: "Not found" }));
      }
      bootcampId = session.bootcamp.toString();
    } else if (bootcampSource === "task") {
      // Get bootcamp from task
      const taskId = req.body.task || req.params.taskId || req.query.task;
      if (!taskId) {
        return next(new AppError("Task ID is required", 400, { task: "Required" }));
      }
      const task = await Task.findById(taskId).select("bootcamp");
      if (!task) {
        return next(new AppError("Task not found", 404, { task: "Not found" }));
      }
      bootcampId = task.bootcamp.toString();
    } else {
      // Get bootcamp directly from request
      bootcampId =
        req[bootcampSource as "body" | "params" | "query"]?.bootcamp ||
        req[bootcampSource as "body" | "params" | "query"]?.bootcampId;
    }

    if (!bootcampId) {
      return next(
        new AppError("Bootcamp ID is required", 400, { bootcamp: "Required" })
      );
    }

    // Find active assignment for this instructor and bootcamp
    const now = new Date();
    const assignment = await InstructorAssignment.findOne({
      instructor: req.user!._id,
      bootcamp: bootcampId,
      status: "active",
      startDate: { $lte: now },
      endDate: { $gte: now },
    });

    if (!assignment) {
      return next(
        new AppError(
          "You do not have an active instructor assignment for this bootcamp",
          403,
          {}
        )
      );
    }

    // Check if instructor has the specific permission
    if (!assignment.permissions.includes(permission)) {
      return next(
        new AppError(
          `You do not have permission to ${permission.replace(/_/g, " ")}`,
          403,
          { permission: "Denied" }
        )
      );
    }

    // Store assignment in request for later use
    req.instructorAssignment = assignment;

    next();
  }
};

/**
 * Middleware to check if instructor's permission is still valid for task-related actions
 * For tasks, the permission should be valid until the task deadline
 */
export const checkTaskPermissionValidity = async (req: Request, res: Response, next: NextFunction) => {
  const taskId = req.body.task || req.params.taskId || req.query.task;

  if (!taskId) {
    return next(new AppError("Task ID is required", 400, { task: "Required" }));
  }

  const task = await Task.findById(taskId).select("deadline bootcamp");
  if (!task) {
    return next(new AppError("Task not found", 404, { task: "Not found" }));
  }

  // Check if current date is within task deadline
  const now = new Date();
  if (now > task.deadline) {
    return next(
      new AppError(
        "Task deadline has passed. You can no longer perform this action",
        403,
        { deadline: "Expired" }
      )
    );
  }

  next();
}


declare global {
  namespace Express {
    interface Request {
      instructorAssignment?: any;
    }
  }
}
