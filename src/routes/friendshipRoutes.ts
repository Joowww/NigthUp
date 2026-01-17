import { Router } from 'express';
import {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  blockUser,
  getFriends,
  getPendingRequests,
  getFriendStatus,
  removeFriend,
  searchUsersForFriendship,
  getFilterOptions,
  sendFriendRequestV2,
  getMutualFriends,
  cancelFriendRequestV2,
  acceptFriendRequestV2,
  getFriendsV2
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
 *         - recipientId
 *       properties:
 *         recipientId:
 *           type: string
 *           description: ID del usuario al que enviar solicitud
 *     BlockRequest:
 *       type: object
 *       required:
 *         - recipientId
 *       properties:
 *         recipientId:
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

/**
 * @swagger
 * /api/friendship/search:
 *   get:
 *     summary: Search users to add as friends
 *     description: |
 *       Search users by username and return their friendship status
 *       relative to the authenticated user.
 *
 *       Possible statuses:
 *       - none: No relationship
 *       - friends: Already friends
 *       - pending_sent: Friend request sent by the user
 *       - pending_received: Friend request received from the user
 *       - blocked: User is blocked
 *     tags: [Friendship]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: false
 *         schema:
 *           type: string
 *         description: Username or partial username to search
 *     responses:
 *       200:
 *         description: Users found successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: "65fa12a9c3e12a0012345678"
 *                   username:
 *                     type: string
 *                     example: "juanito"
 *                   avatar:
 *                     type: string
 *                     example: "/default-images/default-avatar.png"
 *                   status:
 *                     type: string
 *                     enum:
 *                       - none
 *                       - friends
 *                       - pending_sent
 *                       - pending_received
 *                       - blocked
 *                     example: "pending_sent"
 *                   friendshipId:
 *                     type: string
 *                     nullable: true
 *                     example: "661a34b9e21c4f0011223344"
 *       401:
 *         description: Unauthorized - Token required
 *       500:
 *         description: Server error
 */
router.get('/search', authenticateToken, searchUsersForFriendship);

/**
 * @swagger
 * /api/friendship/filter-options:
 *   get:
 *     summary: Get available filter options (cities and interests)
 *     tags: [Friendship]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Filter options retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cities:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Barcelona", "Madrid", "Valencia"]
 *                 interests:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Trap", "House", "Reaggeton", "Techno"]
 *       401:
 *         description: Unauthorized - Token required
 *       500:
 *         description: Server error
 */
router.get('/filter-options', authenticateToken, getFilterOptions);
/**
 * @swagger
 * /api/friendship/v2/request:
 *   post:
 *     summary: Enviar solicitud de amistad V2 (con auto-aceptación)
 *     tags: [Friendship V2]
 */
router.post('/v2/request', authenticateToken, sendFriendRequestV2);

/**
 * @swagger
 * /api/friendship/v2/request/{friendshipId}/accept:
 *   patch:
 *     summary: Aceptar solicitud de amistad V2
 *     tags: [Friendship V2]
 */
router.patch('/v2/request/:friendshipId/accept', authenticateToken, acceptFriendRequestV2);

/**
 * @swagger
 * /api/friendship/v2/request/{friendshipId}/cancel:
 *   delete:
 *     summary: Cancelar/Rechazar solicitud de amistad V2
 *     tags: [Friendship V2]
 */
router.delete('/v2/request/:friendshipId/cancel', authenticateToken, cancelFriendRequestV2);

/**
 * @swagger
 * /api/friendship/mutual/{userId}:
 *   get:
 *     summary: Obtener amigos en común con otro usuario
 *     tags: [Friendship V2]
 */
router.get('/mutual/:userId', authenticateToken, getMutualFriends);

/**
 * @swagger
 * /api/friendship/friends/v2:
 *   get:
 *     summary: Obtener lista de amigos V2 (con todos los campos)
 *     tags: [Friendship V2]
 *     security:
 *       - bearerAuth: []
 */
router.get('/friends/v2', authenticateToken, getFriendsV2);


export default router;