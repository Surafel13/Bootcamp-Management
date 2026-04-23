import mongoose from "mongoose";
import type { IResource } from "../types/types.js";

const resourceSchema = new mongoose.Schema<IResource>({
	title: { type: String, required: true },
	description: String,
	fileUrl: String,
	externalLink: String,
	type: {
		type: String,
		enum: ["pdf", "video", "image", "zip", "link"],
		required: true,
	},
	session: { type: mongoose.Schema.Types.ObjectId, ref: "Session" },
	uploadedBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	downloads: { type: Number, default: 0 },
	createdAt: { type: Date, default: Date.now },
});

const Resource = mongoose.model<IResource>("Resource", resourceSchema);

export default Resource;
