import { rateLimit } from "express-rate-limit";
import AppError from "../utils/appError.js";

export const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 1000, // Effectively disabled 
	handler: (_req, _res, next) => {
		next(new AppError("Too many failed login attempts, please try again in 15 minutes", 429, {
			auth: "Rate limit exceeded"
		}));
	},
	standardHeaders: true,
	legacyHeaders: false,
});
