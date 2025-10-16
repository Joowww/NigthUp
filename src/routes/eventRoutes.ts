import { Router } from 'express';
import {
  createEvent,
  getAllEvents,
  getAllEventsWithInactive,
  getEventById,
  disableEventById,
  reactivateEventById,
  deleteEventById,
  updateEvent,
  getUsersByEventId,
  removeUserFromEvent,
  addUserToEvent
} from '../controller/eventController';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Event:
 *       type: object
 *       required:
 *         - name
 *         - schedule
 *       properties:
 *         _id:
 *           type: string
 *           description: ID generado por MongoDB
 *         name:
 *           type: string
 *           example: "Technology Conference"
 *         schedule:
 *           type: string
 *           example: "2024-01-15T10:00:00Z"
 *         address:
 *           type: string
 *           example: "Main Auditorium"
 *         participants:
 *           type: array
 *           items:
 *             type: string
 *           description: Array de IDs de participantes
 *         active:
 *           type: boolean
 *           example: true
 *     EventCreate:
 *       type: object
 *       required:
 *         - name
 *         - schedule
 *       properties:
 *         name:
 *           type: string
 *           example: "Technology Conference"
 *         schedule:
 *           type: string
 *           example: "2024-01-15T10:00:00Z"
 *         address:
 *           type: string
 *           example: "Main Auditorium"
 *         participants:
 *           type: array
 *           items:
 *             type: string
 *           example: ["user_id_1", "user_id_2"]
 */

/**
 * @swagger
 * /api/event:
 *   post:
 *     summary: Create a new event
 *     tags: [Events]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EventCreate'
 *     responses:
 *       201:
 *         description: Event created successfully
 *       400:
 *         description: Error in event data
 */
router.post('/', createEvent);

/**
 * @swagger
 * /api/event:
 *   get:
 *     summary: Get all active events (paginated)
 *     tags: [Events]
 *     parameters:
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *         description: Number of records to skip (pagination)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of records to return (pagination)
 *     responses:
 *       200:
 *         description: List of active events obtained successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 events:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Event'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     skip:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     hasMore:
 *                       type: boolean
 */
router.get('/', getAllEvents);

/**
 * @swagger
 * /api/event/all/inactive-included:
 *   get:
 *     summary: Get all events including inactive ones (paginated)
 *     tags: [Events]
 *     parameters:
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *         description: Number of records to skip (pagination)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of records to return (pagination)
 *     responses:
 *       200:
 *         description: List of all events obtained successfully
 */
router.get('/all/inactive-included', getAllEventsWithInactive);

/**
 * @swagger
 * /api/event/{id}:
 *   get:
 *     summary: Get an active event by ID
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event found
 *       404:
 *         description: Event not found
 */
router.get('/:id', getEventById);

/**
 * @swagger
 * /api/event/{id}/disable:
 *   patch:
 *     summary: Disable an event by ID
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event disabled successfully
 *       404:
 *         description: Event not found
 */
router.patch('/:id/disable', disableEventById);

/**
 * @swagger
 * /api/event/{id}/reactivate:
 *   patch:
 *     summary: Reactivate an event by ID
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event reactivated successfully
 *       404:
 *         description: Event not found
 */
router.patch('/:id/reactivate', reactivateEventById);

/**
 * @swagger
 * /api/event/hard/{id}:
 *   delete:
 *     summary: Permanently delete an event by ID
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event permanently deleted
 *       404:
 *         description: Event not found
 */
router.delete('/hard/:id', deleteEventById);

/**
 * @swagger
 * /api/event/{id}:
 *   put:
 *     summary: Update event details by ID
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EventCreate'
 *     responses:
 *       200:
 *         description: Event updated successfully
 *       404:
 *         description: Event not found
 */
router.put('/:id', updateEvent);

/**
 * @swagger
 * /api/event/{id}/users:
 *   get:
 *     summary: Get all users participating in an event
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: List of users in the event
 *       404:
 *         description: Event not found
 */
router.get('/:id/users', getUsersByEventId);

/**
 * @swagger
 * /api/event/{eventId}/user/{userId}:
 *   put:
 *     summary: Add a user to an event
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User added to event
 *       404:
 *         description: Event or user not found
 */
router.put('/:eventId/user/:userId', addUserToEvent);

/**
 * @swagger
 * /api/event/{eventId}/user/{userId}:
 *   delete:
 *     summary: Remove a user from an event
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User removed from event
 *       404:
 *         description: Event or user not found
 */
router.delete('/:eventId/user/:userId', removeUserFromEvent);

export default router;