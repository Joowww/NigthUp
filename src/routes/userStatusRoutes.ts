import { Router } from 'express';
import {
  getUserStatus,
  getFriendsWithStatus
} from '../controller/userStatusController';
import { authenticateToken } from '../auth/middleware';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     UserStatus:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: ID del usuario
 *         username:
 *           type: string
 *           description: Nombre de usuario
 *         isOnline:
 *           type: boolean
 *           description: Si el usuario está online
 *         lastSeen:
 *           type: string
 *           format: date-time
 *           description: Última vez que el usuario estuvo activo
 *         profilePicture:
 *           type: string
 *           description: URL de la foto de perfil
 *     FriendWithStatus:
 *       type: object
 *       properties:
 *         friendshipId:
 *           type: string
 *           description: ID de la amistad
 *         user:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             username:
 *               type: string
 *             email:
 *               type: string
 *             isOnline:
 *               type: boolean
 *             lastSeen:
 *               type: string
 *               format: date-time
 *             profilePicture:
 *               type: string
 *             location:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   example: "Point"
 *                 coordinates:
 *                   type: array
 *                   items:
 *                     type: number
 *             isVisibleOnMap:
 *               type: boolean
 *         status:
 *           type: string
 *           enum: [accepted]
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/user-status/status/{userId}:
 *   get:
 *     summary: Get user's online status
 *     tags: [User Status]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to check status
 *     responses:
 *       200:
 *         description: User status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/UserStatus'
 *                 friendshipStatus:
 *                   type: string
 *                   enum: [pending, accepted, blocked, null]
 *                   description: Relationship status with the current user
 *       401:
 *         description: Unauthorized - Token required
 *       404:
 *         description: User not found
 */
router.get('/status/:userId', authenticateToken, getUserStatus);

/**
 * @swagger
 * /api/user-status/friends/status:
 *   get:
 *     summary: Get all friends with their online status
 *     tags: [User Status]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Friends with status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 friends:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/FriendWithStatus'
 *                 total:
 *                   type: number
 *                   description: Total number of friends
 *                 onlineFriends:
 *                   type: number
 *                   description: Number of friends currently online
 *       401:
 *         description: Unauthorized - Token required
 *       404:
 *         description: No friends found
 */
router.get('/friends/status', authenticateToken, getFriendsWithStatus);

export default router;