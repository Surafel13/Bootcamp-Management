import { Router } from "express";
import {
    createResource,
    getAllResources,
    getResourceById,
    deleteResource,
    trackDownload
} from "../controllers/resource.controller.js";
import { protect, restrictTo } from "../middlewares/auth.middleware.js";
import { checkInstructorPermission } from "../middlewares/instructorPermission.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";

const router: Router = Router();

// All routes require authentication
router.use(protect);

// Public routes (authenticated users)
router.get("/", getAllResources);
router.get("/:id", getResourceById);
router.post("/:id/download", trackDownload);

// Protected routes (admin only)
router.use(restrictTo("division_admin", "super_admin"));

/**
 * @swagger
 * /api/resources:
 *   post:
 *     summary: Upload a new resource
 *     description: Uploads a resource file or creates a resource with external link. Requires division_admin or super_admin role.
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - type
 *               - bootcamp
 *             properties:
 *               title:
 *                 type: string
 *                 description: Resource title
 *                 example: "Introduction to JavaScript"
 *               description:
 *                 type: string
 *                 description: Resource description
 *                 example: "A comprehensive guide to JavaScript fundamentals"
 *               type:
 *                 type: string
 *                 enum: [pdf, video, image, zip, link, text]
 *                 description: Type of resource
 *                 example: pdf
 *               bootcamp:
 *                 type: string
 *                 description: Bootcamp ID this resource belongs to
 *                 example: "60d21b4667d0d8992e610c85"
 *               session:
 *                 type: string
 *                 description: Session ID (optional - if provided, resource is session-specific)
 *                 example: "60d21b4667d0d8992e610c86"
 *               externalLink:
 *                 type: string
 *                 description: External link URL (required if no file is uploaded)
 *                 example: "https://example.com/resource.pdf"
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: File to upload (required if no externalLink)
 *     responses:
 *       201:
 *         description: Resource created successfully
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
 *                     resource:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: "60d21b4667d0d8992e610c87"
 *                         title:
 *                           type: string
 *                           example: "Introduction to JavaScript"
 *                         description:
 *                           type: string
 *                           example: "A comprehensive guide to JavaScript fundamentals"
 *                         fileUrl:
 *                           type: string
 *                           example: "https://cloudinary.com/example.pdf"
 *                         externalLink:
 *                           type: string
 *                           example: "https://example.com/resource.pdf"
 *                         type:
 *                           type: string
 *                           enum: [pdf, video, image, zip, link, text]
 *                           example: pdf
 *                         bootcamp:
 *                           type: string
 *                           example: "60d21b4667d0d8992e610c85"
 *                         session:
 *                           type: string
 *                           example: "60d21b4667d0d8992e610c86"
 *                         downloads:
 *                           type: number
 *                           example: 0
 *                         uploadedBy:
 *                           type: string
 *                           example: "60d21b4667d0d8992e610c88"
 *       400:
 *         description: Bad request - missing required fields or invalid file type
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       403:
 *         description: Forbidden - insufficient permissions
 *       413:
 *         description: File too large
 */
router.post(
    "/",
    checkInstructorPermission("upload_resources", "body"),
    upload.single("file"),
    createResource
);

/**
 * @swagger
 * /api/resources/{id}:
 *   delete:
 *     summary: Delete a resource
 *     description: Deletes a resource and removes the associated file from storage. Requires division_admin or super_admin role.
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Resource ID
 *     responses:
 *       204:
 *         description: Resource deleted successfully
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Resource not found
 */
router.delete("/:id", deleteResource);

export default router;
