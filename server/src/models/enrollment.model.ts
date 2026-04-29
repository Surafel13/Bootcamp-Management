import mongoose from "mongoose";
import type { IEnrollment } from "../types/types.js";

const enrollmentSchema = new mongoose.Schema<IEnrollment>({
	student: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	bootcamp: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Bootcamp",
		required: true,
	},
	status: { type: String, enum: ["active", "dropped", "completed"], default: "active" },
	createdAt: { type: Date, default: Date.now },
});

const Enrollment = mongoose.model<IEnrollment>("Enrollment", enrollmentSchema);

export default Enrollment;
