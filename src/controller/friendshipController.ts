import { Request, Response } from 'express';
import { FriendshipService } from '../services/friendshipServices';
import User from '../models/user';
import mongoose from 'mongoose';
import { Friendship } from '../models/friendship';

const friendshipService = new FriendshipService();

export async function sendFriendRequest(req: Request, res: Response): Promise<Response> {
  try {
    const requesterId = (req as any).user.id;
    const { recipientId } = req.body;

    if (!recipientId) {
      return res.status(400).json({ error: 'recipientId is required' });
    }

    const friendship = await friendshipService.sendFriendRequest(requesterId, recipientId);
    return res.status(201).json(friendship);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
}

export async function acceptFriendRequest(req: Request, res: Response): Promise<Response> {
  try {
    const { friendshipId } = req.params;
    const friendship = await friendshipService.acceptFriendRequest(friendshipId);
    if (!friendship) {
      return res.status(404).json({ error: 'Friend request not found' });
    }
    return res.status(200).json(friendship);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
}

export async function rejectFriendRequest(req: Request, res: Response): Promise<Response> {
  try {
    const { friendshipId } = req.params;
    const friendship = await friendshipService.rejectFriendRequest(friendshipId);
    if (!friendship) {
      return res.status(404).json({ error: 'Friend request not found' });
    }
    return res.status(200).json({ message: 'Friend request rejected' });
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
}

export async function blockUser(req: Request, res: Response): Promise<Response> {
  try {
    const requesterId = (req as any).user.id;
    const { recipientId } = req.body;

    if (!recipientId) {
      return res.status(400).json({ error: 'recipientId is required' });
    }

    const friendship = await friendshipService.blockUser(requesterId, recipientId);
    return res.status(200).json(friendship);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
}

export async function getFriends(req: Request, res: Response): Promise<Response> {
  try {
    const userId = (req as any).user.id;
    const friends = await friendshipService.getFriends(userId);
    return res.status(200).json(friends);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
}

export async function getPendingRequests(req: Request, res: Response): Promise<Response> {
  try {
    const userId = (req as any).user.id;
    const pendingRequests = await friendshipService.getPendingRequests(userId);
    return res.status(200).json(pendingRequests);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
}

export async function getFriendStatus(req: Request, res: Response): Promise<Response> {
  try {
    const userId1 = (req as any).user.id;
    const { userId2 } = req.params;

    const result = await friendshipService.getFriendStatus(userId1, userId2);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
}

export async function removeFriend(req: Request, res: Response): Promise<Response> {
  try {
    const userId = (req as any).user.id;
    const { friendshipId } = req.params;

    const friendship = await friendshipService.removeFriend(friendshipId, userId);
    return res.status(200).json({ message: 'Friend removed successfully', friendship });
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
}

export async function searchUsersForFriendship(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const userId = (req as any).user.id;
    const q = (req.query.search as string) || '';
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = parseInt(req.query.skip as string) || 0;
    const city = (req.query.city as string) || '';
    const interest = (req.query.interest as string) || '';
    const gender = (req.query.gender as string) || '';
    const onlineOnly = req.query.onlineOnly === 'true'; // ✅ Parsear correctamente

    console.log('🔍 [searchUsersForFriendship] Filtros recibidos:', {
      q,
      limit,
      skip,
      city,
      interest,
      gender,
      onlineOnly // ✅ LOG
    });

    const users = await friendshipService.searchUsers(
      userId,
      q,
      limit,
      skip,
      city,
      interest,
      gender,
      onlineOnly
    );

    console.log(`✅ [searchUsersForFriendship] Devolviendo ${users.length} usuarios`);

    return res.status(200).json(users);
  } catch (error) {
    console.error('❌ [searchUsersForFriendship] Error:', error);
    return res.status(500).json({ error: (error as Error).message });
  }
}

export async function getFilterOptions(req: Request, res: Response): Promise<Response> {
  try {
    // Obtener ciudades únicas
    const cities = await User.aggregate([
      { $match: { active: true } },
      {
        $group: {
          _id: null,
          cities: { $addToSet: '$city' },
          comunidades: { $addToSet: '$comunidad' }
        }
      }
    ]);

    // Obtener intereses únicos
    const interests = await User.aggregate([
      { $match: { active: true } },
      { $unwind: '$intereses' },
      { $group: { _id: '$intereses' } },
      { $sort: { _id: 1 } }
    ]);

    // Combinar ciudades y comunidades, filtrar vacíos y ordenar
    const allLocations = [
      ...(cities[0]?.cities || []),
      ...(cities[0]?.comunidades || [])
    ]
      .filter(Boolean)
      .filter((item, index, self) => self.indexOf(item) === index) // Eliminar duplicados
      .sort();

    const allInterests = interests.map(i => i._id).filter(Boolean);

    return res.status(200).json({
      cities: allLocations,
      interests: allInterests
    });
  } catch (error) {
    console.error('Error getting filter options:', error);
    return res.status(500).json({ error: (error as Error).message });
  }
}
export async function sendFriendRequestV2(req: Request, res: Response): Promise<Response> {
  try {
    const requesterId = (req as any).user.id;
    const { recipientId } = req.body;

    if (!recipientId) {
      return res.status(400).json({ error: 'recipientId is required' });
    }

    if (requesterId === recipientId) {
      return res.status(400).json({ error: 'No puedes enviarte una solicitud a ti mismo' });
    }

    const friendship = await friendshipService.sendFriendRequestV2(requesterId, recipientId);

    return res.status(201).json({
      friendship,
      message: friendship.status === 'accepted'
        ? 'Solicitudes cruzadas detectadas. Ahora son amigos!'
        : 'Solicitud enviada correctamente'
    });
  } catch (error: any) {
    console.error('Error sending friend request V2:', error);

    if (error.message.includes('Ya enviaste') || error.message.includes('Ya son amigos')) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(500).json({ error: (error as Error).message });
  }
}

/**
 * Obtener amigos en común
 */
export async function getMutualFriends(req: Request, res: Response): Promise<Response> {
  try {
    const currentUserId = (req as any).user.id;
    const { userId } = req.params;
    const limit = parseInt(req.query.limit as string) || 10;

    if (currentUserId === userId) {
      return res.status(400).json({ error: 'No puedes ver tus propios amigos en común' });
    }

    const mutualFriends = await friendshipService.getMutualFriends(currentUserId, userId, limit);

    return res.status(200).json(mutualFriends);
  } catch (error) {
    console.error('Error getting mutual friends:', error);
    return res.status(500).json({ error: (error as Error).message });
  }
}

/**
 * Cancelar solicitud de amistad V2
 */
export async function cancelFriendRequestV2(req: Request, res: Response): Promise<Response> {
  try {
    const userId = (req as any).user.id;
    const { friendshipId } = req.params;

    await friendshipService.cancelFriendRequestV2(friendshipId, userId);

    return res.status(200).json({ message: 'Solicitud cancelada correctamente' });
  } catch (error: any) {
    console.error('Error canceling friend request V2:', error);

    if (error.message.includes('No tienes permiso')) {
      return res.status(403).json({ error: error.message });
    }

    if (error.message.includes('no encontrada')) {
      return res.status(404).json({ error: error.message });
    }

    return res.status(500).json({ error: (error as Error).message });
  }
}

/**
 * Aceptar solicitud de amistad V2
 */
export async function acceptFriendRequestV2(req: Request, res: Response): Promise<Response> {
  try {
    const { friendshipId } = req.params;
    const userId = (req as any).user.id;

    console.log('✅ [acceptFriendRequestV2] Parámetros:', { friendshipId, userId });

    // ✅ VALIDAR que friendshipId sea un ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(friendshipId)) {
      return res.status(400).json({ error: 'Invalid friendship ID' });
    }

    const friendship = await friendshipService.acceptFriendRequestV2(friendshipId, userId);

    if (!friendship) {
      return res.status(404).json({ error: 'Friendship not found' });
    }

    // ✅ Ahora Friendship está importado correctamente
    const populatedFriendship = await Friendship.findById(friendship._id)
      .populate('requester', 'username avatar firstName lastName')
      .populate('recipient', 'username avatar firstName lastName')
      .lean();

    console.log('✅ [acceptFriendRequestV2] Solicitud aceptada:', populatedFriendship);

    return res.status(200).json({
      friendship: populatedFriendship,
      message: 'Friend request accepted successfully'
    });

  } catch (error) {
    console.error('❌ [acceptFriendRequestV2] Error:', error);
    return res.status(500).json({
      error: 'Failed to accept friend request',
      details: (error as Error).message
    });
  }
}

export async function getFriendsV2(req: Request, res: Response): Promise<Response> {
  try {
    const userId = (req as any).user.id;

    console.log(`🔍 [getFriendsV2 Controller] Obteniendo amigos para userId: ${userId}`);

    const friends = await friendshipService.getFriendsV2(userId);

    console.log(`✅ [getFriendsV2 Controller] Devolviendo ${friends.length} amigos`);

    return res.status(200).json(friends);
  } catch (error) {
    console.error('❌ [getFriendsV2 Controller] Error:', error);
    return res.status(500).json({ error: (error as Error).message });
  }
}