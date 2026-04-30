import { Router } from "express";
import { 
    getMyNotifications, 
    markAsRead, 
    markAllAsRead,
    broadcastToDivisionAPI,
    broadcastToBootcampAPI,
    broadcastToGroupAPI,
    sendNotificationToUserAPI,
    sendBulkNotificationsAPI,
    getBootcampEnrolledStudents
} from "../controllers/notification.controller.js";
import { protect, restrictTo } from "../middlewares/auth.middleware.js";

const router: Router = Router();

router.use(protect);

// User routes
/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get my notifications
 *     description: Retrieves all notifications for the authenticated user, sorted by newest first
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 unreadCount:
 *                   type: number
 *                   example: 3
 *                 results:
 *                   type: number
 *                   example: 10
 *                 data:
 *                   type: object
 *                   properties:
 *                     notifications:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Notification'
 *       401:
 *         description: Unauthorized
 */
router.get("/", getMyNotifications);

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   patch:
 *     summary: Mark a notification as read
 *     description: Marks a single notification as read for the authenticated user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification marked as read
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
 *                     notification:
 *                       $ref: '#/components/schemas/Notification'
 *       400:
 *         description: Notification ID required
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Notification not found
 */
router.patch("/:id/read", markAsRead);

/**
 * @swagger
 * /api/notifications/read-all:
 *   patch:
 *     summary: Mark all notifications as read
 *     description: Marks all unread notifications as read for the authenticated user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
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
 *                   example: All notifications marked as read
 *       401:
 *         description: Unauthorized
 */
router.patch("/read-all", markAllAsRead);

// Admin broadcast routes
router.use(restrictTo("division_admin", "super_admin"));

/**
 * @swagger
 * /api/notifications/broadcast/division:
 *   post:
 *     summary: Broadcast to division
 *     description: Sends a broadcast notification to all users or specific role in a division. Requires division_admin or super_admin role.
 *     tags: [Notifications, Broadcast]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - divisionId
 *               - message
 *             properties:
 *               divisionId:
 *                 type: string
 *                 description: Division ID to broadcast to
 *                 example: "60d21b4667d0d8992e610c85"
 *               role:
 *                 type: string
 *                 description: Optional - Filter by specific role (student, instructor, etc.)
 *                 enum: [student, instructor, division_admin]
 *                 example: "student"
 *               title:
 *                 type: string
 *                 description: Notification title
 *                 example: "Important Announcement"
 *               message:
 *                 type: string
 *                 description: Notification message content
 *                 example: "All classes are cancelled tomorrow due to holiday"
 *               type:
 *                 type: string
 *                 description: Notification type
 *                 default: "broadcast"
 *                 example: "announcement"
 *     responses:
 *       200:
 *         description: Broadcast sent successfully
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
 *                   example: Broadcast sent to 45 users
 *                 data:
 *                   type: object
 *                   properties:
 *                     recipients:
 *                       type: number
 *                       example: 45
 *       400:
 *         description: Division ID and message are required
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: You don't have permission to broadcast to this division
 */
router.post("/broadcast/division", broadcastToDivisionAPI);

/**
 * @swagger
 * /api/notifications/broadcast/bootcamp:
 *   post:
 *     summary: Broadcast to bootcamp
 *     description: Sends a broadcast notification to all enrolled students in a bootcamp, with optional enrollment status filter. Requires division_admin or super_admin role.
 *     tags: [Notifications, Broadcast]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bootcampId
 *               - message
 *             properties:
 *               bootcampId:
 *                 type: string
 *                 description: Bootcamp ID to broadcast to
 *                 example: "60d21b4667d0d8992e610c86"
 *               status:
 *                 type: string
 *                 description: Optional - Filter by enrollment status
 *                 enum: [active, dropped, completed]
 *                 example: "active"
 *               title:
 *                 type: string
 *                 description: Notification title
 *                 example: "Bootcamp Update"
 *               message:
 *                 type: string
 *                 description: Notification message content
 *                 example: "Please submit your final projects by Friday"
 *               type:
 *                 type: string
 *                 description: Notification type
 *                 default: "broadcast"
 *                 example: "deadline"
 *     responses:
 *       200:
 *         description: Broadcast sent successfully
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
 *                   example: Broadcast sent to 28 users
 *                 data:
 *                   type: object
 *                   properties:
 *                     recipients:
 *                       type: number
 *                       example: 28
 *       400:
 *         description: Bootcamp ID and message are required
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 */
router.post("/broadcast/bootcamp", broadcastToBootcampAPI);

/**
 * @swagger
 * /api/notifications/broadcast/group:
 *   post:
 *     summary: Broadcast to group
 *     description: Sends a broadcast notification to all members of a specific group. Requires division_admin or super_admin role.
 *     tags: [Notifications, Broadcast]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - groupId
 *               - message
 *             properties:
 *               groupId:
 *                 type: string
 *                 description: Group ID to broadcast to
 *                 example: "60d21b4667d0d8992e610c87"
 *               title:
 *                 type: string
 *                 description: Notification title
 *                 example: "Team Meeting"
 *               message:
 *                 type: string
 *                 description: Notification message content
 *                 example: "Group meeting scheduled for tomorrow at 3 PM"
 *               type:
 *                 type: string
 *                 description: Notification type
 *                 default: "broadcast"
 *                 example: "meeting"
 *     responses:
 *       200:
 *         description: Broadcast sent successfully
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
 *                   example: Broadcast sent to 6 users
 *                 data:
 *                   type: object
 *                   properties:
 *                     recipients:
 *                       type: number
 *                       example: 6
 *       400:
 *         description: Group ID and message are required
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Group not found
 */
router.post("/broadcast/group", broadcastToGroupAPI);

/**
 * @swagger
 * /api/notifications/broadcast/user:
 *   post:
 *     summary: Send notification to specific user
 *     description: Sends a notification to a single user. Requires division_admin or super_admin role.
 *     tags: [Notifications, Broadcast]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - message
 *             properties:
 *               userId:
 *                 type: string
 *                 description: User ID to send notification to
 *                 example: "60d21b4667d0d8992e610c88"
 *               title:
 *                 type: string
 *                 description: Notification title
 *                 example: "Personal Message"
 *               message:
 *                 type: string
 *                 description: Notification message content
 *                 example: "Your application has been approved"
 *               type:
 *                 type: string
 *                 description: Notification type
 *                 default: "broadcast"
 *                 example: "personal"
 *     responses:
 *       200:
 *         description: Notification sent successfully
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
 *                   example: Notification sent
 *                 data:
 *                   type: object
 *                   properties:
 *                     recipients:
 *                       type: number
 *                       example: 1
 *       400:
 *         description: User ID and message are required
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post("/broadcast/user", sendNotificationToUserAPI);

/**
 * @swagger
 * /api/notifications/broadcast/bulk:
 *   post:
 *     summary: Send bulk notifications
 *     description: Sends notifications to multiple users at once. Requires division_admin or super_admin role.
 *     tags: [Notifications, Broadcast]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userIds
 *               - message
 *             properties:
 *               userIds:
 *                 type: array
 *                 description: Array of user IDs to send notifications to
 *                 items:
 *                   type: string
 *                 example: ["60d21b4667d0d8992e610c88", "60d21b4667d0d8992e610c89"]
 *               title:
 *                 type: string
 *                 description: Notification title
 *                 example: "Mass Notification"
 *               message:
 *                 type: string
 *                 description: Notification message content
 *                 example: "System maintenance scheduled for Sunday"
 *               type:
 *                 type: string
 *                 description: Notification type
 *                 default: "broadcast"
 *                 example: "system"
 *     responses:
 *       200:
 *         description: Bulk notifications sent successfully
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
 *                   example: Notifications sent to 15 users
 *                 data:
 *                   type: object
 *                   properties:
 *                     recipients:
 *                       type: number
 *                       example: 15
 *       400:
 *         description: User IDs list and message are required
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post("/broadcast/bulk", sendBulkNotificationsAPI);

// Preview routes
/**
 * @swagger
 * /api/notifications/bootcamp/{bootcampId}/students:
 *   get:
 *     summary: Preview bootcamp students
 *     description: Gets list of enrolled students for a bootcamp (useful before broadcasting). Requires division_admin or super_admin role.
 *     tags: [Notifications, Preview]
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, dropped, completed]
 *         description: Filter by enrollment status
 *     responses:
 *       200:
 *         description: List of enrolled students
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
 *                   example: 28
 *                 data:
 *                   type: object
 *                   properties:
 *                     students:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           email:
 *                             type: string
 *       400:
 *         description: Bootcamp ID is required
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get("/bootcamp/:bootcampId/students", getBootcampEnrolledStudents);

export default router;
