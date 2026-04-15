import mongoose from "mongoose";
import type { IGroup } from "../types/types.js";

const groupSchema = new mongoose.Schema<IGroup>({
  name: { type: String, required: true },
  division: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Division",
    required: true,
  },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

module.exports = mongoose.model<IGroup>("Group", groupSchema);
