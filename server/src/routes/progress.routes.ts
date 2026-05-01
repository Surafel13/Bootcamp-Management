import { Router } from "express";
import { 
    submitProgress, 
    updateProgress,
    reviewProgress,
    getAllProgress, 
    getProgressByGroup, 
    getMyProgress,
    getWeeklySummary,
} from "../controllers/progress.controller.js";
import { protect, restrictTo } from "../middlewares/auth.middleware.js";
import { checkInstructorPermission } from "../middlewares/instructorPermission.middleware.js";

const router: Router = Router();

router.use(protect);

// Student routes
/**
 * @swagger
 * /api/progress:
 *   post:
 *     summary: Submit weekly progress
 *     description: Student submits weekly progress report for their group. Description must be at least 50 characters. Only one submission per week allowed.
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - group
 *               - title
 *               - description
 *             properties:
 *               group:
 *                 type: string
 *                 description: Group ID
 *                 example: "60d21b4667d0d8992e610c85"
 *               title:
 *                 type: string
 *                 description: Progress report title
 *                 example: "Week 1: Project Setup and Initial Research"
 *               description:
 *                 type: string
 *                 description: Detailed progress description (minimum 50 characters)
 *                 example: "This week we set up the development environment, created the project repository, and conducted initial research on the required technologies..."
 *               fileUrl:
 *                 type: string
 *                 description: URL to attached file (optional)
 *                 example: "https://cloudinary.com/files/progress-report.pdf"
 *               link:
 *                 type: string
 *                 description: External link (e.g., GitHub, Figma, etc.)
 *                 example: "https://github.com/group/project-repo"
 *     responses:
 *       201:
 *         description: Progress submitted successfully
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
 *                     progress:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         title:
 *                           type: string
 *                         weekNumber:
 *                           type: number
 *                         year:
 *                           type: number
 *                         status:
 *                           type: string
 *                           enum: [submitted, reviewed]
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not a group member or not enrolled in bootcamp
 *       404:
 *         description: Group not found
 *       409:
 *         description: Progress already submitted for this week
 *       422:
 *         description: Description too short (< 50 characters)
 */
router.post("/", restrictTo("student"), submitProgress);

/**
 * @swagger
 * /api/progress/{id}:
 *   patch:
 *     summary: Update progress report
 *     description: Student updates their progress report. Can only be updated during the same week and before review.
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Progress record ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Updated title
 *                 example: "Week 1: Completed Setup and Started Development"
 *               description:
 *                 type: string
 *                 description: Updated description (minimum 50 characters)
 *                 example: "This week we completed the environment setup, created the repository, and began working on the authentication module..."
 *               fileUrl:
 *                 type: string
 *                 description: Updated file URL
 *                 example: "https://cloudinary.com/files/updated-report.pdf"
 *               link:
 *                 type: string
 *                 description: Updated external link
 *                 example: "https://github.com/group/project-repo/tree/development"
 *     responses:
 *       200:
 *         description: Progress updated successfully
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
 *                     progress:
 *                       $ref: '#/components/schemas/Progress'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not the submitter or progress already reviewed
 *       404:
 *         description: Progress not found
 *       422:
 *         description: Description too short or outside update window
 */
router.patch("/:id", restrictTo("student"), updateProgress);

/**
 * @swagger
 * /api/progress/me:
 *   get:
 *     summary: Get my progress submissions
 *     description: Retrieves all progress reports submitted by the logged-in student's groups.
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Student's progress records
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
 *                   example: 8
 *                 data:
 *                   type: object
 *                   properties:
 *                     progress:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Progress'
 *                     stats:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                         reviewed:
 *                           type: number
 *                         pending:
 *                           type: number
 *                         averageScore:
 *                           type: number
 *                         weeksByGroup:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               groupName:
 *                                 type: string
 *                               submissions:
 *                                 type: number
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Student role required
 */
router.get("/me", restrictTo("student"), getMyProgress);

// Admin / Instructor routes
router.use(restrictTo("division_admin", "super_admin"));

/**
 * @swagger
 * /api/progress:
 *   get:
 *     summary: Get all progress reports
 *     description: Retrieves all progress reports with filtering. Division admins only see progress from their divisions.
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: group
 *         schema:
 *           type: string
 *         description: Filter by group ID
 *       - in: query
 *         name: week
 *         schema:
 *           type: number
 *         description: Filter by week number
 *       - in: query
 *         name: year
 *         schema:
 *           type: number
 *         description: Filter by year
 *       - in: query
 *         name: bootcamp
 *         schema:
 *           type: string
 *         description: Filter by bootcamp ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [submitted, reviewed]
 *         description: Filter by submission status
 *     responses:
 *       200:
 *         description: List of progress reports with statistics
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
 *                   example: 24
 *                 data:
 *                   type: object
 *                   properties:
 *                     progress:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Progress'
 *                     stats:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                         submitted:
 *                           type: number
 *                         reviewed:
 *                           type: number
 *                         averageScore:
 *                           type: number
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin role required
 */
router.get("/", getAllProgress);

/**
 * @swagger
 * /api/progress/group/{groupId}:
 *   get:
 *     summary: Get progress by group
 *     description: Retrieves all progress reports for a specific group with statistics.
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         description: Group ID
 *     responses:
 *       200:
 *         description: Group progress records
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
 *                   example: 6
 *                 data:
 *                   type: object
 *                   properties:
 *                     group:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         name:
 *                           type: string
 *                     progress:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Progress'
 *                     stats:
 *                       type: object
 *                       properties:
 *                         totalWeeks:
 *                           type: number
 *                         submittedWeeks:
 *                           type: number
 *                         reviewedWeeks:
 *                           type: number
 *                         averageScore:
 *                           type: number
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: No access to this group
 *       404:
 *         description: Group not found
 */
router.get("/group/:groupId", getProgressByGroup);

/**
 * @swagger
 * /api/progress/weekly-summary:
 *   get:
 *     summary: Get weekly progress summary
 *     description: Retrieves a summary of weekly progress submissions for groups in accessible divisions.
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: week
 *         schema:
 *           type: number
 *         description: Week number (defaults to current week)
 *       - in: query
 *         name: year
 *         schema:
 *           type: number
 *         description: Year (defaults to current year)
 *       - in: query
 *         name: division
 *         schema:
 *           type: string
 *         description: Filter by division ID (super_admin only)
 *     responses:
 *       200:
 *         description: Weekly progress summary
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
 *                     summary:
 *                       type: object
 *                       properties:
 *                         week:
 *                           type: number
 *                         year:
 *                           type: number
 *                         totalGroups:
 *                           type: number
 *                         submittedCount:
 *                           type: number
 *                         pendingCount:
 *                           type: number
 *                         submissionRate:
 *                           type: number
 *                         averageScore:
 *                           type: number
 *                     groups:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           group:
 *                             type: object
 *                           weekNumber:
 *                             type: number
 *                           year:
 *                             type: number
 *                           title:
 *                             type: string
 *                           status:
 *                             type: string
 *                           score:
 *                             type: number
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: No access to division or admin role required
 */
router.get("/weekly-summary", getWeeklySummary);

/**
 * @swagger
 * /api/progress/{id}/review:
 *   patch:
 *     summary: Review progress report
 *     description: Admin/instructor reviews and grades a progress submission. Provides feedback and score.
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Progress record ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               feedback:
 *                 type: string
 *                 description: Review feedback for the group
 *                 example: "Great progress! The code is well-structured and documentation is thorough. Keep it up!"
 *               score:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *                 description: Score out of 100
 *                 example: 85
 *               status:
 *                 type: string
 *                 enum: [submitted, reviewed]
 *                 description: Update status (defaults to 'reviewed')
 *                 default: "reviewed"
 *                 example: "reviewed"
 *     responses:
 *       200:
 *         description: Progress reviewed successfully
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
 *                     progress:
 *                       $ref: '#/components/schemas/Progress'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: No permission to review this progress
 *       404:
 *         description: Progress not found
 */
router.patch("/:id/review", reviewProgress);

export default router;
