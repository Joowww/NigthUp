import { Router } from 'express';
import { searchEventsWithAi } from '../controller/aiController';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: AI Search
 *   description: Intelligent event search using AI
 */

/**
 * @swagger
 * /api/ai/search:
 *   post:
 *     summary: Search events using natural language
 *     tags: [AI Search]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - query
 *             properties:
 *               query:
 *                 type: string
 *                 example: "fiesta de techno barata este finde"
 *                 description: Natural language query describing what you are looking for
 *     responses:
 *       200:
 *         description: List of events matching the criteria extracted by AI
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 meta:
 *                   type: object
 *                   properties:
 *                     originalQuery:
 *                       type: string
 *                     interpretedCriteria:
 *                       type: object
 *                 count:
 *                   type: integer
 *                 events:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Event'
 *       500:
 *         description: Server error
 */
router.post('/search', searchEventsWithAi);

export default router;
