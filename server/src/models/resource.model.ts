import mongoose from "mongoose";
import type { IResource } from "../types/types.js";

const resourceSchema = new mongoose.Schema<IResource>({
  title: { type: String, required: true },
  description: String,
  fileUrl: String,
  publicId: String, 
  externalLink: String,
  type: {
    type: String,
    enum: ["pdf", "video", "image", "zip", "link"],
    required: true,
  },
  bootcamp: { type: mongoose.Schema.Types.ObjectId, ref: "Bootcamp" },
  session: { type: mongoose.Schema.Types.ObjectId, ref: "Session" },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  downloads: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

// Ensure at least one of bootcamp or session is provided
resourceSchema.path('bootcamp').validate(function(value) {
	return this.bootcamp || this.session;
}, 'Resource must be associated with either a bootcamp or a session');

const Resource = mongoose.model<IResource>("Resource", resourceSchema);

export default Resource;