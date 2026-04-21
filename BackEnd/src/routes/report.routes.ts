import { Router } from "express";
import { 
    getAttendanceReport, 
    getTaskReport, 
    getFeedbackReport,
    getAuditLogs,
    getDashboardStats
} from "../controllers/report.controller.js";
import { protect, restrictTo } from "../middlewares/auth.middleware.js";

const router: Router = Router();

router.use(protect);
router.use(restrictTo("super_admin", "division_admin"));

router.get("/dashboard-stats", getDashboardStats);

router.get("/attendance", getAttendanceReport);
router.get("/tasks", getTaskReport);
router.get("/feedback", getFeedbackReport);
router.get("/logs", getAuditLogs);

export default router;
