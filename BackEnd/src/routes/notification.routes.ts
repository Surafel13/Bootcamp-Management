import { Router } from "express";
import { 
    getMyNotifications, 
    markAsRead, 
    markAllAsRead,
    createNotification,
    deleteNotification 
} from "../controllers/notification.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router: Router = Router();

router.use(protect);

router.get("/", getMyNotifications);
router.patch("/:id/read", markAsRead);
router.patch("/read-all", markAllAsRead);
router.post("/", createNotification);
router.delete("/:id", deleteNotification);

export default router;
