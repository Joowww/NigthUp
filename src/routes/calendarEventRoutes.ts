import { Router } from 'express';
import {
  createCalendarEvent,
  getCalendarEvents,
  updateCalendarEvent,
  deleteCalendarEvent,
  syncUserEvents,
  addReminder
} from '../controller/calendarEventController';
import { authenticateToken } from '../auth/middleware';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     CalendarEvent:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: ID único del evento de calendario
 *         title:
 *           type: string
 *           description: Título del evento
 *         description:
 *           type: string
 *           description: Descripción del evento
 *         startDate:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora de inicio
 *         endDate:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora de fin
 *         location:
 *           type: string
 *           description: Ubicación del evento
 *         category:
 *           type: string
 *           description: Categoría del evento
 *         isPrivate:
 *           type: boolean
 *           description: Si el evento es privado
 *         reminders:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               time:
 *                 type: number
 *                 description: Minutos antes del evento
 *               type:
 *                 type: string
 *                 enum: [email, notification]
 *         createdBy:
 *           type: string
 *           description: ID del usuario que creó el evento
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     CreateCalendarEvent:
 *       type: object
 *       required:
 *         - title
 *         - startDate
 *         - endDate
 *       properties:
 *         title:
 *           type: string
 *           example: "Reunión con el equipo"
 *         description:
 *           type: string
 *           example: "Planificación del sprint"
 *         startDate:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:00:00.000Z"
 *         endDate:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T11:00:00.000Z"
 *         location:
 *           type: string
 *           example: "Sala de conferencias A"
 *         category:
 *           type: string
 *           example: "trabajo"
 *         isPrivate:
 *           type: boolean
 *           default: false
 *     UpdateCalendarEvent:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         startDate:
 *           type: string
 *           format: date-time
 *         endDate:
 *           type: string
 *           format: date-time
 *         location:
 *           type: string
 *         category:
 *           type: string
 *         isPrivate:
 *           type: boolean
 *     Reminder:
 *       type: object
 *       required:
 *         - time
 *         - type
 *       properties:
 *         time:
 *           type: number
 *           example: 15
 *           description: Minutos antes del evento
 *         type:
 *           type: string
 *           enum: [email, notification]
 *           example: "notification"
 */

/**
 * @swagger
 * /api/calendar:
 *   post:
 *     summary: Create a new calendar event
 *     tags: [Calendar Events]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCalendarEvent'
 *     responses:
 *       201:
 *         description: Calendar event created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Evento de calendario creado correctamente"
 *                 event:
 *                   $ref: '#/components/schemas/CalendarEvent'
 *       400:
 *         description: Invalid event data or end date before start date
 *       401:
 *         description: Unauthorized - Token required
 */
router.post('/', authenticateToken, createCalendarEvent);

/**
 * @swagger
 * /api/calendar:
 *   get:
 *     summary: Get user's calendar events
 *     tags: [Calendar Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter events from this date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter events until this date
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 50
 *         description: Number of events to return
 *       - in: query
 *         name: skip
 *         schema:
 *           type: number
 *           default: 0
 *         description: Number of events to skip
 *     responses:
 *       200:
 *         description: Calendar events retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 events:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CalendarEvent'
 *                 total:
 *                   type: number
 *                   description: Total number of events
 *       401:
 *         description: Unauthorized - Token required
 *       404:
 *         description: No events found
 */
router.get('/', authenticateToken, getCalendarEvents);

/**
 * @swagger
 * /api/calendar/{eventId}:
 *   put:
 *     summary: Update calendar event
 *     tags: [Calendar Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: Calendar event ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCalendarEvent'
 *     responses:
 *       200:
 *         description: Calendar event updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Evento actualizado correctamente"
 *                 event:
 *                   $ref: '#/components/schemas/CalendarEvent'
 *       400:
 *         description: Invalid event data
 *       401:
 *         description: Unauthorized - Token required
 *       403:
 *         description: Not authorized to update this event
 *       404:
 *         description: Calendar event not found
 */
router.put('/:eventId', authenticateToken, updateCalendarEvent);

/**
 * @swagger
 * /api/calendar/{eventId}:
 *   delete:
 *     summary: Delete calendar event
 *     tags: [Calendar Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: Calendar event ID
 *     responses:
 *       200:
 *         description: Calendar event deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Evento eliminado correctamente"
 *       401:
 *         description: Unauthorized - Token required
 *       403:
 *         description: Not authorized to delete this event
 *       404:
 *         description: Calendar event not found
 */
router.delete('/:eventId', authenticateToken, deleteCalendarEvent);

/**
 * @swagger
 * /api/calendar/sync:
 *   get:
 *     summary: Sync user events with calendar
 *     tags: [Calendar Events]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Events synchronized successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Eventos sincronizados correctamente"
 *                 syncedEvents:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CalendarEvent'
 *                 newEvents:
 *                   type: number
 *                   description: Number of new events added
 *       401:
 *         description: Unauthorized - Token required
 *       500:
 *         description: Synchronization failed
 */
router.get('/sync', authenticateToken, syncUserEvents);

/**
 * @swagger
 * /api/calendar/{eventId}/reminder:
 *   post:
 *     summary: Add reminder to calendar event
 *     tags: [Calendar Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: Calendar event ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Reminder'
 *     responses:
 *       200:
 *         description: Reminder added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Recordatorio añadido correctamente"
 *                 event:
 *                   $ref: '#/components/schemas/CalendarEvent'
 *       400:
 *         description: Invalid reminder data
 *       401:
 *         description: Unauthorized - Token required
 *       403:
 *         description: Not authorized to add reminder to this event
 *       404:
 *         description: Calendar event not found
 */
router.post('/:eventId/reminder', authenticateToken, addReminder);

export default router;