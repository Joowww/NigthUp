import { Router } from 'express';
import {
  createEvent,
  getAllEvents,
  getAllEventsWithInactive,
  getEventByIdentifier,
  updateEventByIdentifier,
  disableEventByIdentifier,
  reactivateEventByIdentifier,
  deleteEventByIdentifier,
  addUserToEvent,
  removeUserFromEvent,
  getEventStats,
  requireAdmin,
  requireAdminOrManager
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
 *         - location
 *         - description
 *         - category
 *         - capacity
 *         - price
 *       properties:
 *         _id:
 *           type: string
 *           description: ID único generado por MongoDB
 *         name:
 *           type: string
 *           example: "Noche de Techno en Matrix"
 *         schedule:
 *           type: string
 *           format: date-time
 *           example: "2025-11-15T23:00:00.000Z"
 *         location:
 *           type: string
 *           example: "Matrix Club"
 *         description:
 *           type: string
 *           example: "La mejor música techno con DJs internacionales"
 *         category:
 *           type: string
 *           example: "Techno"
 *         capacity:
 *           type: integer
 *           example: 500
 *         price:
 *           type: number
 *           example: 25
 *         participants:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/User'
 *           description: Array de usuarios participantes
 *         active:
 *           type: boolean
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     EventCreate:
 *       type: object
 *       required:
 *         - name
 *         - schedule
 *         - location
 *         - description
 *         - category
 *         - capacity
 *         - price
 *       properties:
 *         name:
 *           type: string
 *           example: "Noche de Techno en Matrix"
 *         schedule:
 *           type: string
 *           format: date-time
 *           example: "2025-11-15T23:00:00.000Z"
 *         location:
 *           type: string
 *           example: "Matrix Club"
 *         description:
 *           type: string
 *           example: "La mejor música techno con DJs internacionales"
 *         category:
 *           type: string
 *           example: "Techno"
 *         capacity:
 *           type: integer
 *           example: 500
 *         price:
 *           type: number
 *           example: 25
 *     EventStats:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *           description: Total de eventos en el sistema
 *         active:
 *           type: integer
 *           description: Eventos activos
 *         inactive:
 *           type: integer
 *           description: Eventos inactivos
 *         newCount:
 *           type: integer
 *           description: Nuevos eventos en los últimos 7 días
 *         lastUpdated:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización
 *   securitySchemes:
 *     userRole:
 *       type: apiKey
 *       in: header
 *       name: user-role
 *       description: Rol del usuario autenticado (admin, manager, user)
 */

// ==================== GET ====================

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
 *           default: 0
 *         description: Number of records to skip (pagination)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
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
 *       404:
 *         description: No events found
 */
router.get('/', getAllEvents);

/**
 * @swagger
 * /api/event/with-inactive:
 *   get:
 *     summary: Get all events including inactive ones (paginated)
 *     tags: [Events]
 *     parameters:
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of records to skip (pagination)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of records to return (pagination)
 *     responses:
 *       200:
 *         description: List of all events obtained successfully
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
 *       404:
 *         description: No events found
 */
router.get('/with-inactive', getAllEventsWithInactive);

/**
 * @swagger
 * /api/event/stats:
 *   get:
 *     summary: Get event statistics
 *     tags: [Events]
 *     responses:
 *       200:
 *         description: Event statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EventStats'
 *       500:
 *         description: Failed to retrieve statistics
 */
router.get('/stats', getEventStats);

/**
 * @swagger
 * /api/event/{identifier}:
 *   get:
 *     summary: Get an active event by ID or name
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: identifier
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID or event name
 *     responses:
 *       200:
 *         description: Event found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       404:
 *         description: Event not found
 */
router.get('/:identifier', getEventByIdentifier);

// ==================== ADMINISTRATION - EVENTS ====================

/**
 * @swagger
 * /api/event:
 *   post:
 *     summary: 'Create a new event (Admin only)'
 *     tags: [Administration - Events]
 *     security:
 *       - userRole: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EventCreate'
 *     responses:
 *       201:
 *         description: Event created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       400:
 *         description: Error in event data
 *       403:
 *         description: Admin privileges required
 *       500:
 *         description: Failed to create event
 */
router.post('/', requireAdmin, createEvent);

/**
 * @swagger
 * /api/event/{identifier}/add-user:
 *   post:
 *     summary: 'Add user to an event by ID or name (Admin or Manager only)'
 *     tags: [Administration - Events]
 *     security:
 *       - userRole: []
 *     parameters:
 *       - in: path
 *         name: identifier
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID or event name
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userIdentifier
 *             properties:
 *               userIdentifier:
 *                 type: string
 *                 description: User ID, username or email
 *     responses:
 *       200:
 *         description: User added to event successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       400:
 *         description: Missing userIdentifier
 *       403:
 *         description: Admin or manager privileges required
 *       404:
 *         description: Event or user not found
 */
router.post('/:identifier/add-user', requireAdminOrManager, addUserToEvent);

/**
 * @swagger
 * /api/event/{identifier}/remove-user:
 *   post:
 *     summary: 'Remove user from an event by ID or name (Admin or Manager only)'
 *     tags: [Administration - Events]
 *     security:
 *       - userRole: []
 *     parameters:
 *       - in: path
 *         name: identifier
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID or event name
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userIdentifier
 *             properties:
 *               userIdentifier:
 *                 type: string
 *                 description: User ID, username or email
 *     responses:
 *       200:
 *         description: User removed from event successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       400:
 *         description: Missing userIdentifier
 *       403:
 *         description: Admin or manager privileges required
 *       404:
 *         description: Event or user not found
 */
router.post('/:identifier/remove-user', requireAdminOrManager, removeUserFromEvent);

/**
 * @swagger
 * /api/event/{identifier}:
 *   patch:
 *     summary: 'Update event details by ID or name (Admin or Manager only)'
 *     tags: [Administration - Events]
 *     security:
 *       - userRole: []
 *     parameters:
 *       - in: path
 *         name: identifier
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID or event name
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               schedule:
 *                 type: string
 *                 format: date-time
 *               location:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               capacity:
 *                 type: integer
 *               price:
 *                 type: number
 *     responses:
 *       200:
 *         description: Event updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 event:
 *                   $ref: '#/components/schemas/Event'
 *       400:
 *         description: Invalid data
 *       403:
 *         description: Admin or manager privileges required
 *       404:
 *         description: Event not found
 */
router.patch('/:identifier', requireAdminOrManager, updateEventByIdentifier);

/**
 * @swagger
 * /api/event/{identifier}/disable:
 *   patch:
 *     summary: 'Disable an event by ID or name (Admin only)'
 *     tags: [Administration - Events]
 *     security:
 *       - userRole: []
 *     parameters:
 *       - in: path
 *         name: identifier
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID or event name
 *     responses:
 *       200:
 *         description: Event disabled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 event:
 *                   $ref: '#/components/schemas/Event'
 *       403:
 *         description: Admin privileges required
 *       404:
 *         description: Event not found
 */
router.patch('/:identifier/disable', requireAdmin, disableEventByIdentifier);

/**
 * @swagger
 * /api/event/{identifier}/reactivate:
 *   patch:
 *     summary: 'Reactivate an event by ID or name (Admin only)'
 *     tags: [Administration - Events]
 *     security:
 *       - userRole: []
 *     parameters:
 *       - in: path
 *         name: identifier
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID or event name
 *     responses:
 *       200:
 *         description: Event reactivated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 event:
 *                   $ref: '#/components/schemas/Event'
 *       403:
 *         description: Admin privileges required
 *       404:
 *         description: Event not found
 */
router.patch('/:identifier/reactivate', requireAdmin, reactivateEventByIdentifier);

/**
 * @swagger
 * /api/event/hard/{identifier}:
 *   delete:
 *     summary: 'Permanently delete an event by ID or name (Admin only)'
 *     tags: [Administration - Events]
 *     security:
 *       - userRole: []
 *     parameters:
 *       - in: path
 *         name: identifier
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID or event name
 *     responses:
 *       200:
 *         description: Event permanently deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 event:
 *                   $ref: '#/components/schemas/Event'
 *       403:
 *         description: Admin privileges required
 *       404:
 *         description: Event not found
 */
router.delete('/hard/:identifier', requireAdmin, deleteEventByIdentifier);

export default router;