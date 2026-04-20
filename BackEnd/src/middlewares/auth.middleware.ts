import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import env from "../config/env.js";
import type { IUser } from "../types/types.js";

interface TokenPayload extends jwt.JwtPayload {
	id: string;
}

export const protect = catchAsync(
	async (req: Request, _res: Response, next: NextFunction) => {
		let token;
		if (req.headers.authorization?.startsWith("Bearer")) {
			token = req.headers.authorization.split(" ")[1];
		}
		if (!token)
			return next(
				new AppError("Please log in to access this route", 401, {
					auth: "Authentication required",
				}),
			);

		const decoded = jwt.verify(token, env.JWT_SECRET) as TokenPayload;
		const user = await User.findById(decoded.id);

		if (!user || user.status !== "active")
			return next(
				new AppError("User no longer exists or is suspended", 401, {
					user: "Invalid or inactive user",
				}),
			);

		req.user = user;
		next();
	},
);

export const restrictTo = (...allowedRoles: IUser["roles"][number][]) => {
	return (req: Request, _res: Response, next: NextFunction) => {
		// Check if any of the user's roles are in the allowedRoles list
		const hasRole = req.user?.roles.some((role) => allowedRoles.includes(role));

		if (!hasRole) {
			return next(
				new AppError("You do not have permission for this action", 403, {
					role: "Insufficient permissions",
				}),
			);
		}
		next();
	};
};
