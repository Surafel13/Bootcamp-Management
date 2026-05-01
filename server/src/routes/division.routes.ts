import { Router } from "express";
import { 
    createDivision, 
    getAllDivisions, 
    getDivisionById, 
    updateDivision, 
    deleteDivision, 
    // getDivisionStats 
} from "../controllers/division.controller.js";
import { protect, restrictTo } from "../middlewares/auth.middleware.js";

const router: Router = Router();

router.use(protect);

/**
 * @swagger
 * /api/divisions:
 *   get:
 *     summary: Get all divisions
 *     description: Returns a list of all divisions
 *     tags: [Divisions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of divisions
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
 *                     divisions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           description:
 *                             type: string
 *                           createdAt:
 *                             type: string
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
router.get("/", getAllDivisions);

/**
 * @swagger
 * /api/divisions/{id}:
 *   get:
 *     summary: Get division by ID
 *     description: Returns a division by ID
 *     tags: [Divisions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         description: Division ID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Division
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
 *                     division:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         description:
 *                           type: string
 *                         createdAt:
 *                           type: string
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
 *                   example: Division not found
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
 *                   example: Division not found
 */
router.get("/:id", getDivisionById);
// router.get("/:id/stats", getDivisionStats);

/**
 * @swagger
 * /api/divisions:
 *   post:
 *     summary: Create a new division
 *     description: Creates a new division
 *     tags: [Divisions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, description]
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 example: CSEC
 *               description:
 *                 type: string
 *                 example: Computer Science and Engineering Division
 *     responses:
 *       201:
 *         description: Division created successfully
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
 *                     division:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         description:
 *                           type: string
 *                         createdAt:
 *                           type: string
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
router.post("/", restrictTo("super_admin"), createDivision);

/**
 * @swagger
 * /api/divisions/{id}:
 *   patch:
 *     summary: Update division
 *     description: Updates a division
 *     tags: [Divisions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         description: Division ID
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, description]
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 example: CSEC
 *               description:
 *                 type: string
 *                 example: Computer Science and Engineering Division
 *     responses:
 *       200:
 *         description: Division updated successfully
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
 *                     division:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         description:
 *                           type: string
 *                         createdAt:
 *                           type: string
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
router.patch("/:id", restrictTo("super_admin"), updateDivision);

/**
 * @swagger
 * /api/divisions/{id}:
 *   delete:
 *     summary: Delete division
 *     description: Deletes a division
 *     tags: [Divisions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         description: Division ID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Division deleted successfully
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
 *                   example: Division not found
 */
router.delete("/:id", restrictTo("super_admin"), deleteDivision);

export default router;
