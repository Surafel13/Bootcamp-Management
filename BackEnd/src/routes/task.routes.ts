import { Router } from "express";
import { createTask, getAllTasks } from "../controllers/task.controller.js";
import { protect, restrictTo } from "../middlewares/auth.middleware.js";

const router: Router = Router();

router.use(protect);

router.post("/", restrictTo("division_admin", "super_admin"), createTask);
router.get("/", getAllTasks);

export default router;
