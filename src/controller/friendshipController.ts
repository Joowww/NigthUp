import { Request, Response } from 'express';
import { FriendshipService } from '../services/friendshipServices';

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

    const status = await friendshipService.getFriendStatus(userId1, userId2);
    return res.status(200).json({ status });
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