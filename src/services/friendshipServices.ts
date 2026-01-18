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

  // src/services/friendshipServices.ts

  // ==================== NUEVAS FUNCIONES (NO TOCAR LAS ANTIGUAS) ====================

  /**
   * Enviar solicitud de amistad con manejo inteligente de solicitudes cruzadas
   */
  async sendFriendRequestV2(requesterId: string, recipientId: string): Promise<IFriendship> {
    const requesterObjectId = new mongoose.Types.ObjectId(requesterId);
    const recipientObjectId = new mongoose.Types.ObjectId(recipientId);

    // ✅ 1. Verificar si YA existe una solicitud (en cualquier dirección)
    const existing = await Friendship.findOne({
      $or: [
        { requester: requesterObjectId, recipient: recipientObjectId },
        { requester: recipientObjectId, recipient: requesterObjectId }
      ]
    });

    if (existing) {
      // ✅ 2. Si el OTRO usuario te envió solicitud, ACEPTAR automáticamente
      if (
        existing.requester.equals(recipientObjectId) &&
        existing.recipient.equals(requesterObjectId) &&
        existing.status === 'pending'
      ) {
        console.log('✅ Solicitud cruzada detectada! Auto-aceptando...');
        existing.status = 'accepted';
        await existing.save();

        // ✅ Eliminar notificación de solicitud pendiente
        await Notification.deleteMany({
          friendshipId: existing._id,
          type: 'friend_request'
        });
        console.log('🗑️ [sendFriendRequestV2] Notificaciones de solicitud cruzada eliminadas');

        // Poblar datos para la respuesta
        return await Friendship.findById(existing._id)
          .populate('requester', 'username avatar firstName lastName')
          .populate('recipient', 'username avatar firstName lastName')
          .lean() as IFriendship;
      }

      // ✅ 3. Si YA enviaste solicitud, devolver error
      if (existing.requester.equals(requesterObjectId)) {
        throw new Error('Ya enviaste una solicitud a este usuario');
      }

      // ✅ 4. Si ya son amigos
      if (existing.status === 'accepted') {
        throw new Error('Ya son amigos');
      }

      // ✅ 5. Si está bloqueado
      if (existing.status === 'blocked') {
        throw new Error('No puedes enviar solicitudes a usuarios bloqueados');
      }
    }

    // ✅ 6. Crear nueva solicitud
    const newFriendship = new Friendship({
      requester: requesterObjectId,
      recipient: recipientObjectId,
      status: 'pending'
    });

    await newFriendship.save();

    // ✅ 7. Crear notificación usando el servicio
    await this.notificationService.createNotification({
      recipient: recipientId,
      sender: requesterId,
      type: 'friend_request',
      friendshipId: newFriendship._id.toString()
    });

    console.log(`📬 [sendFriendRequestV2] Notificación creada correctamente`);

    return await Friendship.findById(newFriendship._id)
      .populate('requester', 'username avatar firstName lastName')
      .populate('recipient', 'username avatar firstName lastName')
      .lean() as IFriendship;
  }

  /**
   * Obtener amigos en común entre dos usuarios
   */
  async getMutualFriends(user1Id: string, user2Id: string, limit: number = 10): Promise<any[]> {
    const user1ObjectId = new mongoose.Types.ObjectId(user1Id);
    const user2ObjectId = new mongoose.Types.ObjectId(user2Id);

    // 1. Obtener amigos de user1
    const user1Friendships = await Friendship.find({
      $or: [
        { requester: user1ObjectId, status: 'accepted' },
        { recipient: user1ObjectId, status: 'accepted' }
      ]
    }).lean();

    const user1FriendIds = user1Friendships.map(f =>
      f.requester.equals(user1ObjectId) ? f.recipient : f.requester
    );

    // 2. Obtener amigos de user2
    const user2Friendships = await Friendship.find({
      $or: [
        { requester: user2ObjectId, status: 'accepted' },
        { recipient: user2ObjectId, status: 'accepted' }
      ]
    }).lean();

    const user2FriendIds = user2Friendships.map(f =>
      f.requester.equals(user2ObjectId) ? f.recipient : f.requester
    );

    // 3. Encontrar IDs en común
    const mutualFriendIds = user1FriendIds.filter(id =>
      user2FriendIds.some(id2 => id.equals(id2))
    );

    if (mutualFriendIds.length === 0) {
      return [];
    }

    // 4. Obtener información de usuarios
    const mutualFriends = await User.find({
      _id: { $in: mutualFriendIds }
    })
      .select('username avatar firstName lastName')
      .limit(limit)
      .lean();

    return mutualFriends;
  }

  /**
   * Cancelar solicitud de amistad (enviada o recibida)
   */
  async cancelFriendRequestV2(friendshipId: string, userId: string): Promise<void> {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const friendship = await Friendship.findById(friendshipId);

    if (!friendship) {
      throw new Error('Solicitud no encontrada');
    }

    if (!friendship.requester.equals(userObjectId) && !friendship.recipient.equals(userObjectId)) {
      throw new Error('No tienes permiso para cancelar esta solicitud');
    }

    // ✅ Eliminar notificación asociada
    const deletedNotifications = await Notification.deleteMany({ friendshipId: friendshipId });
    console.log(`🗑️ [cancelFriendRequestV2] ${deletedNotifications.deletedCount} notificaciones eliminadas`);

    await Friendship.findByIdAndDelete(friendshipId);
  }

  /**
   * Aceptar solicitud de amistad V2
   */
  async acceptFriendRequestV2(friendshipId: string, userId: string): Promise<IFriendship | null> {
    const friendshipObjectId = new mongoose.Types.ObjectId(friendshipId);
    const userObjectId = new mongoose.Types.ObjectId(userId);

    console.log(`✅ [acceptFriendRequestV2] Buscando friendship:`, friendshipId);

    const friendship = await Friendship.findById(friendshipObjectId);

    if (!friendship) {
      console.log('❌ Friendship no encontrada');
      throw new Error('Friendship not found');
    }

    console.log(`📋 Friendship encontrada:`, friendship);

    // ✅ VALIDAR que el usuario sea el recipiente
    const recipientId = friendship.recipient.toString();

    if (recipientId !== userId) {
      console.log(`❌ Usuario ${userId} no es el recipiente. Recipiente: ${recipientId}`);
      throw new Error('You are not authorized to accept this request');
    }

    // ✅ VALIDAR que esté pendiente
    if (friendship.status !== 'pending') {
      console.log(`❌ Estado actual: ${friendship.status}`);
      throw new Error(`Cannot accept friendship with status: ${friendship.status}`);
    }

    // ✅ ACTUALIZAR estado
    friendship.status = 'accepted';
    await friendship.save();

    // ✅ Eliminar notificación de solicitud pendiente (para el recipiente que acepta)
    await Notification.deleteMany({
      friendshipId: friendshipObjectId,
      type: 'friend_request'
    });
    console.log('🗑️ [acceptFriendRequestV2] Notificaciones de solicitud eliminadas');

    console.log('✅ Friendship aceptada correctamente');

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
    status: 'none' | 'friends' | 'pending_sent' | 'pending_received' | 'blocked';
    friendshipId: string | null;
    isOnline: boolean;
    lastSeen: Date
  }> {
    const myUserId = new mongoose.Types.ObjectId(userId1);
    const otherUserId = new mongoose.Types.ObjectId(userId2);

    const friendship = await Friendship.findOne({
      $or: [
        { requester: myUserId, recipient: otherUserId },
        { requester: otherUserId, recipient: myUserId }
      ]
    });

    const user2 = await User.findById(userId2).select('isOnline lastSeen');
    if (!user2) {
      throw new Error('User not found');
    }

    let status: 'none' | 'friends' | 'pending_sent' | 'pending_received' | 'blocked' = 'none';
    let friendshipId: string | null = null;

    if (friendship) {
      friendshipId = friendship._id.toString();
      if (friendship.status === 'accepted') {
        status = 'friends';
      } else if (friendship.status === 'blocked') {
        status = 'blocked';
      } else if (friendship.status === 'pending') {
        status = friendship.requester.equals(myUserId) ? 'pending_sent' : 'pending_received';
      }
    }

    return {
      status,
      friendshipId,
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
    onlineOnly?: boolean // ✅ Añadir parámetro
  ): Promise<any[]> {

    const myUserId = new mongoose.Types.ObjectId(currentUserId);

    console.log('🔍 [FriendshipService.searchUsers] Aplicando filtros:', {
      query,
      city,
      interest,
      gender,
      onlineOnly // ✅ LOG
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

    // ✅ Filtro solo usuarios online (NUEVO)
    if (onlineOnly === true) {
      searchFilter.isOnline = true;
      console.log('🟢 Filtrando SOLO usuarios con isOnline: true');
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

    console.log(`📋 [getFriendsV2] Encontradas ${friendships.length} amistades para userId: ${userId}`);

    const friends = friendships.map(friendship => {
      const friend = friendship.requester._id.toString() === userId
        ? friendship.recipient
        : friendship.requester;

      console.log(`👤 [getFriendsV2] Amigo mapeado:`, friend);

      return {
        ...friend,
        friendshipId: friendship._id.toString()
      };
    });

    console.log(`✅ [getFriendsV2] Devolviendo ${friends.length} amigos con datos completos`);

    return friends;
  }
}

