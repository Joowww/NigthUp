// Backend: src/services/notificationServices.ts (NUEVO ARCHIVO)

import { Notification, INotification } from '../models/notification';
import mongoose from 'mongoose';

export class NotificationService {

  /**
   * Crear una notificación (elimina duplicados automáticamente)
   */
  async createNotification(data: {
    recipient: string;
    sender: string;
    type: 'friend_request' | 'friend_accepted';
    friendshipId: string;
  }): Promise<INotification> {
    
    const recipientObjectId = new mongoose.Types.ObjectId(data.recipient);
    const senderObjectId = new mongoose.Types.ObjectId(data.sender);

    // ✅ ELIMINAR NOTIFICACIONES DUPLICADAS ANTES DE CREAR
    const existingNotifications = await Notification.find({
      recipient: recipientObjectId,
      sender: senderObjectId,
      friendshipId: data.friendshipId,
      type: data.type
    });

    if (existingNotifications.length > 0) {
      console.log(`⚠️ [createNotification] Encontradas ${existingNotifications.length} notificaciones duplicadas, eliminando...`);
      
      // Eliminar todas las duplicadas
      await Notification.deleteMany({
        recipient: recipientObjectId,
        sender: senderObjectId,
        friendshipId: data.friendshipId,
        type: data.type
      });
      
      console.log('✅ [createNotification] Duplicados eliminados');
    }

    // ✅ CREAR NUEVA NOTIFICACIÓN
    const notification = await Notification.create({
      recipient: recipientObjectId,
      sender: senderObjectId,
      type: data.type,
      friendshipId: data.friendshipId,
      read: false
    });

    console.log('✅ [createNotification] Notificación creada:', notification._id);

    return notification;
  }

  /**
   * Obtener notificaciones de un usuario
   */
  async getNotifications(userId: string): Promise<{ notifications: INotification[]; unreadCount: number }> {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // ✅ OBTENER TODAS LAS NOTIFICACIONES
    const notifications = await Notification.find({ recipient: userObjectId })
      .populate('sender', 'username avatar firstName lastName')
      .sort({ createdAt: -1 })
      .lean();

    console.log(`📬 [getNotifications] Total notificaciones para ${userId}:`, notifications.length);

    // ✅ AGRUPAR POR friendshipId + type para eliminar duplicados
    const seen = new Map<string, any>();
    const duplicatesToDelete: string[] = [];

    const uniqueNotifications = notifications.reduce((acc, current) => {
      const key = `${current.friendshipId}-${current.type}`;
      
      if (!seen.has(key)) {
        // Primera vez que vemos esta combinación
        seen.set(key, current);
        acc.push(current);
      } else {
        // Es duplicada, marcar para eliminar
        console.log(`⚠️ [getNotifications] Duplicado encontrado:`, current._id);
        duplicatesToDelete.push(current._id.toString());
      }
      
      return acc;
    }, [] as any[]);

    // ✅ ELIMINAR DUPLICADOS DEL BACKEND
    if (duplicatesToDelete.length > 0) {
      console.log(`🗑️ [getNotifications] Eliminando ${duplicatesToDelete.length} notificaciones duplicadas`);
      
      await Notification.deleteMany({
        _id: { $in: duplicatesToDelete }
      });
      
      console.log('✅ [getNotifications] Duplicados eliminados del backend');
    }

    const unreadCount = uniqueNotifications.filter((n: any) => !n.read).length;

    console.log('📬 [getNotifications] Resumen:', {
      total: notifications.length,
      unique: uniqueNotifications.length,
      duplicadosEliminados: duplicatesToDelete.length,
      unread: unreadCount
    });

    return {
      notifications: uniqueNotifications as INotification[],
      unreadCount
    };
  }

  /**
   * Marcar notificación como leída
   */
  async markAsRead(notificationId: string, userId: string): Promise<void> {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const notificationObjectId = new mongoose.Types.ObjectId(notificationId);

    const result = await Notification.updateOne(
      { _id: notificationObjectId, recipient: userObjectId },
      { $set: { read: true } }
    );

    if (result.matchedCount === 0) {
      throw new Error('Notificación no encontrada');
    }

    console.log(`✅ [markAsRead] Notificación ${notificationId} marcada como leída`);
  }

  /**
   * Marcar todas las notificaciones como leídas
   */
  async markAllAsRead(userId: string): Promise<number> {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const result = await Notification.updateMany(
      { recipient: userObjectId, read: false },
      { $set: { read: true } }
    );

    console.log(`✅ [markAllAsRead] ${result.modifiedCount} notificaciones marcadas como leídas`);

    return result.modifiedCount;
  }

  /**
   * Eliminar una notificación
   */
  async deleteNotification(notificationId: string, userId: string): Promise<void> {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const notificationObjectId = new mongoose.Types.ObjectId(notificationId);

    const result = await Notification.deleteOne({
      _id: notificationObjectId,
      recipient: userObjectId
    });

    if (result.deletedCount === 0) {
      throw new Error('Notificación no encontrada');
    }

    console.log(`🗑️ [deleteNotification] Notificación ${notificationId} eliminada`);
  }

  /**
   * Obtener contador de notificaciones sin leer
   */
  async getUnreadCount(userId: string): Promise<number> {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const count = await Notification.countDocuments({ 
      recipient: userObjectId, 
      read: false 
    });

    return count;
  }

  /**
   * Limpiar notificaciones duplicadas (tarea de mantenimiento)
   */
  async cleanDuplicateNotifications(): Promise<number> {
    try {
      console.log('🧹 [cleanDuplicateNotifications] Iniciando limpieza...');

      const allNotifications = await Notification.find({})
        .sort({ createdAt: -1 })
        .lean();

      const seen = new Map<string, string>();
      const duplicateIds: string[] = [];

      allNotifications.forEach((notification) => {
        const key = `${notification.recipient}-${notification.sender}-${notification.friendshipId}-${notification.type}`;
        
        if (seen.has(key)) {
          // Ya existe una notificación con estos datos
          duplicateIds.push(notification._id.toString());
        } else {
          // Primera vez que vemos esta combinación
          seen.set(key, notification._id.toString());
        }
      });

      if (duplicateIds.length > 0) {
        await Notification.deleteMany({
          _id: { $in: duplicateIds }
        });

        console.log(`✅ [cleanDuplicateNotifications] Eliminadas ${duplicateIds.length} notificaciones duplicadas`);
      } else {
        console.log('✅ [cleanDuplicateNotifications] No se encontraron duplicados');
      }

      return duplicateIds.length;
    } catch (error) {
      console.error('❌ [cleanDuplicateNotifications] Error:', error);
      return 0;
    }
  }
}