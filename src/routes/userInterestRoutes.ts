import { Router } from 'express';
import {
    createUserInterest,
    getAllUserInterests,
    getUserInterestById,
    updateUserInterest,
    deleteUserInterest,
    getUserInterestStats,
    getUserInterestsByUser
} from '../controller/userInterestController';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     UserInterest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         _id:
 *           type: string
 *           description: ID único del interés
 *         name:
 *           type: string
 *           example: "Música Electrónica"
 *         description:
 *           type: string
 *           example: "Interés en eventos de música electrónica"
 *         color:
 *           type: string
 *           example: "#8b5cf6"
 *         users:
 *           type: array
 *           items:
 *             type: string
 *           description: Array de IDs de usuarios
 *         active:
 *           type: boolean
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     UserInterestCreate:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           example: "Música Electrónica"
 *         description:
 *           type: string
 *           example: "Interés en eventos de música electrónica"
 *         color:
 *           type: string
 *           example: "#8b5cf6"
 *     UserInterestStats:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *           description: Total de intereses
 *         active:
 *           type: integer
 *           description: Intereses activos
 *         inactive:
 *           type: integer
 *           description: Intereses inactivos
 *         mostPopular:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               interest:
 *                 $ref: '#/components/schemas/UserInterest'
 *               count:
 *                 type: integer
 */

// --- RUTAS PÚBLICAS ---
/**
 * @swagger
 * /api/user-interest:
 *   get:
 *     summary: Obtener todos los intereses de usuario activos (paginado)
 *     tags: [User Interests]
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
 *         description: Buscar por nombre o descripción
 *     responses:
 *       200:
 *         description: Lista de intereses activos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 interests:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UserInterest'
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
 *         description: No se encontraron intereses
 */
router.get('/', getAllUserInterests);

/**
 * @swagger
 * /api/user-interest/stats:
 *   get:
 *     summary: Obtener estadísticas de intereses
 *     tags: [User Interests]
 *     responses:
 *       200:
 *         description: Estadísticas de intereses
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserInterestStats'
 *       500:
 *         description: Error del servidor
 */
router.get('/stats', getUserInterestStats);

/**
 * @swagger
 * /api/user-interest/user/{userId}:
 *   get:
 *     summary: Obtener intereses de un usuario específico
 *     tags: [User Interests]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Lista de intereses del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserInterest'
 *       404:
 *         description: Usuario no encontrado o sin intereses
 */
router.get('/user/:userId', getUserInterestsByUser);

/**
 * @swagger
 * /api/user-interest/{id}:
 *   get:
 *     summary: Obtener interés por ID
 *     tags: [User Interests]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del interés
 *     responses:
 *       200:
 *         description: Interés encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserInterest'
 *       404:
 *         description: Interés no encontrado
 */
router.get('/:id', getUserInterestById);

// --- POST (Público como ratings) ---
/**
 * @swagger
 * /api/user-interest:
 *   post:
 *     summary: Crear un nuevo interés de usuario
 *     tags: [User Interests]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserInterestCreate'
 *     responses:
 *       201:
 *         description: Interés creado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserInterest'
 *       400:
 *         description: Error en los datos de entrada
 *       500:
 *         description: Error del servidor
 */
router.post('/', createUserInterest);

// --- PATCH (Público como ratings) ---
/**
 * @swagger
 * /api/user-interest/{id}:
 *   patch:
 *     summary: Actualizar un interés de usuario
 *     tags: [User Interests]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del interés
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               color:
 *                 type: string
 *     responses:
 *       200:
 *         description: Interés actualizado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserInterest'
 *       400:
 *         description: Error en los datos de entrada
 *       404:
 *         description: Interés no encontrado
 *       500:
 *         description: Error del servidor
 */
router.patch('/:id', updateUserInterest);

// --- DELETE (Público como ratings) ---
/**
 * @swagger
 * /api/user-interest/{id}:
 *   delete:
 *     summary: Eliminar un interés de usuario
 *     tags: [User Interests]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del interés
 *     responses:
 *       200:
 *         description: Interés eliminado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 deletedInterest:
 *                   $ref: '#/components/schemas/UserInterest'
 *       404:
 *         description: Interés no encontrado
 *       500:
 *         description: Error del servidor
 */
router.delete('/:id', deleteUserInterest);

export default router;