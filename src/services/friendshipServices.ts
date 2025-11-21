import { Friendship, IFriendship } from '../models/friendship';
import { User } from '../models/user';
import mongoose from 'mongoose';

export class FriendshipService {
  async sendFriendRequest(requesterId: string, recipientId: string): Promise<IFriendship> {
    // Verificar que no exista una solicitud previa
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
    // Si existe una amistad, actualizar a bloqueado, sino crear una nueva
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
    .populate('requester', 'username email location isVisibleOnMap')
    .populate('recipient', 'username email location isVisibleOnMap');
  }

  async getFriendsWithStatus(userId: string): Promise<any[]> {
    const friendships = await Friendship.find({
      $or: [
        { requester: userId, status: 'accepted' },
        { recipient: userId, status: 'accepted' }
      ]
    })
    .populate('requester', 'username email isOnline lastSeen profilePicture location isVisibleOnMap')
    .populate('recipient', 'username email isOnline lastSeen profilePicture location isVisibleOnMap');

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
    .populate('requester', 'username email');
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
}