import { Router } from "express";
import { 
    submitProgress, 
    getAllProgress, 
    getProgressByGroup, 
    getMyProgress 
} from "../controllers/progress.controller.js";
import { protect, restrictTo } from "../middlewares/auth.middleware.js";

const router: Router = Router();

router.use(protect);

router.post("/", restrictTo("student"), submitProgress);
router.get("/me", restrictTo("student"), getMyProgress);

// Admin / Instructor view
router.use(restrictTo("division_admin", "super_admin"));
router.get("/", getAllProgress);
router.get("/group/:groupId", getProgressByGroup);

export default router;
