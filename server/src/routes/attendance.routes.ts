import { Router } from "express";
import { protect, restrictTo } from "../middlewares/auth.middleware.js";
import { checkInstructorPermission } from "../middlewares/instructorPermission.middleware.js";
import {
    generateQR,
    scanQR,
    manualUpdate,
    getAllAttendance,
    getAttendanceBySession,
    getMyAttendance,
    markManual,
    getBootcampAttendanceStats
} from "../controllers/attendance.controller.js";
import { checkIPRange } from "../middlewares/ip.middleware.js";

const router: Router = Router();

router.use(protect);

// Student routes
/**
 * @swagger
 * /api/attendance/scan:
 *   post:
 *     summary: Scan QR code for attendance
 *     description: Student scans QR code to mark attendance. QR code must be valid and within session time window (15min before to 30min after session). Student must be enrolled in the bootcamp.
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - qrToken
 *             properties:
 *               qrToken:
 *                 type: string
 *                 description: JWT token from scanned QR code
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: Attendance recorded successfully
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
 *                   example: Attendance recorded as PRESENT
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       enum: [present, late]
 *                     studentName:
 *                       type: string
 *                       example: "John Doe"
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                     sessionTitle:
 *                       type: string
 *                       example: "Introduction to React"
 *       400:
 *         description: Missing QR token, token expired, token already used, or outside time window
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Student not enrolled in this bootcamp
 *       404:
 *         description: Session not found
 */
router.post("/scan", restrictTo("student"), checkIPRange, scanQR);

/**
 * @swagger
 * /api/attendance/me:
 *   get:
 *     summary: Get my attendance records
 *     description: Retrieves all attendance records for the logged-in student with statistics
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Student attendance records
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
 *                     attendance:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Attendance'
 *                     stats:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                           example: 15
 *                         present:
 *                           type: number
 *                           example: 12
 *                         late:
 *                           type: number
 *                           example: 2
 *                         absent:
 *                           type: number
 *                           example: 1
 *                         excused:
 *                           type: number
 *                           example: 0
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Student role required
 */
router.get("/me", restrictTo("student"), getMyAttendance);

// Admin/Instructor routes
/**
 * @swagger
 * /api/attendance:
 *   get:
 *     summary: Get all attendance records
 *     description: Retrieves all attendance records with filtering options. Requires division_admin or super_admin role.
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: division
 *         schema:
 *           type: string
 *         description: Filter by division ID
 *       - in: query
 *         name: bootcamp
 *         schema:
 *           type: string
 *         description: Filter by bootcamp ID
 *       - in: query
 *         name: session
 *         schema:
 *           type: string
 *         description: Filter by session ID
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering
 *     responses:
 *       200:
 *         description: List of attendance records with statistics
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
 *                     attendance:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Attendance'
 *                     stats:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                         present:
 *                           type: number
 *                         late:
 *                           type: number
 *                         absent:
 *                           type: number
 *                         excused:
 *                           type: number
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.get("/", restrictTo("division_admin", "super_admin"), getAllAttendance);

/**
 * @swagger
 * /api/attendance/session/{sessionId}:
 *   get:
 *     summary: Get attendance for a specific session
 *     description: Retrieves attendance records for a session, showing all enrolled students and their status. Requires instructor or admin permissions.
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Session ID
 *     responses:
 *       200:
 *         description: Session attendance with student list
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
 *                     session:
 *                       $ref: '#/components/schemas/Session'
 *                     attendance:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           student:
 *                             $ref: '#/components/schemas/User'
 *                           status:
 *                             type: string
 *                             enum: [present, late, absent, excused]
 *                           markedAt:
 *                             type: string
 *                             format: date-time
 *                           note:
 *                             type: string
 *                           attendanceId:
 *                             type: string
 *                     stats:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                         present:
 *                           type: number
 *                         late:
 *                           type: number
 *                         absent:
 *                           type: number
 *                         excused:
 *                           type: number
 *                         percentage:
 *                           type: number
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: No permission to view attendance for this session
 *       404:
 *         description: Session not found
 */
router.get("/session/:sessionId", getAttendanceBySession);

/**
 * @swagger
 * /api/attendance/bootcamp/{bootcampId}/stats:
 *   get:
 *     summary: Get bootcamp attendance statistics
 *     description: Retrieves aggregated attendance statistics for a bootcamp. Requires instructor or admin permissions.
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bootcampId
 *         required: true
 *         schema:
 *           type: string
 *         description: Bootcamp ID
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering
 *     responses:
 *       200:
 *         description: Bootcamp attendance statistics
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
 *                     stats:
 *                       type: object
 *                       properties:
 *                         totalSessions:
 *                           type: number
 *                         totalAttendanceRecords:
 *                           type: number
 *                         averageAttendancePerSession:
 *                           type: number
 *                         statusBreakdown:
 *                           type: object
 *                           properties:
 *                             present:
 *                               type: number
 *                             late:
 *                               type: number
 *                             absent:
 *                               type: number
 *                             excused:
 *                               type: number
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: No permission to view attendance for this bootcamp
 *       404:
 *         description: Bootcamp not found
 */
router.get("/bootcamp/:bootcampId/stats", getBootcampAttendanceStats);

// QR Generation (requires permission)
/**
 * @swagger
 * /api/attendance/generate/{sessionId}:
 *   post:
 *     summary: Generate QR code for attendance
 *     description: Generates a QR code for students to scan and mark attendance. QR code expires in 5 minutes. Requires manage_attendance permission.
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Session ID
 *     responses:
 *       200:
 *         description: QR code generated successfully
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
 *                     qrImage:
 *                       type: string
 *                       description: Base64 encoded QR code image
 *                       example: "data:image/png;base64,iVBORw0KG..."
 *                     expiresIn:
 *                       type: number
 *                       description: Expiry time in seconds
 *                       example: 300
 *                     sessionTitle:
 *                       type: string
 *                       example: "Introduction to React"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: No permission to manage attendance for this session
 *       404:
 *         description: Session not found
 */
router.post(
  "/generate/:sessionId",
  checkInstructorPermission("manage_attendance", "session"),
  generateQR
);

// Manual attendance management (requires permission)
/**
 * @swagger
 * /api/attendance/mark:
 *   post:
 *     summary: Mark attendance manually
 *     description: Manually marks attendance for a student. Useful when QR scanning is not possible. Requires manage_attendance permission.
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studentId
 *               - sessionId
 *               - status
 *             properties:
 *               studentId:
 *                 type: string
 *                 description: Student user ID
 *                 example: "60d21b4667d0d8992e610c88"
 *               sessionId:
 *                 type: string
 *                 description: Session ID
 *                 example: "60d21b4667d0d8992e610c89"
 *               status:
 *                 type: string
 *                 enum: [present, absent, late, excused]
 *                 description: Attendance status
 *                 example: "present"
 *               note:
 *                 type: string
 *                 description: Optional note or reason
 *                 example: "Arrived 5 minutes late due to traffic"
 *     responses:
 *       200:
 *         description: Attendance marked successfully
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
 *                   example: Attendance marked as present
 *                 data:
 *                   type: object
 *                   properties:
 *                     attendance:
 *                       $ref: '#/components/schemas/Attendance'
 *       400:
 *         description: Missing required fields or invalid status
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: No permission or student not enrolled
 *       404:
 *         description: Session not found
 */
router.post(
  "/mark",
  checkInstructorPermission("manage_attendance", "session"),
  markManual
);

/**
 * @swagger
 * /api/attendance/{id}:
 *   patch:
 *     summary: Update attendance record
 *     description: Updates an existing attendance record. Can only be modified within 24 hours after session ends (super_admin exception). Requires manage_attendance permission.
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Attendance record ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [present, absent, late, excused]
 *                 description: New attendance status
 *                 example: "excused"
 *               note:
 *                 type: string
 *                 description: Updated note or reason
 *                 example: "Medical appointment - excused absence"
 *     responses:
 *       200:
 *         description: Attendance updated successfully
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
 *                   example: Attendance updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     attendance:
 *                       $ref: '#/components/schemas/Attendance'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: No permission or modification window expired
 *       404:
 *         description: Attendance record not found
 */
router.patch(
  "/:id",
  checkInstructorPermission("manage_attendance", "session"),
  manualUpdate
);

export default router;
