import { Router } from "express";
import { 
    getMyNotifications, 
    markAsRead, 
    markAllAsRead 
} from "../controllers/notification.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router: Router = Router();

router.use(protect);

router.get("/", getMyNotifications);
router.patch("/:id/read", markAsRead);
router.patch("/read-all", markAllAsRead);

export default router;
