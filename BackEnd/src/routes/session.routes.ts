import { Router } from "express";
import { generateQR } from "../controllers/attendance.controller.js";
import { protect, restrictTo } from "../middlewares/auth.middleware.js";

const router: Router = Router();

router.post(
	"/:sessionId/generate-qr",
	protect,
	restrictTo("division_admin", "super_admin"),
	generateQR,
);

export default router;
