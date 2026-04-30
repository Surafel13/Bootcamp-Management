import { Router } from "express";
import {
  enrollInBootcamp,
  getAllEnrollments,
  getEnrollmentById,
  updateEnrollmentStatus,
  dropEnrollment,
  getMyEnrollments,
  getBootcampEnrollmentStats,
  checkEnrollmentStatus,
} from "../controllers/enrollment.controller.js";
import { protect, restrictTo } from "../middlewares/auth.middleware.js";

const router: Router = Router();

router.use(protect);

// Student routes
/**
 * @swagger
 * /api/enrollments:
 *   post:
 *     summary: Enroll in a bootcamp
 *     description: Student enrolls in a bootcamp. Checks enrollment deadline and prevents duplicate enrollment. Requires student role.
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bootcamp
 *             properties:
 *               bootcamp:
 *                 type: string
 *                 description: Bootcamp ID to enroll in
 *                 example: "60d21b4667d0d8992e610c85"
 *     responses:
 *       201:
 *         description: Successfully enrolled in bootcamp
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     enrollment:
 *                       $ref: '#/components/schemas/Enrollment'
 *       400:
 *         description: Bootcamp ID is required
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Student role required
 *       404:
 *         description: Bootcamp not found
 *       409:
 *         description: Already enrolled in this bootcamp
 *       422:
 *         description: Enrollment deadline has passed
 */
router.post("/", restrictTo("student"), enrollInBootcamp);

/**
 * @swagger
 * /api/enrollments/my-enrollments:
 *   get:
 *     summary: Get my enrollments
 *     description: Retrieves all enrollments for the logged-in student, excluding dropped enrollments. Returns active and completed separately.
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Student's enrollments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 results:
 *                   type: number
 *                   example: 3
 *                 data:
 *                   type: object
 *                   properties:
 *                     enrollments:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Enrollment'
 *                     active:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Enrollment'
 *                     completed:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Enrollment'
 *       401:
 *         description: Unauthorized
 */
router.get("/my-enrollments", getMyEnrollments);

/**
 * @swagger
 * /api/enrollments/check/{bootcampId}:
 *   get:
 *     summary: Check enrollment status
 *     description: Checks if the logged-in student is enrolled in a specific bootcamp.
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bootcampId
 *         required: true
 *         schema:
 *           type: string
 *         description: Bootcamp ID to check
 *     responses:
 *       200:
 *         description: Enrollment status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     isEnrolled:
 *                       type: boolean
 *                       example: true
 *                     status:
 *                       type: string
 *                       enum: [active, completed, dropped]
 *                       nullable: true
 *                       example: "active"
 *       401:
 *         description: Unauthorized
 */
router.get("/check/:bootcampId", checkEnrollmentStatus);

// Shared routes
/**
 * @swagger
 * /api/enrollments:
 *   get:
 *     summary: Get all enrollments
 *     description: Retrieves all enrollments with filtering. Access is role-based (students see only their own, division admins see their divisions, super admins see all).
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: bootcamp
 *         schema:
 *           type: string
 *         description: Filter by bootcamp ID
 *       - in: query
 *         name: student
 *         schema:
 *           type: string
 *         description: Filter by student ID (admins only)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, dropped, completed]
 *         description: Filter by enrollment status
 *     responses:
 *       200:
 *         description: List of enrollments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 results:
 *                   type: number
 *                   example: 10
 *                 data:
 *                   type: object
 *                   properties:
 *                     enrollments:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Enrollment'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.get("/", getAllEnrollments);

/**
 * @swagger
 * /api/enrollments/{id}:
 *   get:
 *     summary: Get enrollment by ID
 *     description: Retrieves a single enrollment by ID with role-based access control.
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Enrollment ID
 *     responses:
 *       200:
 *         description: Enrollment details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     enrollment:
 *                       $ref: '#/components/schemas/Enrollment'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: No permission to view this enrollment
 *       404:
 *         description: Enrollment not found
 */
router.get("/:id", getEnrollmentById);

// Admin routes
/**
 * @swagger
 * /api/enrollments/{id}/status:
 *   patch:
 *     summary: Update enrollment status
 *     description: Updates enrollment status (active, dropped, completed). Requires division_admin or super_admin role with division access.
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Enrollment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [active, dropped, completed]
 *                 description: New enrollment status
 *                 example: "completed"
 *     responses:
 *       200:
 *         description: Enrollment status updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     enrollment:
 *                       $ref: '#/components/schemas/Enrollment'
 *       400:
 *         description: Invalid status value
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only admins can update enrollment status or no division access
 *       404:
 *         description: Enrollment not found
 */
router.patch(
  "/:id/status", 
  restrictTo("division_admin", "super_admin"), 
  updateEnrollmentStatus
);

/**
 * @swagger
 * /api/enrollments/{id}/drop:
 *   patch:
 *     summary: Drop enrollment
 *     description: Drops an enrollment (changes status to 'dropped'). Students can drop their own enrollment; admins can drop any in their divisions.
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Enrollment ID
 *     responses:
 *       200:
 *         description: Enrollment dropped successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Enrollment dropped successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     enrollment:
 *                       $ref: '#/components/schemas/Enrollment'
 *       400:
 *         description: Cannot drop a completed bootcamp
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: No permission to drop this enrollment
 *       404:
 *         description: Enrollment not found
 */
router.patch("/:id/drop", dropEnrollment);

/**
 * @swagger
 * /api/enrollments/bootcamp/{bootcampId}/stats:
 *   get:
 *     summary: Get bootcamp enrollment statistics
 *     description: Retrieves enrollment statistics for a bootcamp (total, active, dropped, completed). Requires division_admin or super_admin role with division access.
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bootcampId
 *         required: true
 *         schema:
 *           type: string
 *         description: Bootcamp ID
 *     responses:
 *       200:
 *         description: Bootcamp enrollment statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: number
 *                       description: Total number of enrollments (all statuses)
 *                       example: 45
 *                     active:
 *                       type: number
 *                       description: Active enrollments
 *                       example: 28
 *                     dropped:
 *                       type: number
 *                       description: Dropped enrollments
 *                       example: 12
 *                     completed:
 *                       type: number
 *                       description: Completed enrollments
 *                       example: 5
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only admins can view enrollment stats or no division access
 *       404:
 *         description: Bootcamp not found
 */
router.get(
  "/bootcamp/:bootcampId/stats",
  restrictTo("division_admin", "super_admin"),
  getBootcampEnrollmentStats
);

export default router;
