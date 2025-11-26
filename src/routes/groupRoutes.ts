import { Router } from 'express';
import {
    createGroup,
    addGroupParticipants,
    createGroupPoll,
    voteInGroupPoll,
    getUserGroups,
    removeGroupParticipant,
    updateGroupInfo
} from '../controller/groupController';
import { authenticateToken } from '../auth/middleware';

const router = Router();

/**
 * @swagger
 * /api/group:
 *   post:
 *     summary: Create a new group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - groupName
 *               - participantIds
 *             properties:
 *               groupName:
 *                 type: string
 *               participantIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               description:
 *                 type: string
 *               groupImage:
 *                 type: string
 *     responses:
 *       201:
 *         description: Group created successfully
 */
router.post('/', authenticateToken, createGroup);

/**
 * @swagger
 * /api/group/{groupId}/participants:
 *   post:
 *     summary: Add participants to group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userIds
 *             properties:
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Participants added successfully
 */
router.post('/:groupId/participants', authenticateToken, addGroupParticipants);

/**
 * @swagger
 * /api/group/{groupId}/poll:
 *   post:
 *     summary: Create poll in group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - question
 *               - options
 *             properties:
 *               question:
 *                 type: string
 *               options:
 *                 type: array
 *                 items:
 *                   type: string
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Poll created successfully
 */
router.post('/:groupId/poll', authenticateToken, createGroupPoll);

/**
 * @swagger
 * /api/group/{groupId}/poll/{pollId}/vote:
 *   post:
 *     summary: Vote in group poll
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: pollId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - optionIndex
 *             properties:
 *               optionIndex:
 *                 type: number
 *     responses:
 *       200:
 *         description: Vote registered successfully
 */
router.post('/:groupId/poll/:pollId/vote', authenticateToken, voteInGroupPoll);

/**
 * @swagger
 * /api/group/my-groups:
 *   get:
 *     summary: Get user's groups
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User groups retrieved successfully
 */
router.get('/my-groups', authenticateToken, getUserGroups);

/**
 * @swagger
 * /api/group/{groupId}/participant/{userId}:
 *   delete:
 *     summary: Remove participant from group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Participant removed successfully
 */
router.delete('/:groupId/participant/:userId', authenticateToken, removeGroupParticipant);

/**
 * @swagger
 * /api/group/{groupId}:
 *   put:
 *     summary: Update group information
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               groupName:
 *                 type: string
 *               groupDescription:
 *                 type: string
 *               groupImage:
 *                 type: string
 *     responses:
 *       200:
 *         description: Group updated successfully
 */
router.put('/:groupId', authenticateToken, updateGroupInfo);

export default router;