import type { Request, Response, NextFunction } from "express";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import env from "../config/env.js";
import { sendEmail } from "../services/email.service.js";

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

		const user = await User.findOne({ email }).select("+password");
		if (!user || !(await bcrypt.compare(password, user.password))) {
			return next(
				new AppError("Incorrect email or password", 401, {
					credentials: "Invalid email or password",
				}),
			);
		}

		if (user.status === "suspended") {
			return next(
				new AppError("Your account has been suspended", 403, {
					status: "Account suspended",
				}),
			);
		}

		const accessToken = signToken(user._id.toString(), env.JWT_SECRET, "24h");
		const refreshToken = signToken(
			user._id.toString(),
			env.JWT_REFRESH_SECRET,
			"7d",
		);

		if (!user.firstLogin) {
			await User.updateOne({ _id: user._id }, { firstLogin: true });

			await Notification.create({
				user: user._id,
				message: `Welcome to CSEC!, you're now a member of the CSEC community. Please change your default password.!`,
				type: "general",
			});
		}

		res.status(200).json({
			status: "success",
			accessToken,
			refreshToken,
			data: {
				user: {
					_id: user._id,
					name: user.name,
					email: user.email,
					roles: user.roles,
					divisions: user.divisions,
					status: user.status,
				},
			},
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
		const user = await User.findById(decoded.id);

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

export const forgotPassword = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const { email } = req.body;
		if (!email)
			return next(new AppError("Please provide your email address", 400, { email: "Required" }));

		const user = await User.findOne({ email });
		if (!user)
			return next(new AppError("No user found with that email address", 404, { email: "Not found" }));

		// Generate raw token and store its hash
		const resetToken = crypto.randomBytes(32).toString("hex");
		const hashedToken = crypto.createHash("sha256").update(resetToken.toString()).digest("hex");

		user.passwordResetToken = hashedToken;
		user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
		await user.save({ validateBeforeSave: false });

		const resetURL = `http://localhost:5173/reset-password/${resetToken}`;

		try {
			await sendEmail(
				user.email,
				"BMS – Password Reset Request",
				`You did not requested a password reset. Click the link below to reset your password (valid for 1 hour):\n\n${resetURL}\n\nIf you did not request this, please ignore this email.`,
			);
			res.status(200).json({
				status: "success",
				message: "Password reset link sent to email",
			});
		} catch {
			user.passwordResetToken = undefined;
			user.passwordResetExpires = undefined;
			await user.save({ validateBeforeSave: false });
			return next(new AppError("Failed to send email. Please try again later.", 500, {}));
		}
	},
);

export const resetPassword = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const { token } = req.params;
		const { password } = req.body;

		if (!password)
			return next(new AppError("Please provide a new password", 400, { password: "Required" }));

		// Ensure `token` is checked before usage
		if (!token) {
			throw new AppError("Token is required", 400);
		}
		const hashedToken = crypto.createHash("sha256").update(token.toString()).digest("hex");

		const user = await User.findOne({
			passwordResetToken: hashedToken,
			passwordResetExpires: { $gt: new Date() },
		}).select("+password");

		if (!user)
			return next(new AppError("Token is invalid or has expired", 400, { token: "Invalid or expired" }));

		user.password = password;
		user.passwordResetToken = undefined;
		user.passwordResetExpires = undefined;
		await user.save();

		const accessToken = signToken(user._id.toString(), env.JWT_SECRET, "24h");
		const refreshToken = signToken(user._id.toString(), env.JWT_REFRESH_SECRET, "7d");

		res.status(200).json({
			status: "success",
			message: "Password reset successful",
			accessToken,
			refreshToken,
		});
	},
);

export const logout = catchAsync(
	async (req: Request, res: Response, _next: NextFunction) => {
		// Client should discard tokens. This endpoint is for audit purposes and future blocklist support.
		res.status(200).json({ status: "success", message: "Logged out successfully" });
	},
);
