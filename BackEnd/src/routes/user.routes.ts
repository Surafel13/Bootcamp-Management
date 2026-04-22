import { Router } from "express";
import { 
    createUser, 
    getAllUsers, 
    getMe, 
    getUserById, 
    updateUser, 
    updateUserStatus, 
    updateUserDivisions, 
    deleteUser 
} from "../controllers/user.controller.js";
import { protect, restrictTo } from "../middlewares/auth.middleware.js";

const router: Router = Router();

router.use(protect);

router.get("/me", getMe);

// Admin only routes
router.use(restrictTo("super_admin", "division_admin"));

router.post("/", createUser);
router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.patch("/:id", updateUser);
router.patch("/:id/status", updateUserStatus);
router.patch("/:id/divisions", updateUserDivisions);
router.delete("/:id", deleteUser);

export default router;
