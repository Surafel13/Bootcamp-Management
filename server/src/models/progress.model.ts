import mongoose from "mongoose";
import type { IProgress } from "../types/types.js";

const progressSchema = new mongoose.Schema<IProgress>({
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
	title: { type: String, required: true },
	description: {
		type: String,
		required: true,
		minlength: [50, "Description must be at least 50 characters"],
	},
	fileUrl: String,
	link: String,
	weekNumber: { type: Number, required: true },
	year: { type: Number, required: true },
	createdAt: { type: Date, default: Date.now },
});

// One submission per group per week per year
progressSchema.index({ group: 1, weekNumber: 1, year: 1 }, { unique: true });

const Progress = mongoose.model<IProgress>("Progress", progressSchema);

export default Progress;
