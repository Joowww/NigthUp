import { Router } from 'express';
import { createPoll, getActivePolls, voteInPoll, closePoll, getPollResults } from '../controller/pollController';
import { authenticateToken } from '../auth/middleware';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Poll:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: ID único de la encuesta
 *         question:
 *           type: string
 *           description: Pregunta de la encuesta
 *         options:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *                 description: Texto de la opción
 *               votes:
 *                 type: number
 *                 description: Número de votos
 *               voters:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: IDs de usuarios que votaron esta opción
 *         createdBy:
 *           type: string
 *           description: ID del usuario que creó la encuesta
 *         isActive:
 *           type: boolean
 *           description: Si la encuesta está activa
 *         allowMultipleVotes:
 *           type: boolean
 *           description: Si permite múltiples votos por usuario
 *         endDate:
 *           type: string
 *           format: date-time
 *           description: Fecha de cierre de la encuesta
 *         totalVotes:
 *           type: number
 *           description: Total de votos
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     CreatePoll:
 *       type: object
 *       required:
 *         - question
 *         - options
 *       properties:
 *         question:
 *           type: string
 *           example: "¿Cuál es tu género musical favorito?"
 *         options:
 *           type: array
 *           items:
 *             type: string
 *           example: ["Rock", "Pop", "Jazz", "Electrónica"]
 *           minItems: 2
 *         allowMultipleVotes:
 *           type: boolean
 *           default: false
 *           description: Permitir múltiples votos por usuario
 *         endDate:
 *           type: string
 *           format: date-time
 *           description: Fecha de cierre (opcional)
 *     VotePoll:
 *       type: object
 *       required:
 *         - optionIndex
 *       properties:
 *         optionIndex:
 *           type: number
 *           example: 0
 *           description: Índice de la opción votada
 *     PollResults:
 *       type: object
 *       properties:
 *         poll:
 *           $ref: '#/components/schemas/Poll'
 *         results:
 *           type: object
 *           properties:
 *             totalVotes:
 *               type: number
 *             percentages:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   option:
 *                     type: string
 *                   votes:
 *                     type: number
 *                   percentage:
 *                     type: number
 */

/**
 * @swagger
 * /api/poll:
 *   post:
 *     summary: Create a new poll
 *     tags: [Polls]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePoll'
 *     responses:
 *       201:
 *         description: Poll created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Encuesta creada correctamente"
 *                 poll:
 *                   $ref: '#/components/schemas/Poll'
 *       400:
 *         description: Invalid poll data or insufficient options
 *       401:
 *         description: Unauthorized - Token required
 */
router.post('/', authenticateToken, createPoll);

/**
 * @swagger
 * /api/poll:
 *   get:
 *     summary: Get active polls
 *     tags: [Polls]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 10
 *         description: Number of polls to return
 *       - in: query
 *         name: skip
 *         schema:
 *           type: number
 *           default: 0
 *         description: Number of polls to skip
 *       - in: query
 *         name: createdBy
 *         schema:
 *           type: string
 *         description: Filter by creator user ID
 *     responses:
 *       200:
 *         description: Active polls retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 polls:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Poll'
 *                 total:
 *                   type: number
 *                   description: Total number of active polls
 *       401:
 *         description: Unauthorized - Token required
 *       404:
 *         description: No active polls found
 */
router.get('/', authenticateToken, getActivePolls);

/**
 * @swagger
 * /api/poll/{pollId}/vote:
 *   post:
 *     summary: Vote in a poll
 *     tags: [Polls]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pollId
 *         required: true
 *         schema:
 *           type: string
 *         description: Poll ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VotePoll'
 *     responses:
 *       200:
 *         description: Vote registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Voto registrado correctamente"
 *                 poll:
 *                   $ref: '#/components/schemas/Poll'
 *       400:
 *         description: Invalid option or poll closed
 *       401:
 *         description: Unauthorized - Token required
 *       403:
 *         description: Already voted and multiple votes not allowed
 *       404:
 *         description: Poll not found
 */
router.post('/:pollId/vote', authenticateToken, voteInPoll);

/**
 * @swagger
 * /api/poll/{pollId}/close:
 *   patch:
 *     summary: Close a poll
 *     tags: [Polls]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pollId
 *         required: true
 *         schema:
 *           type: string
 *         description: Poll ID
 *     responses:
 *       200:
 *         description: Poll closed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Encuesta cerrada correctamente"
 *                 poll:
 *                   $ref: '#/components/schemas/Poll'
 *       401:
 *         description: Unauthorized - Token required
 *       403:
 *         description: Only poll creator can close the poll
 *       404:
 *         description: Poll not found
 */
router.patch('/:pollId/close', authenticateToken, closePoll);

/**
 * @swagger
 * /api/poll/{pollId}/results:
 *   get:
 *     summary: Get poll results
 *     tags: [Polls]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pollId
 *         required: true
 *         schema:
 *           type: string
 *         description: Poll ID
 *     responses:
 *       200:
 *         description: Poll results retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PollResults'
 *       401:
 *         description: Unauthorized - Token required
 *       404:
 *         description: Poll not found
 */
router.get('/:pollId/results', authenticateToken, getPollResults);

export default router;