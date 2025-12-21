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
 *     summary: Upload an image to Cloudinary
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
 *               folder:
 *                 type: string
 *                 example: "profile"
 *     responses:
 *       201:
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 image_url:
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
