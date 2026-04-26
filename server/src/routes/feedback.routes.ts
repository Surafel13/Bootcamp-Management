import { Router } from "express";
import {
    submitFeedback,
    getSessionFeedback,
    getMyFeedback,
    getAllFeedback,
    updateFeedback,
    getBootcampFeedbackStats,
} from "../controllers/feedback.controller.js";
import { protect, restrictTo } from "../middlewares/auth.middleware.js";
import { checkInstructorPermission } from "../middlewares/instructorPermission.middleware.js";

const router: Router = Router();

router.use(protect);

// Student routes
router.post("/", restrictTo("student"), submitFeedback);
router.patch("/:id", restrictTo("student"), updateFeedback);
router.get("/me", restrictTo("student"), getMyFeedback);

// Admin/Instructor routes
router.get("/", restrictTo("division_admin", "super_admin"), getAllFeedback);
router.get(
  "/bootcamp/:bootcampId/stats",
  restrictTo("division_admin", "super_admin"),
  getBootcampFeedbackStats
);

// Staff can only see aggregated/anonymous feedback - check instructor permission
router.get(
  "/session/:sessionId",
  restrictTo("division_admin", "super_admin"),
  checkInstructorPermission("view_feedback", "session"),
  getSessionFeedback
);

export default router;
