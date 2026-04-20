import mongoose from "mongoose";
import type { ITask } from "../types/types.js";

const taskSchema = new mongoose.Schema<ITask>({
	title: { type: String, required: true },
	description: { type: String, required: true },
	deadline: { type: Date, required: true },
	division: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Division",
		required: true,
	},
	session: { type: mongoose.Schema.Types.ObjectId, ref: "Session" },
	status: { type: String, enum: ["active", "inactive"], default: "active" },
	allowedTypes: [{ type: String, enum: ["file", "github", "text"] }],
	allowLateSubmission: { type: Boolean, default: false },
	maxScore: { type: Number, default: 100 },
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

const Task = mongoose.model<ITask>("Task", taskSchema);

export default Task;
