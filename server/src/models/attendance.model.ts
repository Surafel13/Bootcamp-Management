import mongoose from "mongoose";
import type { IAttendance } from "../types/types.js";

const attendanceSchema = new mongoose.Schema<IAttendance>(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: true,
    },
    status: {
      type: String,
      enum: ["present", "absent", "late", "excused"],
      default: "present",
    },
    markedAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    note: { type: String },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    qrToken: { type: String },
  },
  { timestamps: true }
);

// Ensure one attendance record per student per session
attendanceSchema.index({ student: 1, session: 1 }, { unique: true });

const Attendance = mongoose.model<IAttendance>("Attendance", attendanceSchema);

export default Attendance;
