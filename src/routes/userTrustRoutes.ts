import { Router } from 'express';
import {
    createTrustRating,
    getTrustRatings,
    getTrustRatingById,
    updateTrustRating,
    deleteTrustRating,
    getUserTrustStats,
    getTrustRatingsByUser,
    getTrustRatingsFromUser,
    getUserTrustSummary,
    getGlobalAverageTrust
} from '../controller/userTrustController';
import { authenticateToken } from '../auth/middleware';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     UserTrust:
 *       type: object
 *       required:
 *         - rated
 *         - score
 *         - context
 *       properties:
 *         _id:
 *           type: string
 *           description: ID único de la valoración
 *         rater:
 *           type: string
 *           description: ID del usuario que califica
 *         rated:
 *           type: string
 *           description: ID del usuario calificado
 *         score:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *           description: Puntuación de confianza (1-5)
 *         comment:
 *           type: string
 *           description: Comentario opcional
 *         context:
 *           type: string
 *           description: Contexto de la interacción
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     UserTrustCreate:
 *       type: object
 *       required:
 *         - rated
 *         - score
 *         - context
 *       properties:
 *         rated:
 *           type: string
 *           description: ID del usuario calificado
 *         score:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *           description: Puntuación de confianza (1-5)
 *         comment:
 *           type: string
 *           description: Comentario opcional
 *         context:
 *           type: string
 *           description: Contexto de la interacción
 *     UserTrustStats:
 *       type: object
 *       properties:
 *         average:
 *           type: number
 *           format: float
 *           description: Puntuación promedio
 *         count:
 *           type: integer
 *           description: Número total de valoraciones
 *         distribution:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               score:
 *                 type: integer
 *               count:
 *                 type: integer
 *     UserTrustSummary:
 *       type: object
 *       properties:
 *         userId:
 *           type: string
 *         username:
 *           type: string
 *         averageTrust:
 *           type: number
 *           format: float
 *         totalRatings:
 *           type: integer
 *         trustLevel:
 *           type: string
 *           enum: [high, medium, low]
 */

// --- RUTAS PÚBLICAS ---
/**
 * @swagger
 * /api/user-trust:
 *   get:
 *     summary: Obtener todas las valoraciones de confianza (paginado)
 *     tags: [User Trust]
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
 *         description: Buscar por ID de usuario, comentario o contexto
 *     responses:
 *       200:
 *         description: Lista de valoraciones de confianza
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ratings:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UserTrust'
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
router.get('/', getTrustRatings);

/**
 * @swagger
 * /api/user-trust/user/stats/{userId}:
 *   get:
 *     summary: Obtener estadísticas de confianza de un usuario
 *     tags: [User Trust]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Estadísticas de confianza
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserTrustStats'
 *       404:
 *         description: Usuario no encontrado
 */
router.get('/user/stats/:userId', getUserTrustStats);

/**
 * @swagger
 * /api/user-trust/user/ratings/{userId}:
 *   get:
 *     summary: Obtener valoraciones de confianza recibidas por un usuario
 *     tags: [User Trust]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Lista de valoraciones recibidas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserTrust'
 *       404:
 *         description: Usuario no encontrado
 */
router.get('/user/ratings/:userId', getTrustRatingsByUser);

/**
 * @swagger
 * /api/user-trust/user/from/{userId}:
 *   get:
 *     summary: Obtener valoraciones de confianza dadas por un usuario
 *     tags: [User Trust]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Lista de valoraciones dadas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserTrust'
 *       404:
 *         description: Usuario no encontrado
 */
router.get('/user/from/:userId', getTrustRatingsFromUser);

/**
 * @swagger
 * /api/user-trust/user/summary/{userId}:
 *   get:
 *     summary: Obtener resumen de confianza de un usuario
 *     tags: [User Trust]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Resumen de confianza
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserTrustSummary'
 *       404:
 *         description: Usuario no encontrado
 */
router.get('/user/summary/:userId', getUserTrustSummary);

/**
 * @swagger
 * /api/user-trust/average:
 *   get:
 *     summary: Get global average trust score
 *     tags: [User Trust]
 *     responses:
 *       200:
 *         description: Global average trust score returned
 */
router.get('/average', getGlobalAverageTrust);

/**
 * @swagger
 * /api/user-trust/{id}:
 *   get:
 *     summary: Obtener valoración de confianza por ID
 *     tags: [User Trust]
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
 *               $ref: '#/components/schemas/UserTrust'
 *       404:
 *         description: Valoración no encontrada
 */
router.get('/:id', getTrustRatingById);

// --- POST (Público como ratings) ---
/**
 * @swagger
 * /api/user-trust:
 *   post:
 *     summary: Crear una nueva valoración de confianza
 *     tags: [User Trust]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserTrustCreate'
 *     responses:
 *       201:
 *         description: Valoración creada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserTrust'
 *       400:
 *         description: Error en los datos de entrada o ya has valorado a este usuario en este contexto
 *       500:
 *         description: Error del servidor
 */
router.post('/', authenticateToken, createTrustRating);

// --- PATCH (Público como ratings) ---
/**
 * @swagger
 * /api/user-trust/{id}:
 *   patch:
 *     summary: Actualizar una valoración de confianza
 *     tags: [User Trust]
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
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Valoración actualizada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserTrust'
 *       400:
 *         description: Error en los datos de entrada
 *       404:
 *         description: Valoración no encontrada
 *       500:
 *         description: Error del servidor
 */
router.patch('/:id', updateTrustRating);

// --- DELETE (Público como ratings) ---
/**
 * @swagger
 * /api/user-trust/{id}:
 *   delete:
 *     summary: Eliminar una valoración de confianza
 *     tags: [User Trust]
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
 *                 deletedRating:
 *                   $ref: '#/components/schemas/UserTrust'
 *       404:
 *         description: Valoración no encontrada
 *       500:
 *         description: Error del servidor
 */
router.delete('/:id', deleteTrustRating);

export default router;