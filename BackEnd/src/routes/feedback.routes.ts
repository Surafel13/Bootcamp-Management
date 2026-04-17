import { Router } from "express";
import { 
    submitFeedback, 
    getSessionFeedback, 
    getMyFeedback 
} from "../controllers/feedback.controller.js";
import { protect, restrictTo } from "../middlewares/auth.middleware.js";

const router: Router = Router();

router.use(protect);

router.post("/", restrictTo("student"), submitFeedback);
router.get("/me", restrictTo("student"), getMyFeedback);

// Staff can only see aggregated/anonymous feedback
router.get("/session/:sessionId", restrictTo("division_admin", "super_admin"), getSessionFeedback);

export default router;
