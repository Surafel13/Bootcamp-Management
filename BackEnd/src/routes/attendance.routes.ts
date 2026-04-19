import { Router } from "express";
import { protect, restrictTo } from "../middlewares/auth.middleware.js";
import { checkIPRange } from "../middlewares/ip.middleware.js";
import {
  scanQR,
  generateQR,
  getSessionAttendance,
  getStudentAttendance,
  manualUpdate
} from "../controllers/attendance.controller.js";

const router: Router = Router();

// QR Generator - Open or Admin protected, let's protect it
router.post("/qr/generate/:sessionId", protect, restrictTo("division_admin", "super_admin"), generateQR);

// QR Scanning (Student)
router.post("/qr/scan", protect, restrictTo("student"), checkIPRange, scanQR);

// Get Session Attendance
router.get("/session/:sessionId", protect, getSessionAttendance);

// Get Student Attendance
router.get("/student/:studentId", protect, getStudentAttendance);

// Manual Update (Admin)
router.patch("/manual/:id", protect, restrictTo("division_admin", "super_admin"), manualUpdate);

export default router;
