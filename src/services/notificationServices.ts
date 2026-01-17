import { Notification, INotification } from '../models/notification';
import mongoose from 'mongoose';

export class NotificationService {

  async createNotification(data: {
    recipient: string;
    sender: string;
    type: 'friend_request' | 'friend_accepted';
    friendshipId: string;
  }): Promise<INotification> {

    const recipientObjectId = new mongoose.Types.ObjectId(data.recipient);
    const senderObjectId = new mongoose.Types.ObjectId(data.sender);

    const existingNotifications = await Notification.find({
      recipient: recipientObjectId,
      sender: senderObjectId,
      friendshipId: data.friendshipId,
      type: data.type
    });

    if (existingNotifications.length > 0) {
      await Notification.deleteMany({
        recipient: recipientObjectId,
        sender: senderObjectId,
        friendshipId: data.friendshipId,
        type: data.type
      });

    }

    const notification = await Notification.create({
      recipient: recipientObjectId,
      sender: senderObjectId,
      type: data.type,
      friendshipId: data.friendshipId,
      read: false
    });

    return notification;
  }

  async getNotifications(userId: string): Promise<{ notifications: INotification[]; unreadCount: number }> {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const notifications = await Notification.find({ recipient: userObjectId })
      .populate('sender', 'username avatar firstName lastName')
      .sort({ createdAt: -1 })
      .lean();

    const seen = new Map<string, any>();
    const duplicatesToDelete: string[] = [];

    const uniqueNotifications = notifications.reduce((acc, current) => {
      const key = `${current.friendshipId}-${current.type}`;

      if (!seen.has(key)) {
        seen.set(key, current);
        acc.push(current);
      } else {
        duplicatesToDelete.push(current._id.toString());
      }

      return acc;
    }, [] as any[]);

    if (duplicatesToDelete.length > 0) {

      await Notification.deleteMany({
        _id: { $in: duplicatesToDelete }
      });

    }

    const unreadCount = uniqueNotifications.filter((n: any) => !n.read).length;

    return {
      notifications: uniqueNotifications as INotification[],
      unreadCount
    };
  }

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

  }

  async markAllAsRead(userId: string): Promise<number> {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const result = await Notification.updateMany(
      { recipient: userObjectId, read: false },
      { $set: { read: true } }
    );

    return result.modifiedCount;
  }

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

  }

  async getUnreadCount(userId: string): Promise<number> {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const count = await Notification.countDocuments({
      recipient: userObjectId,
      read: false
    });

    return count;
  }

  async cleanDuplicateNotifications(): Promise<number> {
    try {

      const allNotifications = await Notification.find({})
        .sort({ createdAt: -1 })
        .lean();

      const seen = new Map<string, string>();
      const duplicateIds: string[] = [];

      allNotifications.forEach((notification) => {
        const key = `${notification.recipient}-${notification.sender}-${notification.friendshipId}-${notification.type}`;

        if (seen.has(key)) {
          duplicateIds.push(notification._id.toString());
        } else {
          seen.set(key, notification._id.toString());
        }
      });

      if (duplicateIds.length > 0) {
        await Notification.deleteMany({
          _id: { $in: duplicateIds }
        });

      } else {
      }

      return duplicateIds.length;
    } catch (error) {
      return 0;
    }
  }
}