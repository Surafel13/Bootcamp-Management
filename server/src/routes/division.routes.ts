import { Router } from "express";
import { 
    createDivision, 
    getAllDivisions, 
    getDivisionById, 
    updateDivision, 
    deleteDivision, 
    getDivisionStats 
} from "../controllers/division.controller.js";
import { restrictTo } from "../middlewares/auth.middleware.js";

const router: Router = Router();

// Everyone can view divisions (optional, but usually fine)
router.get("/", getAllDivisions);
router.get("/:id", getDivisionById);
router.get("/:id/stats", getDivisionStats);

// Only Super Admin can manage divisions
router.post("/", restrictTo("super_admin"), createDivision);
router.patch("/:id", restrictTo("super_admin"), updateDivision);
router.delete("/:id", restrictTo("super_admin"), deleteDivision);

export default router;
