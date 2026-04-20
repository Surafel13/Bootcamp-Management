import mongoose from "mongoose";
import bcrypt from "bcrypt";
import type { IUser } from "../types/types.js";

const userSchema = new mongoose.Schema<IUser>({
	name: { type: String, required: true },
	email: { type: String, unique: true, required: true },
	password: { type: String, required: true, select: false },
	roles: {
		type: [String],
		enum: ["super_admin", "division_admin", "student"],
		default: ["student"],
	},
	divisions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Division" }],
	status: {
		type: String,
		enum: ["active", "suspended", "graduated"],
		default: "active",
	},
	passwordResetToken: { type: String, select: false },
	passwordResetExpires: { type: Date, select: false },
	createdAt: { type: Date, default: Date.now },
});

userSchema.pre("save", async function () {
	if (!this.isModified("password")) return;
	this.password = await bcrypt.hash(this.password, 12);
});

const User = mongoose.model<IUser>("User", userSchema);

export default User;
