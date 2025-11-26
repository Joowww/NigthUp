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
    searchPosts
} from '../controller/postController';
import { authenticateToken } from '../auth/middleware';
import { requireAdminOrManager } from '../middleware/roleMiddleware';
import { uploadPostMedia } from '../middleware/upload';

const router = Router();

// ============ CREAR POSTS ============
router.post('/user', authenticateToken, uploadPostMedia, createUserPost);
router.post('/event', authenticateToken, requireAdminOrManager, uploadPostMedia, createEventPost);

// ============ FEEDS ============
router.get('/feed/discover', authenticateToken, getDiscoverFeed);
router.get('/feed/friends', authenticateToken, getFriendsFeed);
router.get('/feed/for-you', authenticateToken, getForYouFeed);

// ============ OBTENER POSTS ============
router.get('/event/:eventId', getEventPosts);
router.get('/user/:userId', getUserPosts);
router.get('/:postId', getPostById);
router.get('/search', searchPosts);

// ============ INTERACCIONES ============
router.post('/:postId/like', authenticateToken, likePost);
router.post('/:postId/unlike', authenticateToken, unlikePost);
router.post('/:postId/comment', authenticateToken, addComment);
router.delete('/:postId/comment/:commentIndex', authenticateToken, deleteComment);

// ============ ELIMINAR POST ============
router.delete('/:postId', authenticateToken, deletePost);

export default router;