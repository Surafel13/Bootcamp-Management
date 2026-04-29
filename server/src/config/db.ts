import mongoose from "mongoose";
import env from "./env.js";
import logger from "../utils/logger.js";

const connectDB = async () => {
  try {
    await mongoose.connect(env.MONGO_URI);
    logger.info("Successfully connected to MongoDB");
  } catch (error: any) {
    logger.error(error.message)
    process.exit(1);
  }
};

export default connectDB;
