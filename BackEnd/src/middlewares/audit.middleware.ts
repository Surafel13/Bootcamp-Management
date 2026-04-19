import AuditLog from "../models/auditLog.model.js";
import type { Request, Response, NextFunction } from "express";
import logger from "../utils/logger.js";

// This middleware logs any write operations (POST, PATCH, DELETE)
export const logAction = (req: Request, res: Response, next: NextFunction) => {
  const entityId = req.params.id as string;
  // Only log if the user is authenticated and the method is not GET
  if (req.user && req.method !== "GET") {
    // Enhanced logging with entity type and metadata
    const entityType = req.baseUrl.split("/").pop(); // Extract entity type from URL
    const metadata = req.body; // Include request body as metadata

    // We use res.on('finish') to ensure we only log if the request was successful
    res.on("finish", async () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          await AuditLog.create({
            user: req?.user!._id,
            action: req.method,
            path: req.originalUrl,
            entityId: entityId || undefined,
            entityType: entityType || "unknown",
            metadata: metadata || {},
          });
        } catch (err) {
          logger.error("Audit Log Error:", err);
        }
      }
    });
  }
  next();
};
