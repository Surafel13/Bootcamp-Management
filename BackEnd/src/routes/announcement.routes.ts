import { Router } from "express";
import {
	createAnnouncement,
	getAllAnnouncements,
	deleteAnnouncement,
} from "../controllers/announcement.controller.js";
import { protect, restrictTo } from "../middlewares/auth.middleware.js";

const router: Router = Router();

router.use(protect);

// Admins only
router.use(restrictTo("super_admin", "division_admin"));

router.post("/", createAnnouncement);
router.get("/", getAllAnnouncements);
router.delete("/:id", deleteAnnouncement);

export default router;