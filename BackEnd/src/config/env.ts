import "dotenv/config";

const env = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || "development",
  // Support either MONGODB_URI (common) or MONGO_URI (legacy in this codebase)
  MONGO_URI: process.env.MONGODB_URI || process.env.MONGO_URI || "",
  JWT_SECRET: process.env.JWT_SECRET || "secret",
  JWT_EXPIRES_IN: (process.env.JWT_EXPIRES_IN as unknown) || "1d",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "secret",
  JWT_QR_SECRET: process.env.JWT_QR_SECRET || "secret",
  EMAIL_HOST: process.env.EMAIL_HOST || "smtp.gmail.com",
  EMAIL_PORT: process.env.EMAIL_PORT || "465",
  EMAIL_USER: process.env.EMAIL_USER || "",
  EMAIL_PASS: process.env.EMAIL_PASS || "",
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",
};

export default env;
