import { Router } from "express";
import { protect, restrictTo } from "../middlewares/auth.middleware.js";
import { createBootcamp, getBootcamp, getBootcampDetail, getBootcampEnrollments, getBootcampInstructors, createInstructorAssignment, getBootcampGroups, getBootcampResources, getBootcamps, getBootcampSessions, getBootcampStatistics, getBootcampTasks, updateBootcamp , deleteBootcamp, updateInstructorAssignment, revokeInstructorAssignment } from "../controllers/bootcamp.controller.js";

const router: Router = Router();

router.use(protect);

router.post("/", restrictTo("division_admin", "super_admin"), createBootcamp);
router.get("/", getBootcamps);

router.get("/:id", getBootcampDetail);

router.get("/:id/sessions", getBootcampSessions);
router.get("/:id/resources", getBootcampResources);
router.get("/:id/groups", getBootcampGroups);
router.get("/:id/tasks", getBootcampTasks);
router.get("/:id/enrollments", getBootcampEnrollments);
router.get("/:id/statistics", getBootcampStatistics);

router.post("/:id/instructors", restrictTo("division_admin"), createInstructorAssignment);
router.get("/:id/instructors", getBootcampInstructors);
router.patch("/:id/instructors/:assignmentId", restrictTo("division_admin"), updateInstructorAssignment);
router.delete("/:id/instructors/:assignmentId", restrictTo("division_admin"), revokeInstructorAssignment);

router.get("/:id", getBootcamp);
router.patch("/:id", restrictTo("division_admin", "super_admin"), updateBootcamp);

router.delete("/:id", restrictTo("division_admin", "super_admin"), deleteBootcamp);

export default router;
