import { Router } from 'express';
import {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getUnreadCount
} from '../controller/notificationController';
import { authenticateToken } from '../auth/middleware';

const router = Router();

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Obtener todas las notificaciones del usuario
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', authenticateToken, getMyNotifications);

/**
 * @swagger
 * /api/notifications/unread-count:
 *   get:
 *     summary: Obtener cantidad de notificaciones sin leer
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 */
router.get('/unread-count', authenticateToken, getUnreadCount);

/**
 * @swagger
 * /api/notifications/{notificationId}/read:
 *   patch:
 *     summary: Marcar una notificación como leída
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 */
router.patch('/:notificationId/read', authenticateToken, markNotificationAsRead);

/**
 * @swagger
 * /api/notifications/read-all:
 *   patch:
 *     summary: Marcar todas las notificaciones como leídas
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 */
router.patch('/read-all', authenticateToken, markAllNotificationsAsRead);

/**
 * @swagger
 * /api/notifications/{notificationId}:
 *   delete:
 *     summary: Eliminar una notificación
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:notificationId', authenticateToken, deleteNotification);

export default router;