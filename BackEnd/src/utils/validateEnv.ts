import { z } from "zod";
import logger from "./logger.js";

const envSchema = z.object({
	NODE_ENV: z
		.enum(["development", "production", "test"])
		.default("development"),
	PORT: z.string().default("3000"),
	MONGO_URI: z.string(),
	JWT_SECRET: z.string(),
	JWT_EXPIRES_IN: z.string(),
	JWT_REFRESH_SECRET: z.string(),
	JWT_QR_SECRET: z.string(),
	EMAIL_HOST: z.string(),
	EMAIL_PORT: z.string(),
	EMAIL_USER: z.email(),
	EMAIL_PASS: z.string(),
	FRONTEND_URL: z.url(),
});

export function validateEnv() {
	try {
		envSchema.parse(process.env);
		logger.info("Environment variables validated successfully");
	} catch (error) {
		if (error instanceof z.ZodError) {
			logger.error("Invalid environment variables:", error.message, error.issues);
			process.exit(1);
		}
	}
}
