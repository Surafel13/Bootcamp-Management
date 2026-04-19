import mongoose from "mongoose";
import type { IAnnouncement } from "../types/types.js";

const announcementSchema = new mongoose.Schema<IAnnouncement>({
	title: { type: String, required: true },
	content: { type: String, required: true },
	createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
	createdAt: { type: Date, default: Date.now },
});

const Announcement = mongoose.model<IAnnouncement>("Announcement", announcementSchema);

export default Announcement;