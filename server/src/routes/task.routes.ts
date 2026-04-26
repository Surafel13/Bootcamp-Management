import { Router } from "express";
import {
    createTask,
    getAllTasks,
    getTaskById,
    updateTask,
    deleteTask
} from "../controllers/task.controller.js";
import { checkInstructorPermission } from "../middlewares/instructorPermission.middleware.js";
import { protect, restrictTo } from "../middlewares/auth.middleware.js";

const router: Router = Router();

router.use(protect);

router.get("/", getAllTasks);
router.get("/:id", getTaskById);

// Staff management - check instructor permission
router.use(restrictTo("division_admin", "super_admin"));

router.post(
	"/",
	checkInstructorPermission("create_tasks", "body"),
	createTask
);
router.patch("/:id", updateTask);
router.delete("/:id", deleteTask);

export default router;
