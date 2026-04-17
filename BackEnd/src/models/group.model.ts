import mongoose from "mongoose";
import type { IGroup } from "../types/types.js";

const groupSchema = new mongoose.Schema<IGroup>({
	name: { type: String, required: true },
	description: String,
	division: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Division",
		required: true,
	},
	members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
	createdBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	createdAt: { type: Date, default: Date.now },
});

const Group = mongoose.model<IGroup>("Group", groupSchema);

export default Group;
