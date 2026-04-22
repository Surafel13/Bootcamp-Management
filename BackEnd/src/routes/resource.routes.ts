import { Router } from "express";
import { 
    createResource, 
    getAllResources, 
    getResourceById, 
    deleteResource, 
    trackDownload 
} from "../controllers/resource.controller.js";
import { protect, restrictTo } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";

const router: Router = Router();

router.use(protect);

router.get("/", getAllResources);
router.get("/:id", getResourceById);
router.post("/:id/download", trackDownload);

// Instructors and Admins can manage resources
router.use(restrictTo("division_admin", "super_admin"));

router.post("/", upload.single("file"), createResource);
router.delete("/:id", deleteResource);

export default router;
