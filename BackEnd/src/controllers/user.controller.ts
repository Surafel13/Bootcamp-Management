import type { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import User from "../models/user.model.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";

// Admin creates a user (no self-registration per SRS §4.1)
export const createUser = catchAsync(async (req: Request, res: Response) => {
	const { name, email, password, roles, divisions, status } = req.body;

	const user = await User.create({ name, email, password, roles, divisions, status });

	// Hide password in response
	const userResponse = { ...user.toObject() } as any;
	delete userResponse.password;

	res.status(201).json({ status: "success", data: { user: userResponse } });
});

// Admin lists all users with optional filters
export const getAllUsers = catchAsync(async (req: Request, res: Response) => {
	const { role, status, division } = req.query;

	const filter: Record<string, any> = {};
	
	// Division Locking Logic:
	const isSuperAdmin = req.user!.roles.includes("super_admin");
	if (!isSuperAdmin) {
		filter.divisions = { $in: req.user!.divisions };
	} else if (division) {
		filter.divisions = { $in: [division] };
	}

	if (role) filter.roles = role;
	if (status) filter.status = status;

	const users = await User.find(filter as any).populate("divisions", "name");

	res.status(200).json({
		status: "success",
		results: users.length,
		data: { users },
	});
});

// Get currently logged-in user
export const getMe = catchAsync(async (req: Request, res: Response) => {
	const user = await User.findById(req.user!._id).populate("divisions", "name description");
	res.status(200).json({ status: "success", data: { user } });
});

// Get user by ID
export const getUserById = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const user = await User.findById(req.params.id).populate("divisions", "name description");
		if (!user)
			return next(new AppError("No user found with that ID", 404, { id: "Not found" }));
		res.status(200).json({ status: "success", data: { user } });
	},
);

// Update user info
export const updateUser = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		// Disallow password updates via this route
		if (req.body.password) {
			return next(new AppError("Use /reset-password to change passwords", 400, {}));
		}

		const user = await User.findByIdAndUpdate(
			req.params.id,
			{ 
				name: req.body.name, 
				email: req.body.email,
				roles: req.body.roles,
				divisions: req.body.divisions
			},
			{ new: true, runValidators: true },
		).populate("divisions", "name");

		if (!user)
			return next(new AppError("No user found with that ID", 404, { id: "Not found" }));

		res.status(200).json({ status: "success", data: { user } });
	},
);

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
