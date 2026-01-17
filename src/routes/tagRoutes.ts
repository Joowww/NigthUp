import { Router } from 'express';
import {
    createTag,
    getAllTags,
    getTagById,
    updateTag,
    deleteTag,
    getTagStats,
    getTagsByEvent,
    getTagsByType
} from '../controller/tagController';
import { authenticateToken } from '../auth/middleware';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Tag:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         _id:
 *           type: string
 *           description: ID único del tag
 *         name:
 *           type: string
 *           example: "Techno"
 *         description:
 *           type: string
 *           example: "Música techno y electrónica"
 *         color:
 *           type: string
 *           example: "#3b82f6"
 *         events:
 *           type: array
 *           items:
 *             type: string
 *           description: Array de IDs de eventos
 *         active:
 *           type: boolean
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     TagCreate:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           example: "Techno"
 *         description:
 *           type: string
 *           example: "Música techno y electrónica"
 *         color:
 *           type: string
 *           example: "#3b82f6"
 *     TagStats:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *           description: Total de tags
 *         active:
 *           type: integer
 *           description: Tags activos
 *         inactive:
 *           type: integer
 *           description: Tags inactivos
 *         mostUsed:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               tag:
 *                 $ref: '#/components/schemas/Tag'
 *               count:
 *                 type: integer
 */

/**
 * @swagger
 * /api/tag:
 *   get:
 *     summary: Obtener todos los tags activos (paginado)
 *     tags: [Tags]
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
 *         description: Lista de tags activos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tags:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Tag'
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
 *         description: No se encontraron tags
 */
router.get('/', getAllTags);

/**
 * @swagger
 * /api/tag/stats:
 *   get:
 *     summary: Obtener estadísticas de tags
 *     tags: [Tags]
 *     responses:
 *       200:
 *         description: Estadísticas de tags
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TagStats'
 *       500:
 *         description: Error del servidor
 */
router.get('/stats', getTagStats);

/**
 * @swagger
 * /api/tag/event/{eventId}:
 *   get:
 *     summary: Obtener todos los tags de un evento específico
 *     tags: [Tags]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del evento
 *     responses:
 *       200:
 *         description: Lista de tags del evento
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Tag'
 *       500:
 *         description: Error del servidor
 */
router.get('/event/:eventId', getTagsByEvent);

/**
 * @swagger
 * /api/tag/type/{type}:
 *   get:
 *     summary: Get tags by specific type
 *     tags: [Tags]
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [MusicType, Musician, EventType, ChildhoodIdol]
 *         description: Type of tags to retrieve
 *     responses:
 *       200:
 *         description: List of tags by type
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Tag'
 *       400:
 *         description: Invalid tag type
 *       500:
 *         description: Server error
 */
router.get('/type/:type', getTagsByType);

/**
 * @swagger
 * /api/tag/{id}:
 *   get:
 *     summary: Obtener tag por ID
 *     tags: [Tags]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del tag
 *     responses:
 *       200:
 *         description: Tag encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tag'
 *       404:
 *         description: Tag no encontrado
 */
router.get('/:id', getTagById);

/**
 * @swagger
 * /api/tag:
 *   post:
 *     summary: Crear una nueva valoración
 *     tags: [Tags]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TagCreate'
 *     responses:
 *       201:
 *         description: Tag creado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tag'
 *       400:
 *         description: Error en los datos de entrada
 *       500:
 *         description: Error del servidor
 */
router.post('/', createTag);

/**
 * @swagger
 * /api/tag/{id}:
 *   patch:
 *     summary: Actualizar un tag
 *     tags: [Tags]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del tag
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
 *         description: Tag actualizado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tag'
 *       400:
 *         description: Error en los datos de entrada
 *       404:
 *         description: Tag no encontrado
 *       500:
 *         description: Error del servidor
 */
router.patch('/:id', updateTag);

/**
 * @swagger
 * /api/tag/{id}:
 *   delete:
 *     summary: Eliminar un tag
 *     tags: [Tags]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del tag
 *     responses:
 *       200:
 *         description: Tag eliminado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 deletedTag:
 *                   $ref: '#/components/schemas/Tag'
 *       404:
 *         description: Tag no encontrado
 *       500:
 *         description: Error del servidor
 */
router.delete('/:id', deleteTag);

export default router;