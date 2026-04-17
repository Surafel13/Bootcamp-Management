import mongoose from "mongoose";
import type { ITask } from "../types/types.js";

const taskSchema = new mongoose.Schema<ITask>({
	title: { type: String, required: true },
	description: String,
	deadline: { type: Date, required: true },
	division: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Division",
		required: true,
	},
	session: { type: mongoose.Schema.Types.ObjectId, ref: "Session" },
	allowedTypes: [{ type: String, enum: ["file", "github", "text"] }],
	allowLateSubmission: { type: Boolean, default: false },
	createdAt: { type: Date, default: Date.now },
});

const Task = mongoose.model<ITask>("Task", taskSchema);

export default Task;
