// src/controller/notificationController.ts (NUEVO ARCHIVO)

import { Request, Response } from 'express';
import { Notification } from '../models/notification';

/**
 * Obtener todas las notificaciones del usuario autenticado
 */
export async function getMyNotifications(req: Request, res: Response): Promise<Response> {
  try {
    const userId = (req as any).user.id;
    
    const notifications = await Notification.find({ recipient: userId })
      .populate('sender', 'username avatar firstName lastName')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const unreadCount = await Notification.countDocuments({ 
      recipient: userId, 
      read: false 
    });

    console.log(`📬 [getMyNotifications] Usuario ${userId} tiene ${notifications.length} notificaciones, ${unreadCount} sin leer`);

    return res.status(200).json({
      notifications,
      unreadCount
    });
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

    const updated = await Notification.updateOne(
      { _id: notificationId, recipient: userId },
      { $set: { read: true } }
    );

    if (updated.matchedCount === 0) {
      return res.status(404).json({ error: 'Notificación no encontrada' });
    }

    console.log(`✅ [markNotificationAsRead] Notificación ${notificationId} marcada como leída`);

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

    const updated = await Notification.updateMany(
      { recipient: userId, read: false },
      { $set: { read: true } }
    );

    console.log(`✅ [markAllNotificationsAsRead] ${updated.modifiedCount} notificaciones marcadas como leídas`);

    return res.status(200).json({ 
      message: 'Todas las notificaciones marcadas como leídas',
      count: updated.modifiedCount
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

    const deleted = await Notification.deleteOne({
      _id: notificationId,
      recipient: userId
    });

    if (deleted.deletedCount === 0) {
      return res.status(404).json({ error: 'Notificación no encontrada' });
    }

    console.log(`🗑️ [deleteNotification] Notificación ${notificationId} eliminada`);

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

    const count = await Notification.countDocuments({ 
      recipient: userId, 
      read: false 
    });

    return res.status(200).json({ unreadCount: count });
  } catch (error) {
    console.error('❌ [getUnreadCount] Error:', error);
    return res.status(500).json({ error: (error as Error).message });
  }
}