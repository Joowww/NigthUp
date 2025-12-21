import { Router } from 'express';
import { getTagsByType } from '../controller/tagController';
import { createInitialInterests } from '../controller/initialInterestController';
import { authenticateToken } from '../auth/middleware';

const router = Router();

/**
 * @swagger
 * /api/interest/tags/{type}:
 *   get:
 *     summary: Get tags by type for onboarding
 *     tags: [User Interests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [MusicType, Musician, EventType, ChildhoodIdol]
 *     responses:
 *       200:
 *         description: Tags retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/tags/:type', authenticateToken, getTagsByType);

/**
 * @swagger
 * /api/interest/initial-selection:
 *   post:
 *     summary: Save initial user interests from onboarding
 *     tags: [User Interests]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - musicType
 *               - musician
 *               - eventType
 *               - childhoodIdol
 *             properties:
 *               musicType:
 *                 type: string
 *                 example: "Techno"
 *               musician:
 *                 type: string
 *                 example: "DJ Snake"
 *               eventType:
 *                 type: string
 *                 example: "Late Night"
 *               childhoodIdol:
 *                 type: string
 *                 example: "Superhero"
 *     responses:
 *       201:
 *         description: Initial interests saved successfully
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Unauthorized
 */
router.post('/initial-selection', authenticateToken, createInitialInterests);

export default router;