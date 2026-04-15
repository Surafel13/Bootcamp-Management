import mongoose from "mongoose";
import type { ISession } from "../types/types.js";
import AppError from "../utils/appError.js";

const sessionSchema = new mongoose.Schema<ISession>({
	startTime: { type: Date, require: true },
	endTime: { type: Date, require: true },
	division: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Division",
		required: true,
	},
	status: { type: String, enum: ["active", "inactive"] },
	createdAt: { type: Date, default: Date.now() },
});

const Session = mongoose.model<ISession>("Session", sessionSchema);

// This runs every time .save() is called
sessionSchema.pre("save", async function () {
	const overlapping = await Session.findOne({
		division: this.division,
		_id: { $ne: this._id }, // Don't check the session against itself (important for updates)
		$or: [
			{ startTime: { $lt: this.endTime }, endTime: { $gt: this.startTime } },
		],
	});

	if (overlapping) {
		new AppError(
			"Overlap detected: This division already has a session scheduled at this time.",
			400,
			{
				schedule: "Session time overlaps with existing one",
			},
		);
	}
});

export default Session;
