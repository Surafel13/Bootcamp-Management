import { Router } from "express";
import {
    submitTask,
    gradeSubmission,
    getAllSubmissions,
    getSubmissionById,
    getSubmissionsByTask,
    getMySubmissions,
    updateSubmission,
    getBootcampSubmissionStats,
} from "../controllers/submission.controller.js";
import { protect, restrictTo } from "../middlewares/auth.middleware.js";
import { checkInstructorPermission, checkTaskPermissionValidity } from "../middlewares/instructorPermission.middleware.js";

const router: Router = Router();

router.use(protect);

// Student routes
/**
 * @swagger
 * /api/submissions:
 *   post:
 *     summary: Submit a task
 *     description: Student submits a task. Creates a new submission or increments version on resubmission. Validates GitHub link format and deadline.
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - task
 *             properties:
 *               task:
 *                 type: string
 *                 description: Task ID
 *                 example: "60d21b4667d0d8992e610c85"
 *               githubLink:
 *                 type: string
 *                 description: GitHub repository URL
 *                 example: "https://github.com/johndoe/task-solution"
 *               fileUrl:
 *                 type: string
 *                 description: URL to uploaded file (from file storage)
 *                 example: "https://cloudinary.com/files/submission.pdf"
 *               text:
 *                 type: string
 *                 description: Text response for the task
 *                 example: "This is my solution to the problem..."
 *     responses:
 *       201:
 *         description: Task submitted successfully
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
 *                     submission:
 *                       $ref: '#/components/schemas/Submission'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Student role required
 *       404:
 *         description: Task not found
 *       422:
 *         description: Deadline passed or invalid GitHub link format
 */
router.post("/", restrictTo("student"), submitTask);

/**
 * @swagger
 * /api/submissions/{id}:
 *   patch:
 *     summary: Update submission
 *     description: Student updates their submission before deadline. Only allowed if task allows late submission or before deadline.
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Submission ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               githubLink:
 *                 type: string
 *                 description: Updated GitHub repository URL
 *                 example: "https://github.com/johndoe/task-solution-v2"
 *               fileUrl:
 *                 type: string
 *                 description: Updated file URL
 *                 example: "https://cloudinary.com/files/submission-updated.pdf"
 *               text:
 *                 type: string
 *                 description: Updated text response
 *                 example: "Updated solution with better approach"
 *     responses:
 *       200:
 *         description: Submission updated successfully
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
 *                     submission:
 *                       $ref: '#/components/schemas/Submission'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: You don't own this submission
 *       404:
 *         description: Submission not found
 *       422:
 *         description: Deadline passed - cannot update
 */
router.patch("/:id", restrictTo("student"), updateSubmission);

/**
 * @swagger
 * /api/submissions/me:
 *   get:
 *     summary: Get my submissions
 *     description: Retrieves all submissions for the logged-in student.
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Student's submissions
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
 *                   example: 5
 *                 data:
 *                   type: object
 *                   properties:
 *                     submissions:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Submission'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Student role required
 */
router.get("/me", restrictTo("student"), getMySubmissions);

// Shared routes (with permission checks)
/**
 * @swagger
 * /api/submissions/{id}:
 *   get:
 *     summary: Get submission by ID
 *     description: Retrieves a single submission. Access is role-based (students see only their own, admins see all in their divisions).
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Submission ID
 *     responses:
 *       200:
 *         description: Submission details
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
 *                     submission:
 *                       $ref: '#/components/schemas/Submission'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: No permission to view this submission
 *       404:
 *         description: Submission not found
 */
router.get("/:id", getSubmissionById);

// Admin/Instructor routes
router.use(restrictTo("division_admin", "super_admin"));

/**
 * @swagger
 * /api/submissions:
 *   get:
 *     summary: Get all submissions
 *     description: Retrieves all submissions with filtering. Division admins see only submissions from tasks in their divisions.
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: task
 *         schema:
 *           type: string
 *         description: Filter by task ID
 *       - in: query
 *         name: student
 *         schema:
 *           type: string
 *         description: Filter by student ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [submitted, graded, returned]
 *         description: Filter by submission status
 *     responses:
 *       200:
 *         description: List of submissions
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
 *                   example: 25
 *                 data:
 *                   type: object
 *                   properties:
 *                     submissions:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Submission'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.get("/", getAllSubmissions);

/**
 * @swagger
 * /api/submissions/task/{taskId}:
 *   get:
 *     summary: Get submissions by task
 *     description: Retrieves all submissions for a specific task. Division admins can only access tasks in their divisions.
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task submissions
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
 *                   example: 15
 *                 data:
 *                   type: object
 *                   properties:
 *                     submissions:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Submission'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: No permission to view submissions for this task
 *       404:
 *         description: Task not found
 */
router.get("/task/:taskId", getSubmissionsByTask);

/**
 * @swagger
 * /api/submissions/bootcamp/{bootcampId}/stats:
 *   get:
 *     summary: Get bootcamp submission statistics
 *     description: Retrieves aggregated submission statistics for a bootcamp. Requires division_admin or super_admin role.
 *     tags: [Submissions]
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
 *         description: Bootcamp submission statistics
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
 *                   additionalProperties: true
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.get("/bootcamp/:bootcampId/stats", getBootcampSubmissionStats);

/**
 * @swagger
 * /api/submissions/{submissionId}/grade:
 *   patch:
 *     summary: Grade a submission
 *     description: Grades a student submission with score and feedback. Sends in-app and email notifications. Requires grade_submissions permission.
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: submissionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Submission ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - score
 *             properties:
 *               score:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *                 description: Score out of 100
 *                 example: 85
 *               feedback:
 *                 type: string
 *                 description: Detailed feedback for the student
 *                 example: "Great work! The code is clean and well-organized. Could improve error handling."
 *               status:
 *                 type: string
 *                 enum: [graded, returned]
 *                 description: Status after grading
 *                 default: "graded"
 *                 example: "graded"
 *     responses:
 *       200:
 *         description: Submission graded successfully
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
 *                     submission:
 *                       $ref: '#/components/schemas/Submission'
 *       400:
 *         description: Invalid status value
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: No permission to grade submissions
 *       404:
 *         description: Submission not found
 */
router.patch(
    "/:submissionId/grade",
    checkInstructorPermission("grade_submissions", "task"),
    checkTaskPermissionValidity,
    gradeSubmission
);

export default router;
