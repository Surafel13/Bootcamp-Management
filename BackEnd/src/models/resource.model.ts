import mongoose from "mongoose";
import type { IResource } from "../types/types.js";

const resourceSchema = new mongoose.Schema<IResource>({
  title: { type: String, required: true },
  fileUrl: String,
  type: { type: String, enum: ["pdf", "video", "image", "zip", "link"] },
  session: { type: mongoose.Schema.Types.ObjectId, ref: "Session" },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});

const Resource = mongoose.model<IResource>("Resource", resourceSchema);

export default Resource;
