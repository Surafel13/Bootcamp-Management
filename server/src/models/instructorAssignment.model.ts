import mongoose from "mongoose";
import type { IInstructorAssignment } from "../types/types.js";

const instructorAssignmentSchema = new mongoose.Schema<IInstructorAssignment>(
  {
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bootcamp: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bootcamp",
      required: true,
    },
    permissions: {
      type: [String],
      enum: [
        "manage_attendance",
        "upload_resources",
        "create_tasks",
        "grade_submissions",
        "view_feedback",
      ],
      default: [],
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "expired", "revoked"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
instructorAssignmentSchema.index({ instructor: 1, bootcamp: 1 });
instructorAssignmentSchema.index({ bootcamp: 1, status: 1 });
instructorAssignmentSchema.index({ endDate: 1, status: 1 });

// Validate date range
instructorAssignmentSchema.path('endDate').validate(function (value) {
  return this.endDate > this.startDate;
}, 'End date must be after start date');

const InstructorAssignment = mongoose.model<IInstructorAssignment>(
  "InstructorAssignment",
  instructorAssignmentSchema
);

export default InstructorAssignment;
