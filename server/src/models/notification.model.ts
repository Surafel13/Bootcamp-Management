import mongoose from "mongoose";
import type { INotification } from "../types/types.js";

const notificationSchema = new mongoose.Schema<INotification>({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: ["system", "session", "task", "resource", "broadcast", "reminder", "enrollment", "general"],
    default: "system" 
  },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  // For broadcast notifications
  broadcastType: {
    type: String,
    enum: ["division", "bootcamp", "all", "single", "enrollment", "general"],
    required: false,
  },
  broadcastAudience: {
    divisionId: { type: mongoose.Schema.Types.ObjectId, ref: "Division" },
    bootcampId: { type: mongoose.Schema.Types.ObjectId, ref: "Bootcamp" },
    role: { type: String, enum: ["division_admin", "student"] },
  },
});

// Index for faster queries
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, read: 1 });

const Notification = mongoose.model<INotification>("Notification", notificationSchema);

export default Notification;