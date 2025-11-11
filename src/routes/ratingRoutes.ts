import { Router } from 'express';
import {
    createRating,
    getRatings,
    getRatingById,
    updateRating,
    deleteRating,
    getEventRatingStats,
    getRatingsByEvent,
    getUserEventRating,
    getRatingsByUser
} from '../controller/ratingController';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Rating:
 *       type: object
 *       required:
 *         - event
 *         - username
 *         - score
 *       properties:
 *         _id:
 *           type: string
 *           description: ID único generado por MongoDB
 *         event:
 *           type: string
 *           description: ID del evento valorado
 *         username:
 *           type: string
 *           description: Username del usuario que realiza la valoración
 *         score:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *           description: Puntuación de 1 a 5 estrellas
 *           example: 5
 *         comment:
 *           type: string
 *           description: Comentario opcional
 *           example: "¡Excelente evento!"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     RatingCreate:
 *       type: object
 *       required:
 *         - event
 *         - username
 *         - score
 *       properties:
 *         event:
 *           type: string
 *           description: ID del evento
 *           example: "674alb5c8d9e2f3a4b5c6d7e"
 *         username:
 *           type: string
 *           description: Username del usuario
 *           example: "JoelMoreno"
 *         score:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *           description: Puntuación de 1 a 5
 *           example: 5
 *         comment:
 *           type: string
 *           description: Comentario opcional
 *           example: "¡Excelente evento!"
 *     RatingStats:
 *       type: object
 *       properties:
 *         average:
 *           type: number
 *           format: float
 *           description: Puntuación promedio
 *           example: 4.5
 *         count:
 *           type: integer
 *           description: Número total de valoraciones
 *           example: 10
 */

// --- POST ---
/**
 * @swagger
 * /api/rating:
 *   post:
 *     summary: Crear una nueva valoración
 *     tags: [Ratings - Public]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RatingCreate'
 *     responses:
 *       201:
 *         description: Valoración creada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Rating'
 *       400:
 *         description: Error en los datos de entrada o el usuario ya valoró este evento
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Ya has valorado este evento"
 *       500:
 *         description: Error del servidor
 */
router.post('/', createRating);

// --- GET ---
/**
 * @swagger
 * /api/rating:
 *   get:
 *     summary: Obtener listado de valoraciones (paginado)
 *     tags: [Ratings - Public]
 *     parameters:
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Número de registros a saltar
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Número máximo de registros a retornar
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por ID de evento, username o comentario
 *     responses:
 *       200:
 *         description: Listado de valoraciones
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ratings:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Rating'
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
 *       500:
 *         description: Error del servidor
 */
router.get('/', getRatings);

/**
 * @swagger
 * /api/rating/event/{eventId}:
 *   get:
 *     summary: Obtener todas las valoraciones de un evento específico
 *     tags: [Ratings - Public]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del evento
 *     responses:
 *       200:
 *         description: Lista de valoraciones del evento
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Rating'
 *       500:
 *         description: Error del servidor
 */
router.get('/event/:eventId', getRatingsByEvent);

/**
 * @swagger
 * /api/rating/event/{eventId}/stats:
 *   get:
 *     summary: Obtener estadísticas de valoraciones de un evento
 *     tags: [Ratings - Public]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del evento
 *     responses:
 *       200:
 *         description: Estadísticas del evento
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RatingStats'
 *       500:
 *         description: Error del servidor
 */
router.get('/event/:eventId/stats', getEventRatingStats);

/**
 * @swagger
 * /api/rating/user/{username}:
 *   get:
 *     summary: Obtener todas las valoraciones de un usuario específico
 *     tags: [Ratings - Public]
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: Username del usuario
 *     responses:
 *       200:
 *         description: Lista de valoraciones del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Rating'
 *       500:
 *         description: Error del servidor
 */
router.get('/user/:username', getRatingsByUser);

/**
 * @swagger
 * /api/rating/user/{username}/event/{eventId}:
 *   get:
 *     summary: Obtener la valoración de un usuario específico para un evento
 *     tags: [Ratings - Public]
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: Username del usuario
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del evento
 *     responses:
 *       200:
 *         description: Valoración del usuario para el evento
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Rating'
 *       404:
 *         description: No existe valoración
 *       500:
 *         description: Error del servidor
 */
router.get('/user/:username/event/:eventId', getUserEventRating);

/**
 * @swagger
 * /api/rating/{id}:
 *   get:
 *     summary: Obtener una valoración por ID
 *     tags: [Ratings - Public]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la valoración
 *     responses:
 *       200:
 *         description: Valoración encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Rating'
 *       404:
 *         description: Valoración no encontrada
 *       500:
 *         description: Error del servidor
 */
router.get('/:id', getRatingById);

// --- PATCH ---
/**
 * @swagger
 * /api/rating/{id}:
 *   patch:
 *     summary: Actualizar una valoración
 *     tags: [Ratings - Public]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la valoración
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               score:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Nueva puntuación
 *               comment:
 *                 type: string
 *                 description: Nuevo comentario
 *     responses:
 *       200:
 *         description: Valoración actualizada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Rating'
 *       400:
 *         description: Error en los datos de entrada
 *       404:
 *         description: Valoración no encontrada
 *       500:
 *         description: Error del servidor
 */
router.patch('/:id', updateRating);

// --- DELETE ---
/**
 * @swagger
 * /api/rating/{id}:
 *   delete:
 *     summary: Eliminar una valoración
 *     tags: [Ratings - Public]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la valoración
 *     responses:
 *       200:
 *         description: Valoración eliminada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Valoración eliminada correctamente"
 *                 deletedRating:
 *                   $ref: '#/components/schemas/Rating'
 *       404:
 *         description: Valoración no encontrada
 *       500:
 *         description: Error del servidor
 */
router.delete('/:id', deleteRating);

export default router;