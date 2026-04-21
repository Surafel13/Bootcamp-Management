import mongoose from "mongoose";
import type { ISession } from "../types/types.js";

const sessionSchema = new mongoose.Schema<ISession>({
	title: { type: String, required: true },
	description: String,
	location: String,
	onlineLink: String,
	startTime: { type: Date, required: true },
	endTime: { type: Date, required: true },
	instructor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
	division: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Division",
		required: true,
	},
	status: { type: String, enum: ["upcoming", "active", "completed", "cancelled"], default: "upcoming" },
	qrGenerationCount: { type: Number, default: 0 },
	createdAt: { type: Date, default: Date.now },
});

const Session = mongoose.model<ISession>("Session", sessionSchema);

export default Session;
