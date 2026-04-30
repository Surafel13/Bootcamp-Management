import express from "express";
import { login, forgotPassword, resetPassword, validateResetPasswordToken, changePassword, switchRole, logout } from "../controllers/auth.controller.js";
import { authLimiter } from "../middlewares/rateLimit.middleware.js";
import { protect } from "../middlewares/auth.middleware.js";

const router: express.Router = express.Router();

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User login with role-based authentication
 *     description: Authenticates user credentials, handles role/division selection, generates JWT tokens, and manages first login notifications. Rate limited.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: "password123"
 *               role:
 *                 type: string
 *                 enum: [super_admin, division_admin, student]
 *                 description: Optional specific role to login as
 *               divisionId:
 *                 type: string
 *                 description: Optional division ID when specifying role
 *                 example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Login successful, returns access and refresh tokens
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 accessToken:
 *                   type: string
 *                   description: JWT access token (24h)
 *                 refreshToken:
 *                   type: string
 *                   description: JWT refresh token (7d)
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
 *         description: Missing credentials or invalid role/division combination
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
 *                   example: Please provide email and password
 *                 data:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *                     password:
 *                       type: string
 *                     role:
 *                       type: string
 *       401:
 *         description: Invalid email or password
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
 *                   example: Incorrect email or password
 *                 data:
 *                   type: object
 *                   properties:
 *                     credentials:
 *                       type: string
 *                       example: Invalid email or password
 *       403:
 *         description: Account suspended or invalid role/division access
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
 *                   example: Your account has been suspended
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                     role:
 *                       type: string
 */
router.post("/login", authLimiter, login);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request password reset email
 *     description: Sends an email to the user with a reset token. Rate limited.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Email sent successfully
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
 *                   example: Password reset link sent to email
 *       400:
 *         description: Missing email
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
 *                   example: Please provide your email address
 *                 data:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *                       example: Required
 *       404:
 *         description: No user found with that email address
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
 *                   example: No user found with that email address
 */
router.post("/forgot-password", forgotPassword);

/**
 * @swagger
 * /api/auth/reset-password/{token}:
 *   post:
 *     summary: Reset password
 *     description: Resets a user's password using a token sent to their email. Rate limited.
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: token
 *         description: Password reset token
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password]
 *             properties:
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Password reset successful
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
 *                   example: Password reset successful
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                       description: JWT access token (24h)
 *                     refreshToken:
 *                       type: string
 *                       description: JWT refresh token (7d)
 *       400:
 *         description: Missing password or invalid token
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
 *                   example: Please provide a new password
 *                 data:
 *                   type: object
 *                   properties:
 *                     password:
 *                       type: string
 *                     token:
 *                       type: string
 *       401:
 *         description: Invalid token
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
 *                   example: Token is invalid or has expired
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 */
router.post("/reset-password/:token", authLimiter, resetPassword);

/**
 * @swagger
 * /api/auth/validate-reset-password-token/{token}:
 *   post:
 *     summary: Validate reset password token
 *     description: Validates a password reset token. Rate limited.
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: token
 *         description: Password reset token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Token is valid
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
 *         description: Invalid token
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
 *                   example: Token is invalid or has expired
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 */ 
router.get("/validate-reset-password-token/:token", authLimiter, validateResetPasswordToken);

/**
 * @swagger
 * /api/auth/switch-role:
 *   post:
 *     summary: Switch role
 *     description: Switches a user's role. Rate limited.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role, divisionId]
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [super_admin, division_admin, student]
 *                 description: Role to switch to
 *               divisionId:
 *                 type: string
 *                 description: Division ID to switch to
 *     responses:
 *       200:
 *         description: Role switched successfully
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
 *                     activeRole:
 *                       type: string
 *                       enum: [super_admin, division_admin, student]
 *                     activeDivision:
 *                       type: string
 *                       nullable: true
 *       400:
 *         description: Missing role or invalid role/division combination
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
 *                   example: Invalid role/division combination
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
router.post("/switch-role", protect, switchRole);

export default router;
