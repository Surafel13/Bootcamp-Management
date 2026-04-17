import { Router } from "express";
import { 
    createDivision, 
    getAllDivisions, 
    getDivisionById, 
    updateDivision, 
    deleteDivision, 
    getDivisionStats 
} from "../controllers/division.controller.js";
import { protect, restrictTo } from "../middlewares/auth.middleware.js";

const router: Router = Router();

router.use(protect);

router.get("/", getAllDivisions);
router.get("/:id", getDivisionById);

// Admin only routes
router.use(restrictTo("super_admin"));

router.post("/", createDivision);
router.get("/:id/stats", getDivisionStats);
router.patch("/:id", updateDivision);
router.delete("/:id", deleteDivision);

export default router;
