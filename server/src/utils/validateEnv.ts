import { z } from "zod";
import logger from "./logger.js";

const envSchema = z.object({
	NODE_ENV: z
		.enum(["development", "production", "test"])
		.default("development"),
	PORT: z.string().default("3000"),
	MONGODB_URI: z.string().optional(),
	MONGO_URI: z.string().optional(),
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

export default function validateEnv() {
	try {
		const parsed = envSchema.parse(process.env);

		if (!parsed.MONGODB_URI && !parsed.MONGO_URI) {
			logger.error("Invalid environment variables: missing MONGODB_URI / MONGO_URI");
			process.exit(1);
		}

		logger.info("Environment variables validated successfully");
	} catch (error) {
		if (error instanceof z.ZodError) {
			logger.error("Invalid environment variables:", JSON.stringify(error.issues, null, 2));
			process.exit(1);
		}
		logger.error("Unexpected error validating env:", error);
		process.exit(1);
	}
}