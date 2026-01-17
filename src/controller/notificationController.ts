import { Request, Response } from 'express';
import { NotificationService } from '../services/notificationServices';

const notificationService = new NotificationService();

export async function getMyNotifications(req: Request, res: Response): Promise<Response> {
  try {
    const userId = (req as any).user.id;

    const data = await notificationService.getNotifications(userId);

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
}

export async function markNotificationAsRead(req: Request, res: Response): Promise<Response> {
  try {
    const userId = (req as any).user.id;
    const { notificationId } = req.params;

    await notificationService.markAsRead(notificationId, userId);

    return res.status(200).json({ message: 'Notificación marcada como leída' });
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
}

export async function markAllNotificationsAsRead(req: Request, res: Response): Promise<Response> {
  try {
    const userId = (req as any).user.id;

    const count = await notificationService.markAllAsRead(userId);

    return res.status(200).json({
      message: 'Todas las notificaciones marcadas como leídas',
      count
    });
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
}

export async function deleteNotification(req: Request, res: Response): Promise<Response> {
  try {
    const userId = (req as any).user.id;
    const { notificationId } = req.params;

    await notificationService.deleteNotification(notificationId, userId);

    return res.status(200).json({ message: 'Notificación eliminada' });
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
}

export async function getUnreadCount(req: Request, res: Response): Promise<Response> {
  try {
    const userId = (req as any).user.id;

    const count = await notificationService.getUnreadCount(userId);

    return res.status(200).json({ unreadCount: count });
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
}