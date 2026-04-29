import { Router } from "express";
import { createBootcamp, getBootcamp , getBootcamps, updateBootcamp } from "../controllers/bootcamp.controller.js";
import { restrictTo } from "../middlewares/auth.middleware.js";

const router : Router = Router();

router.post("/", restrictTo("division_admin"), createBootcamp);
router.patch("/:id", restrictTo("division_admin"), updateBootcamp);
router.get("/:id", getBootcamp);
router.get("/", getBootcamps);

export default router;
