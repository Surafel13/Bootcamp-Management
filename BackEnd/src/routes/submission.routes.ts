import { Router } from "express";
import {
	gradeSubmission,
	submitTask,
} from "../controllers/submission.controller.js";
import { protect, restrictTo } from "../middlewares/auth.middleware.js";

const router : Router = Router();

router.use(protect);

// Student submits task
router.post("/", restrictTo("student"), submitTask);

// Admin grades task
router.patch(
	"/:submissionId/grade",
	restrictTo("division_admin", "super_admin"),
	gradeSubmission,
);

export default router;
