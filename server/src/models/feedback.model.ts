import mongoose from "mongoose";
import type { IFeedback } from "../types/types.js";

const feedbackSchema = new mongoose.Schema<IFeedback>({
	session: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Session",
		required: true,
	},
	student: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	rating: { type: Number, required: true, min: 1, max: 5 },
	comment: String,
	createdAt: { type: Date, default: Date.now },
});

// One feedback per student per session
feedbackSchema.index({ session: 1, student: 1 }, { unique: true });

const Feedback = mongoose.model<IFeedback>("Feedback", feedbackSchema);

export default Feedback;
