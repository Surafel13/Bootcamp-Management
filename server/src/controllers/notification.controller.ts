// controllers/notification.controller.ts
import type { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import Bootcamp from "../models/bootcamp.model.js";
import Group from "../models/group.model.js";
import Enrollment from "../models/enrollment.model.js";
import AppError from "../utils/appError.js";

// Get all notifications for the logged-in user
export const getMyNotifications = async (req: Request, res: Response) => {
  const notifications = await Notification.find({ user: req.user!._id }).sort("-createdAt");
  const unreadCount = notifications.filter((n) => !n.read).length;

  res.status(200).json({
    status: "success",
    unreadCount,
    results: notifications.length,
    data: { notifications },
  });
};

// Mark a single notification as read
export const markAsRead = async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id as string;

  if (!id) {
    return next(new AppError("Notification ID required", 400));
  }

  const notification = await Notification.findOneAndUpdate(
    { _id: new Types.ObjectId(id), user: req.user!._id },
    { read: true },
    { new: true },
  );

  if (!notification) {
    return next(new AppError("Notification not found", 404));
  }

  res.status(200).json({ status: "success", data: { notification } });
};

// Mark all notifications as read
export const markAllAsRead = async (req: Request, res: Response) => {
  await Notification.updateMany({ user: req.user!._id, read: false }, { read: true });
  res.status(200).json({ status: "success", message: "All notifications marked as read" });
};

// ============ BROADCAST NOTIFICATIONS ============

interface BroadcastOptions {
  title: string;
  message: string;
  type?: string;
}

// Broadcast to all users in a division
export const broadcastToDivision = async (
  divisionId: string,
  options: BroadcastOptions,
  senderId: string
) => {
  const users = await User.find({
    "memberships.division": new Types.ObjectId(divisionId),
    status: "active",
  }).select("_id");

  const notifications = users.map(user => ({
    user: user._id,
    message: options.message,
    type: options.type || "broadcast",
    broadcastType: "division",
    broadcastAudience: { divisionId },
    createdAt: new Date(),
  }));

  if (notifications.length > 0) {
    await Notification.insertMany(notifications);
  }

  return notifications.length;
};

// Broadcast to specific role in a division
export const broadcastToDivisionRole = async (
  divisionId: string,
  role: string,
  options: BroadcastOptions,
  senderId: string
) => {
  const users = await User.find({
    "memberships.division": new Types.ObjectId(divisionId),
    "memberships.role": role,
    status: "active",
  }).select("_id");

  const notifications = users.map(user => ({
    user: user._id,
    message: options.message,
    type: options.type || "broadcast",
    broadcastType: "division",
    broadcastAudience: { divisionId, role },
    createdAt: new Date(),
  }));

  if (notifications.length > 0) {
    await Notification.insertMany(notifications);
  }

  return notifications.length;
};

// Broadcast to all users enrolled in a bootcamp (using Enrollment model)
export const broadcastToBootcamp = async (
  bootcampId: string,
  options: BroadcastOptions,
  senderId: string
) => {
  // Get all active enrollments for this bootcamp
  const enrollments = await Enrollment.find({
    bootcamp: new Types.ObjectId(bootcampId),
    status: "active",
  }).populate("student", "_id");

  if (!enrollments.length) {
    return 0;
  }

  const notifications = enrollments.map(enrollment => ({
    user: (enrollment.student as any)._id,
    message: options.message,
    type: options.type || "broadcast",
    broadcastType: "bootcamp",
    broadcastAudience: { bootcampId },
    createdAt: new Date(),
  }));

  if (notifications.length > 0) {
    await Notification.insertMany(notifications);
  }

  return notifications.length;
};

// Broadcast to bootcamp with specific enrollment status
export const broadcastToBootcampByStatus = async (
  bootcampId: string,
  status: "active" | "dropped" | "completed",
  options: BroadcastOptions,
  senderId: string
) => {
  const enrollments = await Enrollment.find({
    bootcamp: new Types.ObjectId(bootcampId),
    status: status,
  }).populate("student", "_id");

  if (!enrollments.length) {
    return 0;
  }

  const notifications = enrollments.map(enrollment => ({
    user: (enrollment.student as any)._id,
    message: options.message,
    type: options.type || "broadcast",
    broadcastType: "bootcamp",
    broadcastAudience: { bootcampId, enrollmentStatus: status },
    createdAt: new Date(),
  }));

  if (notifications.length > 0) {
    await Notification.insertMany(notifications);
  }

  return notifications.length;
};

// Broadcast to specific group
export const broadcastToGroup = async (
  groupId: string,
  options: BroadcastOptions,
  senderId: string
) => {
  const group = await Group.findById(groupId).populate("members", "_id");

  if (!group) {
    throw new Error("Group not found");
  }

  const notifications = group.members.map((member: any) => ({
    user: member._id,
    message: options.message,
    type: options.type || "broadcast",
    broadcastType: "group",
    broadcastAudience: { groupId },
    createdAt: new Date(),
  }));

  if (notifications.length > 0) {
    await Notification.insertMany(notifications);
  }

  return notifications.length;
};

// Broadcast to specific user
export const broadcastToUser = async (
  userId: string,
  options: BroadcastOptions,
  senderId: string
) => {
  const notification = await Notification.create({
    user: userId,
    message: options.message,
    type: options.type || "broadcast",
    broadcastType: "single",
    createdAt: new Date(),
  });

  return 1;
};

// Send notification to multiple users
export const sendBulkNotifications = async (
  userIds: string[],
  options: BroadcastOptions,
  senderId: string
) => {
  const notifications = userIds.map(userId => ({
    user: userId,
    message: options.message,
    type: options.type || "broadcast",
    broadcastType: "bulk",
    createdAt: new Date(),
  }));

  if (notifications.length > 0) {
    await Notification.insertMany(notifications);
  }

  return notifications.length;
};

// ============ CONTROLLERS FOR API ENDPOINTS ============

// Broadcast to division (Admin only)
export const broadcastToDivisionAPI = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { divisionId, role, title, message, type } = req.body;

    if (!divisionId || !message) {
      return next(new AppError("Division ID and message are required", 400));
    }

    // Check if user has permission for this division
    const isSuperAdmin = req.user!.roles.includes("super_admin");
    const isDivisionAdmin = req.user!.roles.includes("division_admin");
    
    const userHasAccess = isSuperAdmin || (isDivisionAdmin && 
      req.user!.memberships.some(m => m.division.toString() === divisionId));

    if (!userHasAccess) {
      return next(new AppError("You don't have permission to broadcast to this division", 403));
    }

    let count;
    if (role) {
      count = await broadcastToDivisionRole(divisionId, role, { title, message, type }, req.user!._id.toString());
    } else {
      count = await broadcastToDivision(divisionId, { title, message, type }, req.user!._id.toString());
    }

    res.status(200).json({
      status: "success",
      message: `Broadcast sent to ${count} users`,
      data: { recipients: count },
    });
  } catch (error) {
    next(error);
  }
};

// Broadcast to bootcamp (Admin only)
export const broadcastToBootcampAPI = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { bootcampId, status, title, message, type } = req.body;

    if (!bootcampId || !message) {
      return next(new AppError("Bootcamp ID and message are required", 400));
    }

    let count;
    if (status && ["active", "dropped", "completed"].includes(status)) {
      // Broadcast to specific enrollment status
      count = await broadcastToBootcampByStatus(bootcampId, status, { title, message, type }, req.user!._id.toString());
    } else {
      // Broadcast to all active enrollments
      count = await broadcastToBootcamp(bootcampId, { title, message, type }, req.user!._id.toString());
    }

    res.status(200).json({
      status: "success",
      message: `Broadcast sent to ${count} users`,
      data: { recipients: count },
    });
  } catch (error) {
    next(error);
  }
};

// Broadcast to group (Admin only)
export const broadcastToGroupAPI = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { groupId, title, message, type } = req.body;

    if (!groupId || !message) {
      return next(new AppError("Group ID and message are required", 400));
    }

    const count = await broadcastToGroup(groupId, { title, message, type }, req.user!._id.toString());

    res.status(200).json({
      status: "success",
      message: `Broadcast sent to ${count} users`,
      data: { recipients: count },
    });
  } catch (error) {
    next(error);
  }
};

// Send notification to specific user (Admin only)
export const sendNotificationToUserAPI = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, title, message, type } = req.body;

    if (!userId || !message) {
      return next(new AppError("User ID and message are required", 400));
    }

    const count = await broadcastToUser(userId, { title, message, type }, req.user!._id.toString());

    res.status(200).json({
      status: "success",
      message: "Notification sent",
      data: { recipients: count },
    });
  } catch (error) {
    next(error);
  }
};

// Send bulk notifications to multiple users
export const sendBulkNotificationsAPI = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userIds, title, message, type } = req.body;

    if (!userIds || !userIds.length || !message) {
      return next(new AppError("User IDs list and message are required", 400));
    }

    const count = await sendBulkNotifications(userIds, { title, message, type }, req.user!._id.toString());

    res.status(200).json({
      status: "success",
      message: `Notifications sent to ${count} users`,
      data: { recipients: count },
    });
  } catch (error) {
    next(error);
  }
};

// Get bootcamp enrolled students for preview (Admin only)
export const getBootcampEnrolledStudents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { bootcampId, status } = req.query;

    if (!bootcampId) {
      return next(new AppError("Bootcamp ID is required", 400));
    }

    const filter: any = { bootcamp: new Types.ObjectId(bootcampId as string) };
    if (status && ["active", "dropped", "completed"].includes(status as string)) {
      filter.status = status;
    }

    const enrollments = await Enrollment.find(filter)
      .populate("student", "name email")
      .populate("bootcamp", "name");

    res.status(200).json({
      status: "success",
      results: enrollments.length,
      data: { students: enrollments.map(e => e.student) },
    });
  } catch (error) {
    next(error);
  }
};