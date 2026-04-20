import { Router } from "express";
import { 
    createGroup, 
    getAllGroups, 
    getGroupById, 
    updateGroup, 
    addMember, 
    removeMember 
} from "../controllers/group.controller.js";
import { protect, restrictTo } from "../middlewares/auth.middleware.js";

const router: Router = Router();

router.use(protect);

router.get("/", getAllGroups);
router.get("/:id", getGroupById);

// Admin only management
router.use(restrictTo("division_admin", "super_admin"));

router.post("/", createGroup);
router.patch("/:id", updateGroup);
router.post("/:id/members", addMember);
router.delete("/:id/members/:userId", removeMember);

export default router;
