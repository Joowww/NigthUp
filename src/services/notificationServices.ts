// src/services/notificationServices.ts
import { Notification, INotification } from '../models/notification';
import mongoose from 'mongoose';

export class NotificationService {

  /**
   * Crear una notificación (segura contra duplicados)
   */
  async createNotification(data: {
    recipient: string;
    sender: string;
    type: 'friend_request' | 'friend_accepted' | 'friend_rejected';
    friendshipId: string;
  }): Promise<INotification | null> {

    try {
      const notification = await Notification.create({
        recipient: new mongoose.Types.ObjectId(data.recipient),
        sender: new mongoose.Types.ObjectId(data.sender),
        type: data.type,
        friendshipId: new mongoose.Types.ObjectId(data.friendshipId),
        read: false
      });

      console.log('✅ [createNotification] Notificación creada:', notification._id);
      return notification;

    } catch (error: any) {
      // ✅ Duplicado detectado por índice único
      if (error.code === 11000) {
        console.log('⚠️ [createNotification] Notificación duplicada ignorada');
        return null;
      }
      throw error;
    }
  }

  /**
   * Obtener notificaciones del usuario
   */
  async getNotifications(userId: string): Promise<{ notifications: INotification[]; unreadCount: number }> {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const notifications = await Notification.find({ recipient: userObjectId })
      .populate('sender', 'username avatar firstName lastName')
      .sort({ createdAt: -1 })
      .lean();

    const unreadCount = notifications.filter((n) => !n.read).length;

    console.log('📬 [getNotifications]', {
      userId,
      total: notifications.length,
      unread: unreadCount
    });

    return {
      notifications: notifications as INotification[],
      unreadCount
    };
  }

  /**
   * Marcar una notificación como leída
   */
  async markAsRead(notificationId: string, userId: string): Promise<void> {
    const result = await Notification.updateOne(
      { _id: notificationId, recipient: userId },
      { $set: { read: true } }
    );

    if (result.matchedCount === 0) {
      throw new Error('Notificación no encontrada');
    }
  }

  /**
   * Marcar todas como leídas
   */
  async markAllAsRead(userId: string): Promise<number> {
    const result = await Notification.updateMany(
      { recipient: userId, read: false },
      { $set: { read: true } }
    );

    return result.modifiedCount;
  }

  /**
   * Eliminar notificación
   */
  async deleteNotification(notificationId: string, userId: string): Promise<void> {
    const result = await Notification.deleteOne({
      _id: notificationId,
      recipient: userId
    });

    if (result.deletedCount === 0) {
      throw new Error('Notificación no encontrada');
    }
  }

  /**
   * Contador de no leídas
   */
  async getUnreadCount(userId: string): Promise<number> {
    return Notification.countDocuments({
      recipient: userId,
      read: false
    });
  }
}
