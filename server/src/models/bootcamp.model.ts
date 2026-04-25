import mongoose from 'mongoose';
import type { IBootcamp } from "../types/types.js";

const bootcampSchema = new mongoose.Schema<IBootcamp>({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  duration: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  enrollmentDeadline: {
    type: Date,
    required: true,
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  division: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Division",
    required: true,
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ["upcoming", "ongoing", "completed"],
    default: "upcoming",
  },
});

// Method to calculate current status based on dates
bootcampSchema.methods.getStatus = function() {
  const now = new Date();
  if (now < this.startDate) {
    return "upcoming";
  } else if (now >= this.startDate && now <= this.endDate) {
    return "ongoing";
  } else {
    return "completed";
  }
};

// Virtual field for current status
bootcampSchema.virtual('currentStatus').get(function() {
  const now = new Date();
  if (now < this.startDate) {
    return "upcoming";
  } else if (now >= this.startDate && now <= this.endDate) {
    return "ongoing";
  } else {
    return "completed";
  }
});

export default mongoose.model<IBootcamp>("Bootcamp", bootcampSchema);
