import { Friendship, IFriendship } from '../models/friendship';
import { User } from '../models/user';
import mongoose from 'mongoose';
import { Notification } from '../models/notification';
import { NotificationService } from './notificationServices';


export class FriendshipService {

  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  async sendFriendRequest(requesterId: string, recipientId: string): Promise<IFriendship> {
    const existing = await Friendship.findOne({
      $or: [
        { requester: requesterId, recipient: recipientId },
        { requester: recipientId, recipient: requesterId }
      ]
    });

    if (existing) {
      throw new Error('Friend request already exists or users are already friends');
    }

    const friendship = new Friendship({
      requester: requesterId,
      recipient: recipientId,
      status: 'pending'
    });

    return await friendship.save();
  }

  async sendFriendRequestV2(requesterId: string, recipientId: string): Promise<IFriendship> {
    const requesterObjectId = new mongoose.Types.ObjectId(requesterId);
    const recipientObjectId = new mongoose.Types.ObjectId(recipientId);
    const existing = await Friendship.findOne({
      $or: [
        { requester: requesterObjectId, recipient: recipientObjectId },
        { requester: recipientObjectId, recipient: requesterObjectId }
      ]
    });

    if (existing) {
      if (
        existing.requester.equals(recipientObjectId) &&
        existing.recipient.equals(requesterObjectId) &&
        existing.status === 'pending'
      ) {
        existing.status = 'accepted';
        await existing.save();

        return await Friendship.findById(existing._id)
          .populate('requester', 'username avatar firstName lastName')
          .populate('recipient', 'username avatar firstName lastName')
          .lean() as IFriendship;
      }

      if (existing.requester.equals(requesterObjectId)) {
        throw new Error('Ya enviaste una solicitud a este usuario');
      }
      if (existing.status === 'accepted') {
        throw new Error('Ya son amigos');
      }

      if (existing.status === 'blocked') {
        throw new Error('No puedes enviar solicitudes a usuarios bloqueados');
      }
    }
    const newFriendship = new Friendship({
      requester: requesterObjectId,
      recipient: recipientObjectId,
      status: 'pending'
    });

    await newFriendship.save();

    await this.notificationService.createNotification({
      recipient: recipientId,
      sender: requesterId,
      type: 'friend_request',
      friendshipId: newFriendship._id.toString()
    });


    return await Friendship.findById(newFriendship._id)
      .populate('requester', 'username avatar firstName lastName')
      .populate('recipient', 'username avatar firstName lastName')
      .lean() as IFriendship;
  }

  async getMutualFriends(user1Id: string, user2Id: string, limit: number = 10): Promise<any[]> {
    const user1ObjectId = new mongoose.Types.ObjectId(user1Id);
    const user2ObjectId = new mongoose.Types.ObjectId(user2Id);
    const user1Friendships = await Friendship.find({
      $or: [
        { requester: user1ObjectId, status: 'accepted' },
        { recipient: user1ObjectId, status: 'accepted' }
      ]
    }).lean();

    const user1FriendIds = user1Friendships.map(f =>
      f.requester.equals(user1ObjectId) ? f.recipient : f.requester
    );

    const user2Friendships = await Friendship.find({
      $or: [
        { requester: user2ObjectId, status: 'accepted' },
        { recipient: user2ObjectId, status: 'accepted' }
      ]
    }).lean();

    const user2FriendIds = user2Friendships.map(f =>
      f.requester.equals(user2ObjectId) ? f.recipient : f.requester
    );

    const mutualFriendIds = user1FriendIds.filter(id =>
      user2FriendIds.some(id2 => id.equals(id2))
    );

    if (mutualFriendIds.length === 0) {
      return [];
    }

    const mutualFriends = await User.find({
      _id: { $in: mutualFriendIds }
    })
      .select('username avatar firstName lastName')
      .limit(limit)
      .lean();

    return mutualFriends;
  }

  async cancelFriendRequestV2(friendshipId: string, userId: string): Promise<void> {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const friendship = await Friendship.findById(friendshipId);

    if (!friendship) {
      throw new Error('Solicitud no encontrada');
    }

    if (!friendship.requester.equals(userObjectId) && !friendship.recipient.equals(userObjectId)) {
      throw new Error('No tienes permiso para cancelar esta solicitud');
    }

    const deletedNotifications = await Notification.deleteMany({ friendshipId: friendshipId });

    await Friendship.findByIdAndDelete(friendshipId);
  }

  async acceptFriendRequestV2(friendshipId: string, userId: string): Promise<IFriendship | null> {
    const friendshipObjectId = new mongoose.Types.ObjectId(friendshipId);
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const friendship = await Friendship.findById(friendshipObjectId);

    if (!friendship) {
      throw new Error('Friendship not found');
    }


    const recipientId = friendship.recipient.toString();

    if (recipientId !== userId) {
      throw new Error('You are not authorized to accept this request');
    }

    if (friendship.status !== 'pending') {
      throw new Error(`Cannot accept friendship with status: ${friendship.status}`);
    }
    friendship.status = 'accepted';
    await friendship.save();


    return friendship;
  }

  async acceptFriendRequest(friendshipId: string): Promise<IFriendship | null> {
    return await Friendship.findByIdAndUpdate(
      friendshipId,
      { status: 'accepted' },
      { new: true }
    ).populate('requester', 'username email').populate('recipient', 'username email');
  }

  async rejectFriendRequest(friendshipId: string): Promise<IFriendship | null> {
    return await Friendship.findByIdAndDelete(friendshipId);
  }

  async blockUser(requesterId: string, recipientId: string): Promise<IFriendship> {
    let friendship = await Friendship.findOne({
      requester: requesterId,
      recipient: recipientId
    });

    if (friendship) {
      friendship.status = 'blocked';
      return await friendship.save();
    } else {
      friendship = new Friendship({
        requester: requesterId,
        recipient: recipientId,
        status: 'blocked'
      });
      return await friendship.save();
    }
  }

  async getFriends(userId: string): Promise<IFriendship[]> {
    return await Friendship.find({
      $or: [
        { requester: userId, status: 'accepted' },
        { recipient: userId, status: 'accepted' }
      ]
    })
      .populate('requester', 'username avatar profilePicture email location isVisibleOnMap')
      .populate('recipient', 'username avatar profilePicture email location isVisibleOnMap');
  }

  async getFriendsWithStatus(userId: string): Promise<any[]> {
    const friendships = await Friendship.find({
      $or: [
        { requester: userId, status: 'accepted' },
        { recipient: userId, status: 'accepted' }
      ]
    })
      .populate('requester', 'username avatar email isOnline lastSeen profilePicture location isVisibleOnMap')
      .populate('recipient', 'username avatar email isOnline lastSeen profilePicture location isVisibleOnMap');

    return friendships.map(friendship => {
      const friend = friendship.requester._id.toString() === userId ?
        friendship.recipient : friendship.requester;

      return {
        friendshipId: friendship._id,
        user: friend,
        status: friendship.status,
        createdAt: friendship.createdAt
      };
    });
  }

  async getPendingRequests(userId: string): Promise<IFriendship[]> {
    return await Friendship.find({
      recipient: userId,
      status: 'pending'
    })
      .populate('requester', 'username avatar profilePicture email');
  }

  async getFriendStatus(userId1: string, userId2: string): Promise<{
    friendshipStatus: string | null;
    isOnline: boolean;
    lastSeen: Date
  }> {
    const friendship = await Friendship.findOne({
      $or: [
        { requester: userId1, recipient: userId2 },
        { requester: userId2, recipient: userId1 }
      ]
    });

    const user2 = await User.findById(userId2).select('isOnline lastSeen');
    if (!user2) {
      throw new Error('User not found');
    }

    return {
      friendshipStatus: friendship ? friendship.status : null,
      isOnline: user2.isOnline,
      lastSeen: user2.lastSeen
    };
  }

  async removeFriend(friendshipId: string, userId: string): Promise<IFriendship | null> {
    const friendship = await Friendship.findOne({
      _id: friendshipId,
      $or: [
        { requester: userId },
        { recipient: userId }
      ],
      status: 'accepted'
    });

    if (!friendship) {
      throw new Error('Friendship not found or you are not part of it');
    }

    return await Friendship.findByIdAndDelete(friendshipId);
  }

  async searchUsers(
    currentUserId: string,
    query: string,
    limit: number = 20,
    skip: number = 0,
    city?: string,
    interest?: string,
    gender?: string,
    onlineOnly?: boolean
  ): Promise<any[]> {

    const myUserId = new mongoose.Types.ObjectId(currentUserId);
    const searchFilter: any = {
      _id: { $ne: myUserId },
      active: true
    };

    if (query && query.trim()) {
      searchFilter.username = { $regex: query.trim(), $options: 'i' };
    }
    if (city && city.trim()) {
      searchFilter.$or = [
        { city: city.trim() },
        { comunidad: city.trim() }
      ];
    }

    if (interest && interest.trim()) {
      searchFilter.intereses = interest.trim();
    }
    if (gender && gender.trim()) {
      searchFilter.gender = gender.trim();
    }

    if (onlineOnly === true) {
      searchFilter.isOnline = true;
    }
    const users = await User.find(searchFilter)
      .select('_id username avatar city comunidad intereses gender isOnline')
      .skip(skip)
      .limit(limit)
      .lean();

    if (users.length === 0) return [];

    const friendships = await Friendship.find({
      $or: [
        { requester: myUserId },
        { recipient: myUserId }
      ]
    }).lean();

    return users.map(user => {
      const relation = friendships.find(f =>
        (f.requester.equals(myUserId) && f.recipient.equals(user._id)) ||
        (f.recipient.equals(myUserId) && f.requester.equals(user._id))
      );

      let status:
        | 'none'
        | 'friends'
        | 'pending_sent'
        | 'pending_received'
        | 'blocked' = 'none';

      let friendshipId = null;

      if (relation) {
        friendshipId = relation._id;

        if (relation.status === 'blocked') {
          status = 'blocked';
        } else if (relation.status === 'accepted') {
          status = 'friends';
        } else if (relation.status === 'pending') {
          status =
            relation.requester.equals(myUserId)
              ? 'pending_sent'
              : 'pending_received';
        }
      }

      return {
        _id: user._id,
        username: user.username,
        avatar: user.avatar,
        city: user.city,
        comunidad: user.comunidad,
        intereses: user.intereses,
        gender: user.gender,
        isOnline: user.isOnline,
        status,
        friendshipId
      };
    });
  }

  async getFriendsV2(userId: string): Promise<any[]> {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const friendships = await Friendship.find({
      $or: [
        { requester: userObjectId, status: 'accepted' },
        { recipient: userObjectId, status: 'accepted' }
      ]
    })
      .populate('requester', 'username avatar firstName lastName city comunidad bio email')
      .populate('recipient', 'username avatar firstName lastName city comunidad bio email')
      .lean();

    const friends = friendships.map(friendship => {
      const friend = friendship.requester._id.toString() === userId
        ? friendship.recipient
        : friendship.requester;

      return {
        ...friend,
        friendshipId: friendship._id.toString()
      };
    });

    return friends;
  }
}
