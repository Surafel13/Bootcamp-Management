import { Router } from "express";
import { protect, restrictTo } from "../middlewares/auth.middleware.js";
import { checkIPRange } from "../middlewares/ip.middleware.js";
import { scanQR, manualUpdate } from "../controllers/attendance.controller.js";

const router: Router = Router();

// QR Scanning (Student) - Must be on allowed IP
router.post("/scan", protect, restrictTo("student"), checkIPRange, scanQR);

// Manual Update (Admin)
router.patch(
  "/manual",
  protect,
  restrictTo("division_admin", "super_admin"),
  manualUpdate,
);

export default router;
