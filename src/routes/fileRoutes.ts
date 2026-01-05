import { Router } from 'express';
import multer from 'multer';
import { uploadImageHandler } from '../controller/fileController';
import { authenticateToken } from '../auth/middleware';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * @swagger
 * tags:
 *   name: Files
 *   description: File upload management
 */

/**
 * @swagger
 * /api/files/upload:
 *   post:
 *     summary: Upload a file (image, audio, video) to Cloudinary
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: The file to upload
 *               folder:
 *                 type: string
 *                 example: "chat"
 *               resourceType:
 *                 type: string
 *                 enum: [auto, image, video, raw]
 *                 default: auto
 *                 description: Type of resource (use 'video' for audio)
 *     responses:
 *       201:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 file_url:
 *                   type: string
 *                 image_url:
 *                   type: string
 *                 url:
 *                   type: string
 *                 secure_url:
 *                   type: string
 *       400:
 *         description: Missing file or invalid request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error during upload
 */
router.post('/upload', authenticateToken, upload.single('image'), uploadImageHandler);

export default router;
