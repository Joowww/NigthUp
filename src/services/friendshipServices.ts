import { Friendship, IFriendship } from '../models/friendship';
import { User } from '../models/user';
import mongoose from 'mongoose';

export class FriendshipService {
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
  
    console.log('🔍 [FriendshipService.searchUsers] Aplicando filtros:', {
      query,
      city,
      interest,
      gender,
      onlineOnly
    });
  
    // 1️⃣ Construir filtro de búsqueda
    const searchFilter: any = {
      _id: { $ne: myUserId },
      active: true
    };
  
    // Filtro por username (búsqueda)
    if (query && query.trim()) {
      searchFilter.username = { $regex: query.trim(), $options: 'i' };
    }
  
    // Filtro por ciudad/comunidad (SOLO si city tiene valor)
    if (city && city.trim()) {
      searchFilter.$or = [
        { city: city.trim() },
        { comunidad: city.trim() }
      ];
    }
  
    // Filtro por interés (SOLO si interest tiene valor)
    if (interest && interest.trim()) {
      searchFilter.intereses = interest.trim();
    }
  
    // Filtro por género (SOLO si gender tiene valor)
    if (gender && gender.trim()) {
      searchFilter.gender = gender.trim();
    }
  
    // Filtro solo usuarios online
    if (onlineOnly === true) {
      searchFilter.isOnline = true;
    }
  
    console.log('📋 [FriendshipService.searchUsers] Filtro MongoDB:', JSON.stringify(searchFilter, null, 2));
  
    // 2️⃣ Buscar usuarios
    const users = await User.find(searchFilter)
      .select('_id username avatar city comunidad intereses gender isOnline')
      .skip(skip)
      .limit(limit)
      .lean();
  
    console.log(`✅ [FriendshipService.searchUsers] Encontrados ${users.length} usuarios`);
  
    if (users.length === 0) return [];
  
    // 3️⃣ Obtener relaciones existentes
    const friendships = await Friendship.find({
      $or: [
        { requester: myUserId },
        { recipient: myUserId }
      ]
    }).lean();
  
    // 4️⃣ Mapear estado social
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
}

