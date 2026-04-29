import mongoose from "mongoose";
import type { ISubmission } from "../types/types.js";

const submissionSchema = new mongoose.Schema<ISubmission>({
	student: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	task: { type: mongoose.Schema.Types.ObjectId, ref: "Task", required: true },
	fileUrl: String,
	githubLink: String,
	text: String,
	version: { type: Number, default: 1 },
	status: {
		type: String,
		enum: ["submitted", "graded", "returned"],
		default: "submitted",
	},
	score: { type: Number, min: 0, max: 100 },
	feedback: String,
	submittedAt: { type: Date, default: Date.now },
});

const Submission = mongoose.model<ISubmission>("Submission", submissionSchema);

export default Submission;
