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
    joinEvent,
    leaveEvent
} from '../controller/eventController';
import { authenticateToken } from '../auth/middleware';
import { requireAdmin, requireAdminOrManager } from '../middleware/roleMiddleware';

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
 *             type: string
 *           description: Array de IDs de usuarios participantes
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
 */

// --- RUTAS PÚBLICAS ---
/**
 * @swagger
 * /api/event:
 *   get:
 *     summary: Get all active events (paginated)
 *     tags: [Events - Public]
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
 * /api/event/stats:
 *   get:
 *     summary: Get event statistics
 *     tags: [Events - Public]
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
 *     tags: [Events - Public]
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

// --- RUTAS AUTENTICADAS (CUALQUIER USUARIO) ---
/**
 * @swagger
 * /api/event/{identifier}/join:
 *   post:
 *     summary: Join an event as authenticated user
 *     tags: [Events - Authenticated]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: identifier
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID or event name
 *     responses:
 *       200:
 *         description: Successfully joined the event
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
 *         description: User ID not found in token
 *       401:
 *         description: Unauthorized - Token required
 *       404:
 *         description: Event not found
 */
router.post('/:identifier/join', authenticateToken, joinEvent);

/**
 * @swagger
 * /api/event/{identifier}/leave:
 *   post:
 *     summary: Leave an event as authenticated user
 *     tags: [Events - Authenticated]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: identifier
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID or event name
 *     responses:
 *       200:
 *         description: Successfully left the event
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
 *         description: User ID not found in token
 *       401:
 *         description: Unauthorized - Token required
 *       404:
 *         description: Event not found
 */
router.post('/:identifier/leave', authenticateToken, leaveEvent);

// --- RUTAS ADMIN ONLY ---
/**
 * @swagger
 * /api/event/with-inactive:
 *   get:
 *     summary: Get all events including inactive ones (paginated) - Admin only
 *     tags: [Events - Admin Only]
 *     security:
 *       - bearerAuth: []
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
 *       401:
 *         description: Unauthorized - Token required
 *       403:
 *         description: Admin privileges required
 *       404:
 *         description: No events found
 */
router.get('/with-inactive', authenticateToken, requireAdmin, getAllEventsWithInactive);

/**
 * @swagger
 * /api/event:
 *   post:
 *     summary: Create a new event - Admin only
 *     tags: [Events - Admin Only]
 *     security:
 *       - bearerAuth: []
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
 *       401:
 *         description: Unauthorized - Token required
 *       403:
 *         description: Admin privileges required
 *       500:
 *         description: Failed to create event
 */
router.post('/', authenticateToken, requireAdmin, createEvent);

/**
 * @swagger
 * /api/event/{identifier}/disable:
 *   patch:
 *     summary: Disable an event by ID or name - Admin only
 *     tags: [Events - Admin Only]
 *     security:
 *       - bearerAuth: []
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
 *       401:
 *         description: Unauthorized - Token required
 *       403:
 *         description: Admin privileges required
 *       404:
 *         description: Event not found
 */
router.patch('/:identifier/disable', authenticateToken, requireAdmin, disableEventByIdentifier);

/**
 * @swagger
 * /api/event/{identifier}/reactivate:
 *   patch:
 *     summary: Reactivate an event by ID or name - Admin only
 *     tags: [Events - Admin Only]
 *     security:
 *       - bearerAuth: []
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
 *       401:
 *         description: Unauthorized - Token required
 *       403:
 *         description: Admin privileges required
 *       404:
 *         description: Event not found
 */
router.patch('/:identifier/reactivate', authenticateToken, requireAdmin, reactivateEventByIdentifier);

/**
 * @swagger
 * /api/event/hard/{identifier}:
 *   delete:
 *     summary: Permanently delete an event by ID or name - Admin only
 *     tags: [Events - Admin Only]
 *     security:
 *       - bearerAuth: []
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
 *       401:
 *         description: Unauthorized - Token required
 *       403:
 *         description: Admin privileges required
 *       404:
 *         description: Event not found
 */
router.delete('/hard/:identifier', authenticateToken, requireAdmin, deleteEventByIdentifier);

// --- RUTAS ADMIN/MANAGER ---
/**
 * @swagger
 * /api/event/{identifier}/add-user:
 *   post:
 *     summary: Add user to an event by ID or name - Admin or Manager only
 *     tags: [Events - Admin/Manager]
 *     security:
 *       - bearerAuth: []
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
 *       401:
 *         description: Unauthorized - Token required
 *       403:
 *         description: Admin or manager privileges required
 *       404:
 *         description: Event or user not found
 */
router.post('/:identifier/add-user', authenticateToken, requireAdminOrManager, addUserToEvent);

/**
 * @swagger
 * /api/event/{identifier}/remove-user:
 *   post:
 *     summary: Remove user from an event by ID or name - Admin or Manager only
 *     tags: [Events - Admin/Manager]
 *     security:
 *       - bearerAuth: []
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
 *       401:
 *         description: Unauthorized - Token required
 *       403:
 *         description: Admin or manager privileges required
 *       404:
 *         description: Event or user not found
 */
router.post('/:identifier/remove-user', authenticateToken, requireAdminOrManager, removeUserFromEvent);

/**
 * @swagger
 * /api/event/{identifier}:
 *   patch:
 *     summary: Update event details by ID or name - Admin or Manager only
 *     tags: [Events - Admin/Manager]
 *     security:
 *       - bearerAuth: []
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
 *       401:
 *         description: Unauthorized - Token required
 *       403:
 *         description: Admin or manager privileges required
 *       404:
 *         description: Event not found
 */
router.patch('/:identifier', authenticateToken, requireAdminOrManager, updateEventByIdentifier);

export default router;