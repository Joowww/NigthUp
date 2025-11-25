import { Router } from 'express';
import {
    createUserPost,
    createEventPost,
    getPostById,
    getEventPosts,
    getUserPosts,
    deletePost,
    likePost,
    unlikePost,
    addComment,
    deleteComment,
    getDiscoverFeed,
    getFriendsFeed,
    searchPosts
} from '../controller/postController';
import { authenticateToken } from '../auth/middleware';
import { requireAdminOrManager } from '../middleware/roleMiddleware';
import { uploadPostMedia } from '../middleware/upload';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Post:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         authorId:
 *           type: string
 *         authorType:
 *           type: string
 *           enum: [User, Event]
 *         caption:
 *           type: string
 *         media:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               url:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [image, video]
 *         likes:
 *           type: array
 *           items:
 *             type: string
 *         comments:
 *           type: array
 *           items:
 *             type: object
 *         location:
 *           type: string
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *         isPublic:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 */

// ============ CREAR POSTS ============
/**
 * @swagger
 * /api/post/user:
 *   post:
 *     summary: Crear post de usuario con imagen/video
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - caption
 *             properties:
 *               caption:
 *                 type: string
 *                 example: "¡Qué noche increíble! 🎉"
 *               media:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Hasta 5 archivos (imágenes o videos)
 *               location:
 *                 type: string
 *                 example: "Madrid, Spain"
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["tag1_id", "tag2_id"]
 *               isPublic:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Post creado exitosamente
 *       400:
 *         description: Error en los datos
 *       401:
 *         description: No autenticado
 */
router.post('/user', authenticateToken, uploadPostMedia, createUserPost);

/**
 * @swagger
 * /api/post/event:
 *   post:
 *     summary: Crear post de evento (admin/manager)
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - eventId
 *               - caption
 *             properties:
 *               eventId:
 *                 type: string
 *                 example: "673f1234567890abcdef1234"
 *               caption:
 *                 type: string
 *                 example: "¡Esta noche será épica!"
 *               media:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               location:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               isPublic:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Post de evento creado
 *       403:
 *         description: Sin permisos
 */
router.post('/event', authenticateToken, requireAdminOrManager, uploadPostMedia, createEventPost);

// ============ FEEDS ============
/**
 * @swagger
 * /api/post/feed/discover:
 *   get:
 *     summary: Feed de descubrimiento
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *           default: 0
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Feed obtenido exitosamente
 */
router.get('/feed/discover', authenticateToken, getDiscoverFeed);

/**
 * @swagger
 * /api/post/feed/friends:
 *   get:
 *     summary: Feed de amigos
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *           default: 0
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Feed de amigos obtenido
 */
router.get('/feed/friends', authenticateToken, getFriendsFeed);

// ============ OBTENER POSTS ============
/**
 * @swagger
 * /api/post/event/{eventId}:
 *   get:
 *     summary: Obtener posts de un evento
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Posts del evento
 */
router.get('/event/:eventId', getEventPosts);

/**
 * @swagger
 * /api/post/user/{userId}:
 *   get:
 *     summary: Obtener posts de un usuario
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Posts del usuario
 */
router.get('/user/:userId', getUserPosts);

/**
 * @swagger
 * /api/post/{postId}:
 *   get:
 *     summary: Obtener un post específico
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post obtenido
 */
router.get('/:postId', getPostById);

/**
 * @swagger
 * /api/post/search:
 *   get:
 *     summary: Buscar posts
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Resultados de búsqueda
 */
router.get('/search', searchPosts);

// ============ INTERACCIONES ============
/**
 * @swagger
 * /api/post/{postId}/like:
 *   post:
 *     summary: Dar like a un post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Like añadido
 */
router.post('/:postId/like', authenticateToken, likePost);

/**
 * @swagger
 * /api/post/{postId}/unlike:
 *   post:
 *     summary: Quitar like
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Like quitado
 */
router.post('/:postId/unlike', authenticateToken, unlikePost);

/**
 * @swagger
 * /api/post/{postId}/comment:
 *   post:
 *     summary: Añadir comentario
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
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
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 example: "¡Qué buena foto!"
 *     responses:
 *       200:
 *         description: Comentario añadido
 */
router.post('/:postId/comment', authenticateToken, addComment);

/**
 * @swagger
 * /api/post/{postId}/comment/{commentIndex}:
 *   delete:
 *     summary: Eliminar comentario
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: commentIndex
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Comentario eliminado
 */
router.delete('/:postId/comment/:commentIndex', authenticateToken, deleteComment);

// ============ ELIMINAR POST ============
/**
 * @swagger
 * /api/post/{postId}:
 *   delete:
 *     summary: Eliminar post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post eliminado
 */
router.delete('/:postId', authenticateToken, deletePost);

export default router;
