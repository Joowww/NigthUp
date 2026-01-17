// Backend: src/routes/notificationRoutes.ts

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

router.get('/', authenticateToken, getMyNotifications);
router.get('/unread-count', authenticateToken, getUnreadCount);
router.patch('/:notificationId/read', authenticateToken, markNotificationAsRead);
router.patch('/read-all', authenticateToken, markAllNotificationsAsRead);
router.delete('/:notificationId', authenticateToken, deleteNotification);

export default router;