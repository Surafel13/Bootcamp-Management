import { Router } from "express";
import { 
    submitTask, 
    gradeSubmission, 
    getAllSubmissions, 
    getSubmissionById, 
    getSubmissionsByTask, 
    getMySubmissions,
    updateSubmission 
} from "../controllers/submission.controller.js";
import { protect, restrictTo } from "../middlewares/auth.middleware.js";

const router: Router = Router();

router.use(protect);

router.post("/", restrictTo("student"), submitTask);
router.patch("/:id", restrictTo("student"), updateSubmission);
router.get("/me", restrictTo("student"), getMySubmissions);
router.get("/:id", getSubmissionById);

// Staff management
router.use(restrictTo("division_admin", "super_admin"));

router.get("/", getAllSubmissions);
router.get("/task/:taskId", getSubmissionsByTask);
router.patch("/:submissionId/grade", gradeSubmission);

export default router;
