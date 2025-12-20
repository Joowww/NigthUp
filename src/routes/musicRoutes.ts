import { Router } from 'express';
import { searchMusic } from '../controller/musicController';

const router = Router();

/**
 * @swagger
 * /api/music/search:
 *   get:
 *     summary: Search music via iTunes API (Proxy to avoid CORS)
 *     tags: [Music]
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Search term
 *     responses:
 *       200:
 *         description: Search results from iTunes
 *       400:
 *         description: Missing query
 *       500:
 *         description: External API error
 */
router.get('/search', searchMusic);

export default router;
