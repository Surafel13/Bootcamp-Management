import { Router } from "express";
import { 
    createSession, 
    getAllSessions, 
    getSessionById, 
    updateSession, 
    cancelSession,
    getSessionAttendance,
    generateQR,
    getActiveQR
} from "../controllers/session.controller.js";
import { protect, restrictTo } from "../middlewares/auth.middleware.js";

const router: Router = Router();

router.use(protect);

router.post(
    "/", 
    restrictTo("division_admin", "super_admin"), 
    createSession
);

router.get("/", getAllSessions);
router.get("/:id", getSessionById);

router.patch(
    "/:id", 
    restrictTo("division_admin", "super_admin"), 
    updateSession
);

router.delete(
    "/:id", 
    restrictTo("division_admin", "super_admin"), 
    cancelSession
);

router.get(
    "/:id/attendance", 
    restrictTo("division_admin", "super_admin"), 
    getSessionAttendance
);

router.post(
	"/:sessionId/generate-qr",
	restrictTo("division_admin", "super_admin"),
	generateQR,
);

router.get(
    "/:sessionId/active-qr",
    getActiveQR
);

export default router;
