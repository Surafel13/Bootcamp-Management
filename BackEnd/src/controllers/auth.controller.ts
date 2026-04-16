import type { Request, Response, NextFunction } from "express";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import env from "../config/env.js";

interface TokenPayload extends jwt.JwtPayload {
	_id: string;
}

const signToken = (
	id: string,
	secret: string,
	expires: NonNullable<jwt.SignOptions["expiresIn"]>,
) => {
	return jwt.sign({ id }, secret, { expiresIn: expires });
};

export const login = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const { email, password } = req.body;

		if (!email || !password)
			return next(
				new AppError("Please provide email and password", 400, {
					email: "Email is required",
					password: "Password is required",
				}),
			);

		// 1. Find user and include password
		const user = await User.findOne({ email }).select("+password");
		if (!user || !(await bcrypt.compare(password, user.password))) {
			return next(
				new AppError("Incorrect email or password", 401, {
					credentials: "Invalid email or password",
				}),
			);
		}

		// 2. Generate Tokens
		const accessToken = signToken(user._id.toString(), env.JWT_SECRET, "24h");
		const refreshToken = signToken(
			user._id.toString(),
			env.JWT_REFRESH_SECRET,
			"7d",
		);

		res.status(200).json({
			status: "success",
			accessToken,
			refreshToken,
			data: { user },
		});
	},
);

export const refresh = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const { refreshToken } = req.body;
		if (!refreshToken)
			return next(
				new AppError("Refresh token required", 400, {
					refreshToken: "Missing refresh token",
				}),
			);

		const decoded = jwt.verify(
			refreshToken,
			env.JWT_REFRESH_SECRET,
		) as TokenPayload;
		const user = await User.findById(decoded._id);

		if (!user)
			return next(
				new AppError("User no longer exists", 401, {
					user: "User not found or deleted",
				}),
			);

		const newAccessToken = signToken(
			user._id.toString(),
			env.JWT_SECRET,
			"24h",
		);

		res.status(200).json({ status: "success", accessToken: newAccessToken });
	},
);
