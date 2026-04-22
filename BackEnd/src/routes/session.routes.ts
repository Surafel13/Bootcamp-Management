import { Router } from "express";
import {
    createSession,
    getAllSessions,
    getSessionById,
    updateSession,
    cancelSession,
    getSessionAttendance,
    generateQR
} from "../controllers/session.controller.js";
import { restrictTo } from "../middlewares/auth.middleware.js";

const router: Router = Router();

router.post("/", restrictTo("division_admin", "super_admin"), createSession);

router.get("/", getAllSessions);
router.get("/:id", getSessionById);

router.patch("/:id", restrictTo("division_admin", "super_admin"), updateSession);

router.delete("/:id", restrictTo("division_admin", "super_admin"), cancelSession);

router.get("/:id/attendance", getSessionAttendance);

router.post("/:sessionId/generate-qr", generateQR,);

export default router;
