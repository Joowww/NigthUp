import { Router } from 'express';
import {
  participateInEventTinder,
  leaveEventTinder,
  likeUser,
  dislikeUser,
  getMatches,
  getNextUser,
  getEventTinderStats
} from '../controller/eventTinderController';
import { authenticateToken } from '../auth/middleware';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     EventTinderParticipant:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: ID del participante
 *         user:
 *           type: string
 *           description: ID del usuario
 *         event:
 *           type: string
 *           description: ID del evento
 *         isActive:
 *           type: boolean
 *           description: Si está activo en el Event Tinder
 *         likes:
 *           type: array
 *           items:
 *             type: string
 *           description: IDs de usuarios que le dieron like
 *         dislikes:
 *           type: array
 *           items:
 *             type: string
 *           description: IDs de usuarios que le dieron dislike
 *         matches:
 *           type: array
 *           items:
 *             type: string
 *           description: IDs de usuarios con los que hizo match
 *         joinedAt:
 *           type: string
 *           format: date-time
 *     TinderMatch:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         user1:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             username:
 *               type: string
 *             profilePicture:
 *               type: string
 *         user2:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             username:
 *               type: string
 *             profilePicture:
 *               type: string
 *         event:
 *           type: string
 *         matchedAt:
 *           type: string
 *           format: date-time
 *     TinderUser:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         username:
 *           type: string
 *         age:
 *           type: number
 *         bio:
 *           type: string
 *         interests:
 *           type: array
 *           items:
 *             type: string
 *         profilePicture:
 *           type: string
 *         distance:
 *           type: number
 *           description: Distancia en metros
 *     LikeDislikeRequest:
 *       type: object
 *       required:
 *         - targetUserId
 *       properties:
 *         targetUserId:
 *           type: string
 *           description: ID del usuario a dar like/dislike
 *     TinderStats:
 *       type: object
 *       properties:
 *         totalParticipants:
 *           type: number
 *         totalLikes:
 *           type: number
 *         totalMatches:
 *           type: number
 *         userStats:
 *           type: object
 *           properties:
 *             likesReceived:
 *               type: number
 *             likesGiven:
 *               type: number
 *             matches:
 *               type: number
 *             remainingUsers:
 *               type: number
 */

/**
 * @swagger
 * /api/event-tinder/{eventId}/participate:
 *   post:
 *     summary: Participate in Event Tinder
 *     tags: [Event Tinder]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       201:
 *         description: Successfully joined Event Tinder
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Te has unido al Event Tinder exitosamente"
 *                 participant:
 *                   $ref: '#/components/schemas/EventTinderParticipant'
 *       400:
 *         description: Already participating or event not found
 *       401:
 *         description: Unauthorized - Token required
 *       404:
 *         description: Event not found
 */
router.post('/:eventId/participate', authenticateToken, participateInEventTinder);

/**
 * @swagger
 * /api/event-tinder/{eventId}/leave:
 *   post:
 *     summary: Leave Event Tinder
 *     tags: [Event Tinder]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Successfully left Event Tinder
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Has salido del Event Tinder exitosamente"
 *       400:
 *         description: Not participating in Event Tinder
 *       401:
 *         description: Unauthorized - Token required
 *       404:
 *         description: Event not found
 */
router.post('/:eventId/leave', authenticateToken, leaveEventTinder);

/**
 * @swagger
 * /api/event-tinder/{eventId}/like:
 *   post:
 *     summary: Like a user in Event Tinder
 *     tags: [Event Tinder]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LikeDislikeRequest'
 *     responses:
 *       200:
 *         description: Like registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Like registrado exitosamente"
 *                 isMatch:
 *                   type: boolean
 *                   description: If it resulted in a match
 *                 match:
 *                   $ref: '#/components/schemas/TinderMatch'
 *       400:
 *         description: Cannot like yourself or already rated
 *       401:
 *         description: Unauthorized - Token required
 *       404:
 *         description: Event or user not found
 */
router.post('/:eventId/like', authenticateToken, likeUser);

/**
 * @swagger
 * /api/event-tinder/{eventId}/dislike:
 *   post:
 *     summary: Dislike a user in Event Tinder
 *     tags: [Event Tinder]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LikeDislikeRequest'
 *     responses:
 *       200:
 *         description: Dislike registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Dislike registrado exitosamente"
 *       400:
 *         description: Cannot dislike yourself or already rated
 *       401:
 *         description: Unauthorized - Token required
 *       404:
 *         description: Event or user not found
 */
router.post('/:eventId/dislike', authenticateToken, dislikeUser);

/**
 * @swagger
 * /api/event-tinder/{eventId}/matches:
 *   get:
 *     summary: Get user's matches in Event Tinder
 *     tags: [Event Tinder]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 20
 *         description: Number of matches to return
 *       - in: query
 *         name: skip
 *         schema:
 *           type: number
 *           default: 0
 *         description: Number of matches to skip
 *     responses:
 *       200:
 *         description: Matches retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 matches:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TinderMatch'
 *                 total:
 *                   type: number
 *                   description: Total number of matches
 *       401:
 *         description: Unauthorized - Token required
 *       404:
 *         description: Event not found or no matches
 */
router.get('/:eventId/matches', authenticateToken, getMatches);

/**
 * @swagger
 * /api/event-tinder/{eventId}/next:
 *   get:
 *     summary: Get next user to rate in Event Tinder
 *     tags: [Event Tinder]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Next user retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/TinderUser'
 *                 remainingUsers:
 *                   type: number
 *                   description: Number of users left to rate
 *       401:
 *         description: Unauthorized - Token required
 *       404:
 *         description: Event not found or no more users
 */
router.get('/:eventId/next', authenticateToken, getNextUser);

/**
 * @swagger
 * /api/event-tinder/{eventId}/stats:
 *   get:
 *     summary: Get Event Tinder statistics
 *     tags: [Event Tinder]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TinderStats'
 *       401:
 *         description: Unauthorized - Token required
 *       404:
 *         description: Event not found
 */
router.get('/:eventId/stats', authenticateToken, getEventTinderStats);

export default router;