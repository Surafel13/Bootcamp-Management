import mongoose from "mongoose";
import bcrypt from "bcrypt";
import type { IUser } from "../types/types.js";

const membershipSchema = new mongoose.Schema({
	role: {
		type: String,
		enum: ["division_admin", "student"],
		required: true,
	},
	division: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Division",
		required: true,
	},
	joinedAt: {
		type: Date,
		default: Date.now,
	},
}, { _id: false });

const userSchema = new mongoose.Schema<IUser>({
	name: { type: String, required: true },
	email: { type: String, unique: true, required: true },
	password: { type: String, required: true, select: false },
	roles: {
		type: [String],
		enum: ["super_admin", "division_admin", "student"],
		default: ["student"],
	},
	firstLogin: { type: Boolean, default: false },
	memberships: [membershipSchema],
	status: {
		type: String,
		enum: ["active", "suspended", "graduated"],
		default: "active",
	},
	isPasswordChanged: { type: Boolean },
	passwordResetToken: { type: String, select: false },
	passwordResetExpires: { type: Date, select: false },
	createdAt: { type: Date, default: Date.now },
});

// userSchema.pre("save", async function () {
// 	if (!this.isModified("password")) return;
// 	this.password = await bcrypt.hash(this.password, 12);
// });

userSchema.methods.getRoleInDivision = function (divisionId: string) {
	const membership = this.memberships.find(
		(m: any) => m.division.toString() === divisionId.toString()
	);
	return membership ? membership.role : null;
};

userSchema.methods.isInDivision = function (divisionId: string) {
	return this.memberships.some(
		(m: any) => m.division.toString() === divisionId.toString()
	);
};

const User = mongoose.model<IUser>("User", userSchema);

export default User;
