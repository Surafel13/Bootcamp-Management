import { Router } from "express";
import { 
    createGroup, 
    getAllGroups, 
    getGroupById, 
    updateGroup, 
    addMember, 
    removeMember 
} from "../controllers/group.controller.js";
import { protect, restrictTo } from "../middlewares/auth.middleware.js";

const router: Router = Router();

router.use(protect);

// Public routes (authenticated users)
/**
 * @swagger
 * /api/groups:
 *   get:
 *     summary: Get all groups
 *     description: Retrieves all groups with optional filtering. Division admins only see groups in their divisions.
 *     tags: [Groups]
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
 *     responses:
 *       200:
 *         description: List of groups
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
 *                     groups:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Group'
 *       401:
 *         description: Unauthorized - missing or invalid token
 */
router.get("/", getAllGroups);

/**
 * @swagger
 * /api/groups/{id}:
 *   get:
 *     summary: Get group by ID
 *     description: Retrieves a single group with full details including members
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Group ID
 *     responses:
 *       200:
 *         description: Group details
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
 *                     group:
 *                       $ref: '#/components/schemas/Group'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Group not found
 */
router.get("/:id", getGroupById);

// Admin only management
router.use(restrictTo("division_admin", "super_admin"));

/**
 * @swagger
 * /api/groups:
 *   post:
 *     summary: Create a new group
 *     description: Creates a new group with members. Minimum 1 member, maximum 8 members. Requires division_admin or super_admin role.
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - division
 *               - bootcamp
 *             properties:
 *               name:
 *                 type: string
 *                 description: Group name
 *                 example: "Team Alpha"
 *               description:
 *                 type: string
 *                 description: Group description
 *                 example: "Frontend development team"
 *               division:
 *                 type: string
 *                 description: Division ID
 *                 example: "60d21b4667d0d8992e610c85"
 *               bootcamp:
 *                 type: string
 *                 description: Bootcamp ID
 *                 example: "60d21b4667d0d8992e610c86"
 *               members:
 *                 type: array
 *                 description: Array of user IDs (ObjectId format)
 *                 items:
 *                   type: string
 *                 example: ["60d21b4667d0d8992e610c87", "60d21b4667d0d8992e610c88"]
 *               memberNames:
 *                 type: array
 *                 description: Alternative way to add members using names (for creation before user accounts exist)
 *                 items:
 *                   type: string
 *                 example: ["John Doe", "Jane Smith"]
 *     responses:
 *       201:
 *         description: Group created successfully
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
 *                     group:
 *                       $ref: '#/components/schemas/Group'
 *       400:
 *         description: Bad request - group must have at least one member
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       409:
 *         description: Conflict - one or more students already belong to a group in this division
 */
router.post("/", createGroup);

/**
 * @swagger
 * /api/groups/{id}:
 *   patch:
 *     summary: Update a group
 *     description: Updates group information (name, description, etc.). Requires division_admin or super_admin role.
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Group ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Team Alpha Updated"
 *               description:
 *                 type: string
 *                 example: "Updated team description"
 *     responses:
 *       200:
 *         description: Group updated successfully
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
 *                     group:
 *                       $ref: '#/components/schemas/Group'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Group not found
 */
router.patch("/:id", updateGroup);

/**
 * @swagger
 * /api/groups/{id}/members:
 *   post:
 *     summary: Add a member to a group
 *     description: Adds a user to an existing group. Maximum group size is 8 members. Requires division_admin or super_admin role.
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Group ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 description: User ID to add to the group
 *                 example: "60d21b4667d0d8992e610c89"
 *     responses:
 *       200:
 *         description: Member added successfully
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
 *                     group:
 *                       $ref: '#/components/schemas/Group'
 *       400:
 *         description: userId is required
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Group not found
 *       409:
 *         description: Student is already in a group for this division
 *       422:
 *         description: Group is already at maximum capacity (8 members)
 */
router.post("/:id/members", addMember);

/**
 * @swagger
 * /api/groups/{id}/members/{userId}:
 *   delete:
 *     summary: Remove a member from a group
 *     description: Removes a user from a group. Groups must maintain minimum size of 2 members. Requires division_admin or super_admin role.
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Group ID
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to remove from the group
 *     responses:
 *       200:
 *         description: Member removed successfully
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
 *                   example: Member removed
 *                 data:
 *                   type: object
 *                   properties:
 *                     group:
 *                       $ref: '#/components/schemas/Group'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Group not found or user is not a member
 *       422:
 *         description: Removing this member would violate the minimum group size of 2
 */
router.delete("/:id/members/:userId", removeMember);

export default router;
