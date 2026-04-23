import { Router } from "express";
import { login, refresh, forgotPassword, resetPassword, logout } from "../controllers/auth.controller.js";
import { authLimiter } from "../middlewares/rateLimit.middleware.js";

const router: Router = Router();

router.post("/login", authLimiter, login);
router.post("/refresh", refresh);
router.post("/forgot-password", forgotPassword);
router.patch("/reset-password/:token", resetPassword);
router.post("/logout", logout);

export default router;
