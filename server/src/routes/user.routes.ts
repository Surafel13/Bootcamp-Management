import express from "express";
import { createUser, getMe ,getAllUsers, getUserById , updateUser, updateUserStatus, updateUserDivisions, deleteUser, searchUsers } from "../controllers/user.controller.js";
import { protect , restrictTo, restrictToDivision } from "../middlewares/auth.middleware.js";

const router: express.Router = express.Router();

router.use(protect);

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Register a new user
 *     description: Creates a user, hashes a generated password, and sends an email. Restricted to Super Admins and Division Admins.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, roles, memberships, status]
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               roles:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [super_admin, division_admin, student]
 *                 example: [student]
 *               memberships:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     role:
 *                       type: string
 *                       enum: [division_admin, student]
 *                     division:
 *                       type: string
 *                       example: "507f1f77bcf86cd799439011"
 *                 example: [{ role: student, division: "507f1f77bcf86cd799439011" }]
 *               status:
 *                 type: string
 *                 enum: [active, suspended, graduated]
 *                 example: active
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       400:
 *         description: Validation error, Email exists, or Division not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       field:
 *                         type: string
 *                       message:
 *                         type: string
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
router.post("/", restrictTo("super_admin", "division_admin"), restrictToDivision, createUser);

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Get current user
 *     description: Returns the current user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User
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
 *                     user:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                         roles:
 *                           type: array
 *                           items:
 *                             type: string
 *                             enum: [super_admin, division_admin, student]
 *                         memberships:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               division:
 *                                 type: string
 *                               role:
 *                                 type: string
 *                         status:
 *                           type: string
 *                           enum: [active, suspended]
 *                         activeRole:
 *                           type: string
 *                           enum: [super_admin, division_admin, student]
 *                         activeDivision:
 *                           type: string
 *                           nullable: true
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: fail
 *                 message:
 *                   type: string
 *                   example: Validation failed
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       field:
 *                         type: string
 *                       message:
 *                         type: string
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
router.get("/me", getMe);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     description: Returns a list of all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         description: Filter users by role
 *         schema:
 *           type: string
 *           enum: [super_admin, division_admin, student]
 *       - in: query
 *         name: status
 *         description: Filter users by status
 *         schema:
 *           type: string
 *           enum: [active, suspended, graduated]
 *       - in: query
 *         name: division
 *         description: Filter users by division
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of users
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
 *                     users:
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
 *                           roles:
 *                             type: array
 *                             items:
 *                               type: string
 *                               enum: [super_admin, division_admin, student]
 *                           memberships:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 division:
 *                                   type: string
 *                                 role:
 *                                   type: string
 *                                   enum: [division_admin, student]
 *                           status:
 *                             type: string
 *                             enum: [active, suspended]
 *                           activeRole:
 *                             type: string
 *                             enum: [super_admin, division_admin, student]
 *                           activeDivision:
 *                             type: string
 *                             nullable: true
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: fail
 *                 message:
 *                   type: string
 *                   example: Validation failed
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       field:
 *                         type: string
 *                       message:
 *                         type: string
 */
router.get("/", restrictTo("super_admin", "division_admin"), restrictToDivision, getAllUsers);

router.get('/search', restrictTo('super_admin', 'division_admin'), searchUsers);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     description: Returns a user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         description: User ID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User
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
 *                     user:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                         roles:
 *                           type: array
 *                           items:
 *                             type: string
 *                             enum: [super_admin, division_admin, student]
 *                         memberships:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               division:
 *                                 type: string
 *                               role:
 *                                 type: string
 *                         status:
 *                           type: string
 *                           enum: [active, suspended]
 *                         activeRole:
 *                           type: string
 *                           enum: [super_admin, division_admin, student]
 *                         activeDivision:
 *                           type: string
 *                           nullable: true
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: fail
 *                 message:
 *                   type: string
 *                   example: No user found with that ID
 *       404:
 *         description: Not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: fail
 *                 message:
 *                   type: string
 *                   example: No user found with that ID
 */
router.get("/:id", restrictTo("super_admin", "division_admin"), restrictToDivision, getUserById);

/**
 * @swagger
 * /api/users/{id}:
 *   patch:
 *     summary: Update user info
 *     description: Updates a user's info
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         description: User ID
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, memberships, status]
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               memberships:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     role:
 *                       type: string
 *                       enum: [division_admin, student]
 *                     division:
 *                       type: string
 *                       example: "507f1f77bcf86cd799439011"
 *                 example: [{ role: student, division: "507f1f77bcf86cd799439011" }]
 *               status:
 *                 type: string
 *                 enum: [active, suspended, graduated]
 *                 example: active
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       400:
 *         description: Validation error, Email exists, or Division not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       field:
 *                         type: string
 *                       message:
 *                         type: string
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
router.patch("/:id", restrictTo("super_admin", "division_admin"), restrictToDivision, updateUser);

/**
 * @swagger
 * /api/users/{id}:
 *   patch:
 *     summary: Update user status
 *     description: Updates a user's status
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         description: User ID
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [active, suspended, graduated]
 *                 example: active
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       400:
 *         description: Validation error, Email exists, or Division not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       field:
 *                         type: string
 *                       message:
 *                         type: string
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
router.patch("/:id/status", restrictTo("super_admin", "division_admin"), restrictToDivision, updateUserStatus);

/**
 * @swagger
 * /api/users/{id}:
 *   patch:
 *     summary: Update user divisions
 *     description: Updates a user's divisions
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         description: User ID
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               divisions:
 *                 type: array
 *                 items:
 *                   type: string
 *                   example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       400:
 *         description: Validation error, Email exists, or Division not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       field:
 *                         type: string
 *                       message:
 *                         type: string
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
router.patch("/:id/divisions", restrictTo("super_admin", "division_admin"), restrictToDivision, updateUserDivisions);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user
 *     description: Deletes a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         description: User ID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: User deleted successfully
 *       400:
 *         description: Validation error, Email exists, or Division not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       field:
 *                         type: string
 *                       message:
 *                         type: string
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
router.delete("/:id", restrictTo("super_admin", "division_admin"), restrictToDivision, deleteUser);

export default router;
