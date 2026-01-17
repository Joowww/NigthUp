// Backend: src/controller/notificationController.ts

import { Request, Response } from 'express';
import { NotificationService } from '../services/notificationServices';

const notificationService = new NotificationService();

/**
 * Obtener todas las notificaciones del usuario autenticado
 */
export async function getMyNotifications(req: Request, res: Response): Promise<Response> {
  try {
    const userId = (req as any).user.id;
    
    const data = await notificationService.getNotifications(userId);

    console.log(`📬 [getMyNotifications] Usuario ${userId} tiene ${data.notifications.length} notificaciones, ${data.unreadCount} sin leer`);

    return res.status(200).json(data);
  } catch (error) {
    console.error('❌ [getMyNotifications] Error:', error);
    return res.status(500).json({ error: (error as Error).message });
  }
}

/**
 * Marcar una notificación como leída
 */
export async function markNotificationAsRead(req: Request, res: Response): Promise<Response> {
  try {
    const userId = (req as any).user.id;
    const { notificationId } = req.params;

    await notificationService.markAsRead(notificationId, userId);

    return res.status(200).json({ message: 'Notificación marcada como leída' });
  } catch (error) {
    console.error('❌ [markNotificationAsRead] Error:', error);
    return res.status(500).json({ error: (error as Error).message });
  }
}

/**
 * Marcar todas las notificaciones como leídas
 */
export async function markAllNotificationsAsRead(req: Request, res: Response): Promise<Response> {
  try {
    const userId = (req as any).user.id;

    const count = await notificationService.markAllAsRead(userId);

    return res.status(200).json({ 
      message: 'Todas las notificaciones marcadas como leídas',
      count
    });
  } catch (error) {
    console.error('❌ [markAllNotificationsAsRead] Error:', error);
    return res.status(500).json({ error: (error as Error).message });
  }
}

/**
 * Eliminar una notificación
 */
export async function deleteNotification(req: Request, res: Response): Promise<Response> {
  try {
    const userId = (req as any).user.id;
    const { notificationId } = req.params;

    await notificationService.deleteNotification(notificationId, userId);

    return res.status(200).json({ message: 'Notificación eliminada' });
  } catch (error) {
    console.error('❌ [deleteNotification] Error:', error);
    return res.status(500).json({ error: (error as Error).message });
  }
}

/**
 * Obtener contador de notificaciones sin leer
 */
export async function getUnreadCount(req: Request, res: Response): Promise<Response> {
  try {
    const userId = (req as any).user.id;

    const count = await notificationService.getUnreadCount(userId);

    return res.status(200).json({ unreadCount: count });
  } catch (error) {
    console.error('❌ [getUnreadCount] Error:', error);
    return res.status(500).json({ error: (error as Error).message });
  }
}