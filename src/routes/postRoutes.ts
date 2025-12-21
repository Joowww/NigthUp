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
    getForYouFeed,
    searchPosts,
    createPost,
    getPostComments
} from '../controller/postController';
import { authenticateToken } from '../auth/middleware';
import { requireAdminOrManager } from '../middleware/roleMiddleware';
import { uploadPostMedia, uploadSinglePostFile } from '../middleware/upload';

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
 *         user:
 *           $ref: '#/components/schemas/User'
 *         event:
 *           type: string
 *         caption:
 *           type: string
 *         media:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [image, video]
 *               url:
 *                 type: string
 *               thumbnail:
 *                 type: string
 *         likes:
 *           type: array
 *           items:
 *             type: string
 *         comments:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Comment'
 *         likesCount:
 *           type: number
 *         commentCount:
 *           type: number
 *         isVideo:
 *           type: boolean
 *         music:
 *           type: object
 *           properties:
 *             title:
 *               type: string
 *             artist:
 *               type: string
 *             coverUrl:
 *               type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *     Comment:
 *       type: object
 *       properties:
 *         user:
 *           type: string
 *         text:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 */

// ============ CREAR POSTS ============

/**
 * @swagger
 * /api/post/create:
 *   post:
 *     summary: Create a new post (TikTok/Reels format)
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               caption:
 *                 type: string
 *               music:
 *                 type: string
 *                 description: JSON string of music object
 *     responses:
 *       201:
 *         description: Post created successfully
 */
router.post('/create', authenticateToken, uploadSinglePostFile, createPost);

/**
 * @swagger
 * /api/post/user:
 *   post:
 *     summary: Create a user post with multiple media files
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               media:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               caption:
 *                 type: string
 *     responses:
 *       201:
 *         description: Post created successfully
 */
router.post('/user', authenticateToken, uploadPostMedia, createUserPost);

/**
 * @swagger
 * /api/post/event:
 *   post:
 *     summary: Create an event post (Admin/Manager only)
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               media:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               caption:
 *                 type: string
 *               eventId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Post created successfully
 */
router.post('/event', authenticateToken, requireAdminOrManager, uploadPostMedia, createEventPost);

// ============ FEEDS ============

/**
 * @swagger
 * /api/post/feed/discover:
 *   get:
 *     summary: Get discovery feed
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 */
router.get('/feed/discover', authenticateToken, getDiscoverFeed);

/**
 * @swagger
 * /api/post/feed/friends:
 *   get:
 *     summary: Get friends feed (TikTok style vertical feed)
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of posts from friends
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 */
router.get('/feed/friends', authenticateToken, getFriendsFeed);

/**
 * @swagger
 * /api/post/feed/for-you:
 *   get:
 *     summary: Get personalized "For You" feed
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of recommended posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 */
router.get('/feed/for-you', authenticateToken, getForYouFeed);

// ============ OBTENER POSTS ============

/**
 * @swagger
 * /api/post/event/{eventId}:
 *   get:
 *     summary: Get all posts for a specific event
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of posts
 */
router.get('/event/:eventId', getEventPosts);

/**
 * @swagger
 * /api/post/user/{userId}:
 *   get:
 *     summary: Get all posts from a specific user
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of posts
 */
router.get('/user/:userId', getUserPosts);

/**
 * @swagger
 * /api/post/{postId}:
 *   get:
 *     summary: Get a post by ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 */
router.get('/:postId', getPostById);

/**
 * @swagger
 * /api/post/{postId}/comments:
 *   get:
 *     summary: Get comments for a post
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of comments
 */
router.get('/:postId/comments', getPostComments);

/**
 * @swagger
 * /api/post/search:
 *   get:
 *     summary: Search for posts
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Search results
 */
router.get('/search', searchPosts);

// ============ INTERACCIONES ============

/**
 * @swagger
 * /api/post/{postId}/like:
 *   post:
 *     summary: Like a post
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
 *         description: Post liked successfully
 */
router.post('/:postId/like', authenticateToken, likePost);

/**
 * @swagger
 * /api/post/{postId}/unlike:
 *   post:
 *     summary: Unlike a post
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
 *         description: Post unliked successfully
 */
router.post('/:postId/unlike', authenticateToken, unlikePost);

/**
 * @swagger
 * /api/post/{postId}/comment:
 *   post:
 *     summary: Add a comment to a post
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
 *             properties:
 *               text:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment added successfully
 */
router.post('/:postId/comment', authenticateToken, addComment);

/**
 * @swagger
 * /api/post/{postId}/comment/{commentIndex}:
 *   delete:
 *     summary: Delete a comment from a post
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
 *           type: number
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 */
router.delete('/:postId/comment/:commentIndex', authenticateToken, deleteComment);

// ============ ELIMINAR POST ============

/**
 * @swagger
 * /api/post/{postId}:
 *   delete:
 *     summary: Delete a post
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
 *         description: Post deleted successfully
 */
router.delete('/:postId', authenticateToken, deletePost);

export default router;