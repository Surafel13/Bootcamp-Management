import type { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import User from "../models/user.model.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import Division from "../models/division.model.js";
import { createUserSchema } from "../utils/validators/user.validator.js";
import {
	generateRandomPassword,
	sendWelcomeEmail
} from "../queues/emailQueue.js";
import logger from "../utils/logger.js";

// Admin creates a user (no self-registration per SRS §4.1)
export const createUser = catchAsync(async (req: Request, res: Response) => {
	const validationResult = createUserSchema.safeParse(req.body);

	if (!validationResult.success) {
		return res.status(400).json({
			status: "error",
			message: "Validation failed",
			errors: validationResult.error.issues.map(err => ({
				field: err.path.join("."),
				message: err.message
			}))
		});
	}

	const { name, email, roles, memberships, status } = validationResult.data;

	const existingUser = await User.findOne({ email });

	if (existingUser) {
		return res.status(400).json({
			status: "error",
			message: "User with this email already exists"
		});
	}

	if (memberships.length > 0) {
		const divisionIds = memberships.map(m => m.division);
		const divisions = await Division.find({ _id: { $in: divisionIds } });

		if (divisions.length !== divisionIds.length) {
			const foundDivisionIds = divisions.map(d => d._id.toString());
			const missingDivisions = divisionIds.filter(id => !foundDivisionIds.includes(id));

			return res.status(400).json({
				status: "error",
				message: `Divisions not found: ${missingDivisions.join(", ")}`
			});
		}
	}

	const plainTextPassword = generateRandomPassword(12);
	console.log("plainTextPassword", plainTextPassword);

	const hashedPassword = await bcrypt.hash(plainTextPassword, 12);

	const user = await User.create({
		name,
		email,
		password: hashedPassword,
		roles,
		memberships,
		status,
		isPasswordChanged: false
	});

	try {
		await sendWelcomeEmail(email, name, plainTextPassword);
		logger.info(`Welcome email queued for ${email}`);
	} catch (emailError) {
		logger.error(`Failed to queue email for ${email}: ${emailError}`);
	}

	let userResponse = user.toObject() as any;

	delete userResponse.password;
	delete userResponse.isPasswordChanged;

	if (memberships.length > 0) {
		const populatedUser = await User.findById(user._id)
			.populate("memberships.division", "name code description");
		userResponse = populatedUser?.toObject() as any;
		delete userResponse.password;
		delete userResponse.isPasswordChanged;
	}

	res.status(201).json({
		status: "success",
		data: {
			user: userResponse,
			message: "User created successfully. Credentials have been sent to their email."
		}
	});
});

// Admin lists all users with optional filters
export const getAllUsers = catchAsync(async (req: Request, res: Response) => {
	const { role, status, division } = req.query;

	const filter: Record<string, any> = {};
	if (role) filter.roles = role;
	if (status) filter.status = status;
	if (division) {
		filter["memberships.division"] = division;
	}

	const users = await User.find(filter)
		.populate("memberships.division", "name code description")
		.select("-password -passwordResetToken -passwordResetExpires");

	res.status(200).json({
		status: "success",
		results: users.length,
		data: { users },
	});
});

// Get currently logged-in user
export const getMe = catchAsync(async (req: Request, res: Response) => {
	const user = await User.findById(req.user!._id)
		.select("memberships")
		.populate({
			path: "memberships.division",
			select: "name description",
		});
	res.status(200).json({ status: "success", data: { user } });
});

// Get user by ID
export const getUserById = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const user = await User.findById(req.params.id)
			.populate("memberships.division", "name code description")
			.select("-password -passwordResetToken -passwordResetExpires -isPasswordChanged");
		
		if (!user)
			return next(new AppError("No user found with that ID", 404, { id: "Not found" }));
		
		res.status(200).json({ status: "success", data: { user } });
	},
);

// Update user info
export const updateUser = catchAsync(async (req: Request, res: Response) => {
	const { id } = req.params;
	const { name, email, memberships, status } = req.body;

	// Validate memberships if provided
	if (memberships && memberships.length > 0) {
		const divisionIds = memberships.map((m: { division: string }) => m.division);
		const divisions = await Division.find({ _id: { $in: divisionIds } });

		if (divisions.length !== divisionIds.length) {
			const foundDivisionIds = divisions.map((d: { _id: { toString: () => any; }; }) => d._id.toString());
			const missingDivisions = divisionIds.filter((id: string) => !foundDivisionIds.includes(id));

			return res.status(400).json({
				status: "error",
				message: `Divisions not found: ${missingDivisions.join(", ")}`
			});
		}
		
		req.body.roles = [...new Set(memberships.map((m: { role: any; }) => m.role))];
	}

	const user = await User.findByIdAndUpdate(
		id,
		{ name, email, memberships, status, roles: req.body.roles },
		{ new: true, runValidators: true }
	)
		.populate("memberships.division", "name code description")
		.select("-password -passwordResetToken -passwordResetExpires -isPasswordChanged");

	if (!user) {
		return res.status(404).json({
			status: "error",
			message: "User not found"
		});
	}

	res.status(200).json({
		status: "success",
		data: { user }
	});
});

// Update user status (Active / Suspended / Graduated)
export const updateUserStatus = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const { status } = req.body;
		const allowed = ["active", "suspended", "graduated"];

		if (!status || !allowed.includes(status)) {
			return next(
				new AppError("Invalid status. Must be active, suspended, or graduated", 400, {
					status: "Invalid value",
				}),
			);
		}

		const user = await User.findByIdAndUpdate(
			req.params.id,
			{ status },
			{ new: true },
		);

		if (!user)
			return next(new AppError("No user found with that ID", 404, { id: "Not found" }));

		res.status(200).json({ status: "success", data: { user } });
	},
);

// Assign / update user divisions
export const updateUserDivisions = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const { divisions } = req.body;
		if (!divisions || !Array.isArray(divisions)) {
			return next(new AppError("Please provide a divisions array", 400, { divisions: "Required" }));
		}

		const user = await User.findByIdAndUpdate(
			req.params.id,
			{ divisions },
			{ new: true, runValidators: true },
		).populate("divisions", "name");

		if (!user)
			return next(new AppError("No user found with that ID", 404, { id: "Not found" }));

		res.status(200).json({ status: "success", data: { user } });
	},
);

// Delete user
export const deleteUser = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const user = await User.findByIdAndDelete(req.params.id);
		if (!user)
			return next(new AppError("No user found with that ID", 404, { id: "Not found" }));

		res.status(204).json({ status: "success", data: null });
	},
);
