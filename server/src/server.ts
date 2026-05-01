import app from "./app.js";
import connectDB from "./config/db.js";
import env from "./config/env.js";
import logger from "./utils/logger.js";
import type { Server } from "http";
import { initCronJobs } from "./services/cron.service.js";

import bcrypt from "bcrypt";

const plainPassword = "12345678";
const saltRounds = 10;

bcrypt.hash(plainPassword, saltRounds, function(err, hash) {
    if (err) {
        console.log("Error hashing password:", err);
    } else {
        console.log("Hashed password:", hash);
    }
});

const PORT = env.PORT;

let server: Server;

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  logger.error("UNCAUGHT EXCEPTION! Shutting down...", err);
  process.exit(1);
});

const startServer = async () => {
  try {
    await connectDB();
    initCronJobs();

    server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (err) {
    logger.error("DB connection failed", err);
    process.exit(1);
  }
};

startServer();

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  logger.error("UNHANDLED REJECTION! Shutting down...", err);

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});
