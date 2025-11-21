import { Router } from 'express';
import {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  blockUser,
  getFriends,
  getPendingRequests,
  getFriendStatus,
  removeFriend
} from '../controller/friendshipController';
import { authenticateToken } from '../auth/middleware';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Friendship:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: ID único de la amistad
 *         user1:
 *           type: string
 *           description: ID del primer usuario
 *         user2:
 *           type: string
 *           description: ID del segundo usuario
 *         status:
 *           type: string
 *           enum: [pending, accepted, blocked]
 *           description: Estado de la amistad
 *         requester:
 *           type: string
 *           description: ID del usuario que envió la solicitud
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     FriendRequest:
 *       type: object
 *       required:
 *         - friendId
 *       properties:
 *         friendId:
 *           type: string
 *           description: ID del usuario al que enviar solicitud
 *     BlockRequest:
 *       type: object
 *       required:
 *         - userToBlock
 *       properties:
 *         userToBlock:
 *           type: string
 *           description: ID del usuario a bloquear
 */

/**
 * @swagger
 * /api/friendship/request:
 *   post:
 *     summary: Send friend request
 *     tags: [Friendship]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FriendRequest'
 *     responses:
 *       201:
 *         description: Friend request sent successfully
 *       400:
 *         description: Invalid request or friendship already exists
 *       401:
 *         description: Unauthorized - Token required
 *       404:
 *         description: User not found
 */
router.post('/request', authenticateToken, sendFriendRequest);

/**
 * @swagger
 * /api/friendship/request/{friendshipId}/accept:
 *   patch:
 *     summary: Accept friend request
 *     tags: [Friendship]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: friendshipId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the friendship request
 *     responses:
 *       200:
 *         description: Friend request accepted successfully
 *       401:
 *         description: Unauthorized - Token required
 *       403:
 *         description: Not authorized to accept this request
 *       404:
 *         description: Friend request not found
 */
router.patch('/request/:friendshipId/accept', authenticateToken, acceptFriendRequest);

/**
 * @swagger
 * /api/friendship/request/{friendshipId}/reject:
 *   delete:
 *     summary: Reject friend request
 *     tags: [Friendship]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: friendshipId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the friendship request
 *     responses:
 *       200:
 *         description: Friend request rejected successfully
 *       401:
 *         description: Unauthorized - Token required
 *       403:
 *         description: Not authorized to reject this request
 *       404:
 *         description: Friend request not found
 */
router.delete('/request/:friendshipId/reject', authenticateToken, rejectFriendRequest);

/**
 * @swagger
 * /api/friendship/block:
 *   post:
 *     summary: Block a user
 *     tags: [Friendship]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BlockRequest'
 *     responses:
 *       200:
 *         description: User blocked successfully
 *       400:
 *         description: Cannot block yourself or invalid request
 *       401:
 *         description: Unauthorized - Token required
 *       404:
 *         description: User not found
 */
router.post('/block', authenticateToken, blockUser);

/**
 * @swagger
 * /api/friendship/friends:
 *   get:
 *     summary: Get user's friends list
 *     tags: [Friendship]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Friends list retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 friends:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Friendship'
 *       401:
 *         description: Unauthorized - Token required
 *       404:
 *         description: No friends found
 */
router.get('/friends', authenticateToken, getFriends);

/**
 * @swagger
 * /api/friendship/pending:
 *   get:
 *     summary: Get pending friend requests
 *     tags: [Friendship]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pending requests retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sent:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Friendship'
 *                   description: Requests sent by the user
 *                 received:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Friendship'
 *                   description: Requests received by the user
 *       401:
 *         description: Unauthorized - Token required
 */
router.get('/pending', authenticateToken, getPendingRequests);

/**
 * @swagger
 * /api/friendship/status/{userId2}:
 *   get:
 *     summary: Get friendship status with another user
 *     tags: [Friendship]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId2
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the other user
 *     responses:
 *       200:
 *         description: Friendship status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [none, pending, friends, blocked]
 *                 friendship:
 *                   $ref: '#/components/schemas/Friendship'
 *       401:
 *         description: Unauthorized - Token required
 *       404:
 *         description: User not found
 */
router.get('/status/:userId2', authenticateToken, getFriendStatus);

/**
 * @swagger
 * /api/friendship/friend/{friendshipId}:
 *   delete:
 *     summary: Remove friend
 *     tags: [Friendship]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: friendshipId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the friendship to remove
 *     responses:
 *       200:
 *         description: Friend removed successfully
 *       401:
 *         description: Unauthorized - Token required
 *       403:
 *         description: Not authorized to remove this friendship
 *       404:
 *         description: Friendship not found
 */
router.delete('/friend/:friendshipId', authenticateToken, removeFriend);

export default router;