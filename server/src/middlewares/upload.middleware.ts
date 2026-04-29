import multer from "multer";
import path from "path";
import crypto from "crypto";
import fs from "fs";

const storage = multer.diskStorage({
	destination: (_req, _file, cb) => {
		const dir = "uploads";
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir, { recursive: true });
		}
		cb(null, dir);
	},
	filename: (_req, file, cb) => {
		// Preserve original filename but add a unique prefix to avoid collisions
		const uniqueSuffix = crypto.randomBytes(4).toString("hex");
		const originalName = file.originalname.replace(/\s+/g, "_"); // Replace spaces with underscores
		cb(null, `${uniqueSuffix}-${originalName}`);
	},
});

export const upload = multer({
	storage,
	limits: {
		fileSize: 50 * 1024 * 1024, // 50MB limit
	},
});
