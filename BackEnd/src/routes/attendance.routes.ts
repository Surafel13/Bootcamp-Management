import { Router } from "express";
import { protect, restrictTo } from "../middlewares/auth.middleware.js";
import { checkIPRange } from "../middlewares/ip.middleware.js";
import { 
    scanQR, 
    manualUpdate, 
    getAllAttendance, 
    getAttendanceBySession, 
    getMyAttendance 
} from "../controllers/attendance.controller.js";

const router: Router = Router();

router.use(protect);

// Student scans QR - IP range check required by SRS
router.post("/scan", restrictTo("student"), checkIPRange, scanQR);

// Admin/Instructor listing
router.get("/", restrictTo("division_admin", "super_admin"), getAllAttendance);
router.get("/session/:sessionId", restrictTo("division_admin", "super_admin"), getAttendanceBySession);

// Self history
router.get("/me", restrictTo("student"), getMyAttendance);

// Manual update
router.patch(
  "/manual",
  restrictTo("division_admin", "super_admin"),
  manualUpdate,
);

export default router;
