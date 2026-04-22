import express from "express";
import cors from "cors";
import { errorHandler } from './middlewares/error.middleware.js';
import { logAction } from "./middlewares/audit.middleware.js";
import { protect } from "./middlewares/auth.middleware.js";
import "dotenv/config";

import morgan from "morgan";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import divisionRoutes from "./routes/division.routes.js";
import sessionRoutes from "./routes/session.routes.js";
import attendanceRoutes from "./routes/attendance.routes.js";
import taskRoutes from "./routes/task.routes.js";
import submissionRoutes from "./routes/submission.routes.js";
import resourceRoutes from "./routes/resource.routes.js";
import feedbackRoutes from "./routes/feedback.routes.js";
import groupRoutes from "./routes/group.routes.js";
import progressRoutes from "./routes/progress.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import reportRoutes from "./routes/report.routes.js";

import { validateEnv } from "./utils/validateEnv.js";
import logger from "./utils/logger.js";

const app: express.Application = express();

validateEnv();

// Middleware
app.use(express.json());

// Enable CORS
app.use(cors());

// Static Files
app.use("/uploads", express.static("uploads"));

app.use(
  morgan("combined", {
    stream: { write: (message) => logger.info(message.trim()) },
  })
);

// Health check before authentication
app.get("/health", (_req, res) => {
	res.send("OK");
});

// Auth routes (some are public)
app.use("/api/auth", authRoutes);

// Protected routes with Audit Logging
app.use("/api", protect, logAction);

app.use("/api/users", userRoutes);
app.use("/api/divisions", divisionRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/reports", reportRoutes);

// Catch-all for undefined routes
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: `Route ${req.originalUrl} not found on this server`,
  });
});

// Error Handler
app.use(errorHandler);

export default app;
