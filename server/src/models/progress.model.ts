// models/progress.model.ts
import mongoose from "mongoose";
import type { IProgress } from "../types/types.js";

const progressSchema = new mongoose.Schema<IProgress>(
  {
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      minlength: 50,
    },
    fileUrl: { type: String },
    link: { type: String },
    weekNumber: {
      type: Number,
      required: true,
      min: 1,
      max: 53,
    },
    year: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["submitted", "reviewed"],
      default: "submitted",
    },
    feedback: { type: String },
    score: {
      type: Number,
      min: 0,
      max: 100,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

// Ensure one progress per group per week
progressSchema.index({ group: 1, weekNumber: 1, year: 1 }, { unique: true });

const Progress = mongoose.model<IProgress>("Progress", progressSchema);

export default Progress;