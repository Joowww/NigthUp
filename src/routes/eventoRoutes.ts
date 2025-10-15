import { Router } from 'express';
import {
  createEvento,
  getAllEventos,
  getAllEventosWithInactive,
  getEventoById,
  disableEventoById,
  reactivateEventoById,
  deleteEventoById
} from '../controller/eventoController';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Evento:
 *       type: object
 *       required:
 *         - name
 *         - schedule
 *       properties:
 *         id:
 *           type: string
 *           description: ID generado por MongoDB
 *         name:
 *           type: string
 *         schedule:
 *           type: string
 *         address:
 *           type: string
 *         active:
 *           type: boolean
 *           description: Indica si el evento está activo
 *       example:
 *         name: "Conferencia de Tecnología"
 *         schedule: "2024-01-15T10:00:00Z"
 *         address: "Auditorio Principal"
 *         active: true
 */

/**
 * @swagger
 * /api/event:
 *   get:
 *     summary: Obtener todos los eventos activos (paginated)
 *     tags: [Eventos]
 *     parameters:
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *         description: Número de registros a saltar (paginación)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Número de registros a devolver (paginación)
 *     responses:
 *       200:
 *         description: Lista de eventos activos obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 eventos:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Evento'
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
router.get('/', getAllEventos);

/**
 * @swagger
 * /api/event/all/inactive-included:
 *   get:
 *     summary: Obtener todos los eventos incluyendo inactivos (paginated) - Solo admin
 *     tags: [Eventos]
 *     parameters:
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *         description: Número de registros a saltar (paginación)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Número de registros a devolver (paginación)
 *     responses:
 *       200:
 *         description: Lista de todos los eventos obtenida exitosamente
 */
router.get('/all/inactive-included', getAllEventosWithInactive);

/**
 * @swagger
 * /api/event:
 *   post:
 *     summary: Crear un nuevo evento
 *     tags: [Eventos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Evento'
 *     responses:
 *       201:
 *         description: Evento creado exitosamente
 *       400:
 *         description: Error en los datos del evento
 */
router.post('/', createEvento);

/**
 * @swagger
 * /api/event/{id}:
 *   get:
 *     summary: Obtener un evento activo por ID
 *     tags: [Eventos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del evento
 *     responses:
 *       200:
 *         description: Evento encontrado
 *       404:
 *         description: Evento no encontrado
 */
router.get('/:id', getEventoById);

/**
 * @swagger
 * /api/event/{id}:
 *   delete:
 *     summary: Deshabilitar un evento por ID (Soft Delete)
 *     tags: [Eventos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del evento
 *     responses:
 *       200:
 *         description: Evento deshabilitado exitosamente
 *       404:
 *         description: Evento no encontrado
 */
router.put('/:id', disableEventoById);

/**
 * @swagger
 * /api/event/{id}/reactivate:
 *   put:
 *     summary: Reactivar un evento por ID
 *     tags: [Eventos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del evento
 *     responses:
 *       200:
 *         description: Evento reactivado exitosamente
 *       404:
 *         description: Evento no encontrado
 */
router.put('/:id/reactivate', reactivateEventoById);

/**
 * @swagger
 * /api/event/hard/{id}:
 *   delete:
 *     summary: Eliminar permanentemente un evento por ID (Hard Delete) - Solo admin
 *     tags: [Eventos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del evento
 *     responses:
 *       200:
 *         description: Evento eliminado permanentemente
 *       404:
 *         description: Evento no encontrado
 */
router.delete('/hard/:id', deleteEventoById);

export default router;