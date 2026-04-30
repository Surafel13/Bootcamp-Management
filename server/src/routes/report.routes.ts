import { Router } from "express";
import {
    getAttendanceReport,
    getTaskReport,
    getFeedbackReport,
    getAuditLogs,
    getDashboardStats,
    getBootcampReport,
} from "../controllers/report.controller.js";
import { protect, restrictTo } from "../middlewares/auth.middleware.js";

const router: Router = Router();

router.use(protect);
router.use(restrictTo("super_admin", "division_admin"));

// Dashboard
/**
 * @swagger
 * /api/reports/dashboard-stats:
 *   get:
 *     summary: Get dashboard statistics
 *     description: Retrieves comprehensive dashboard statistics including overview metrics, recent activity, attendance, feedback, and submission summaries. Access restricted to admins.
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully
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
 *                     overview:
 *                       type: object
 *                       properties:
 *                         totalStudents:
 *                           type: number
 *                           example: 156
 *                         totalBootcamps:
 *                           type: number
 *                           example: 8
 *                         totalSessions:
 *                           type: number
 *                           example: 45
 *                         avgAttendance:
 *                           type: string
 *                           example: "87%"
 *                         avgRating:
 *                           type: string
 *                           example: "4.2"
 *                         pendingSubmissions:
 *                           type: number
 *                           example: 23
 *                         activeTasks:
 *                           type: number
 *                           example: 12
 *                     recentActivity:
 *                       type: object
 *                       properties:
 *                         submissions:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                               student:
 *                                 type: object
 *                                 properties:
 *                                   name:
 *                                     type: string
 *                               task:
 *                                 type: object
 *                                 properties:
 *                                   title:
 *                                     type: string
 *                               submittedAt:
 *                                 type: string
 *                                 format: date-time
 *                         feedback:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                               student:
 *                                 type: object
 *                                 properties:
 *                                   name:
 *                                     type: string
 *                               session:
 *                                 type: object
 *                                 properties:
 *                                   title:
 *                                     type: string
 *                               createdAt:
 *                                 type: string
 *                                 format: date-time
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin role required
 */
router.get("/dashboard-stats", getDashboardStats);

// Reports
/**
 * @swagger
 * /api/reports/attendance:
 *   get:
 *     summary: Get attendance report
 *     description: Retrieves comprehensive attendance report with session-wise and overall attendance statistics. Admins can filter by division, bootcamp, and date range.
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: division
 *         schema:
 *           type: string
 *         description: Filter by division ID (super_admin only)
 *       - in: query
 *         name: bootcamp
 *         schema:
 *           type: string
 *         description: Filter by bootcamp ID
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering sessions
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering sessions
 *     responses:
 *       200:
 *         description: Attendance report generated successfully
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
 *                         totalSessions:
 *                           type: number
 *                           example: 45
 *                         totalAttendanceRecords:
 *                           type: number
 *                           example: 3420
 *                         presentCount:
 *                           type: number
 *                           example: 2850
 *                         lateCount:
 *                           type: number
 *                           example: 320
 *                         absentCount:
 *                           type: number
 *                           example: 250
 *                         overallAttendanceRate:
 *                           type: number
 *                           example: 87
 *                     sessions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           sessionId:
 *                             type: string
 *                           sessionTitle:
 *                             type: string
 *                           startTime:
 *                             type: string
 *                             format: date-time
 *                           totalStudents:
 *                             type: number
 *                           presentCount:
 *                             type: number
 *                           attendanceRate:
 *                             type: number
 *                     stats:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             enum: [present, late, absent, excused]
 *                           count:
 *                             type: number
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin role required or division access denied
 */
router.get("/attendance", getAttendanceReport);

/**
 * @swagger
 * /api/reports/tasks:
 *   get:
 *     summary: Get task report
 *     description: Retrieves comprehensive task submission report including task-wise and overall completion statistics, scores, and grading status.
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: division
 *         schema:
 *           type: string
 *         description: Filter by division ID (super_admin only)
 *       - in: query
 *         name: bootcamp
 *         schema:
 *           type: string
 *         description: Filter by bootcamp ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published, active, completed]
 *         description: Filter by task status
 *     responses:
 *       200:
 *         description: Task report generated successfully
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
 *                         totalTasks:
 *                           type: number
 *                           example: 24
 *                         totalSubmissions:
 *                           type: number
 *                           example: 350
 *                         gradedSubmissions:
 *                           type: number
 *                           example: 280
 *                         pendingSubmissions:
 *                           type: number
 *                           example: 70
 *                         overallAverageScore:
 *                           type: number
 *                           example: 78.5
 *                         completionRate:
 *                           type: number
 *                           example: 80
 *                     tasks:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           taskId:
 *                             type: string
 *                           taskTitle:
 *                             type: string
 *                           deadline:
 *                             type: string
 *                             format: date-time
 *                           maxScore:
 *                             type: number
 *                           totalStudents:
 *                             type: number
 *                           submittedCount:
 *                             type: number
 *                           submissionRate:
 *                             type: number
 *                           gradedCount:
 *                             type: number
 *                           pendingGrading:
 *                             type: number
 *                           averageScore:
 *                             type: number
 *                     stats:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             enum: [submitted, graded, returned]
 *                           count:
 *                             type: number
 *                           averageScore:
 *                             type: number
 *                           totalScore:
 *                             type: number
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin role required or division access denied
 */
router.get("/tasks", getTaskReport);

/**
 * @swagger
 * /api/reports/feedback:
 *   get:
 *     summary: Get feedback report
 *     description: Retrieves comprehensive feedback report with session-wise and overall rating distributions, average ratings, and comment statistics.
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: division
 *         schema:
 *           type: string
 *         description: Filter by division ID (super_admin only)
 *       - in: query
 *         name: bootcamp
 *         schema:
 *           type: string
 *         description: Filter by bootcamp ID
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering sessions
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering sessions
 *     responses:
 *       200:
 *         description: Feedback report generated successfully
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
 *                         totalSessions:
 *                           type: number
 *                           example: 45
 *                         totalFeedback:
 *                           type: number
 *                           example: 1200
 *                         averageRating:
 *                           type: number
 *                           example: 4.2
 *                         ratingDistribution:
 *                           type: object
 *                           properties:
 *                             1:
 *                               type: number
 *                               example: 45
 *                             2:
 *                               type: number
 *                               example: 78
 *                             3:
 *                               type: number
 *                               example: 156
 *                             4:
 *                               type: number
 *                               example: 342
 *                             5:
 *                               type: number
 *                               example: 579
 *                     sessions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           sessionId:
 *                             type: string
 *                           sessionTitle:
 *                             type: string
 *                           startTime:
 *                             type: string
 *                             format: date-time
 *                           totalResponses:
 *                             type: number
 *                           averageRating:
 *                             type: number
 *                           hasComments:
 *                             type: number
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin role required or division access denied
 */
router.get("/feedback", getFeedbackReport);

/**
 * @swagger
 * /api/reports/logs:
 *   get:
 *     summary: Get audit logs
 *     description: Retrieves system audit logs with filtering by action, user, date range, and division. Division admins only see logs from their divisions.
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *         description: Filter by action type (e.g., CREATE, UPDATE, DELETE)
 *       - in: query
 *         name: user
 *         schema:
 *           type: string
 *         description: Filter by user ID
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering logs
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering logs
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 100
 *         description: Maximum number of logs to return
 *     responses:
 *       200:
 *         description: Audit logs retrieved successfully
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
 *                   example: 100
 *                 data:
 *                   type: object
 *                   properties:
 *                     logs:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           action:
 *                             type: string
 *                           user:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                               name:
 *                                 type: string
 *                               email:
 *                                 type: string
 *                           resource:
 *                             type: string
 *                           resourceId:
 *                             type: string
 *                           details:
 *                             type: object
 *                           timestamp:
 *                             type: string
 *                             format: date-time
 *                           ipAddress:
 *                             type: string
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                         limit:
 *                           type: number
 *                         hasMore:
 *                           type: boolean
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin role required
 */
router.get("/logs", getAuditLogs);

// Bootcamp-specific report
/**
 * @swagger
 * /api/reports/bootcamp/{bootcampId}:
 *   get:
 *     summary: Get bootcamp-specific report
 *     description: Retrieves comprehensive report for a specific bootcamp including enrollment, attendance, tasks, feedback, and session statistics.
 *     tags: [Reports]
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
 *         description: Bootcamp report generated successfully
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
 *                     bootcamp:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         division:
 *                           type: object
 *                           properties:
 *                             _id:
 *                               type: string
 *                             name:
 *                               type: string
 *                         startDate:
 *                           type: string
 *                           format: date
 *                         endDate:
 *                           type: string
 *                           format: date
 *                     enrollment:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             enum: [active, dropped, completed]
 *                           count:
 *                             type: number
 *                     attendance:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             enum: [present, late, absent, excused]
 *                           count:
 *                             type: number
 *                     tasks:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                         submissions:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                                 enum: [submitted, graded, returned]
 *                               count:
 *                                 type: number
 *                               averageScore:
 *                                 type: number
 *                     feedback:
 *                       type: object
 *                       properties:
 *                         averageRating:
 *                           type: number
 *                         totalFeedback:
 *                           type: number
 *                     sessions:
 *                       type: number
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: No access to this bootcamp or admin role required
 *       404:
 *         description: Bootcamp not found
 */
router.get("/bootcamp/:bootcampId", getBootcampReport);

export default router;
