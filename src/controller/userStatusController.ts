import { Request, Response } from 'express';
import { UserStatusService } from '../services/userStatusServices';

const userStatusService = new UserStatusService();

export async function setOnline(req: Request, res: Response): Promise<Response> {
  try {
    const userId = (req as any).user.id;
    await userStatusService.setUserOnline(userId);
    return res.status(200).json({ message: 'User set to online' });
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
}

export async function setOffline(req: Request, res: Response): Promise<Response> {
  try {
    const userId = (req as any).user.id;
    await userStatusService.setUserOffline(userId);
    return res.status(200).json({ message: 'User set to offline' });
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
}

export async function updateLastSeen(req: Request, res: Response): Promise<Response> {
  try {
    const userId = (req as any).user.id;
    await userStatusService.updateLastSeen(userId);
    return res.status(200).json({ message: 'Last seen updated' });
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
}

export async function getUserStatus(req: Request, res: Response): Promise<Response> {
  try {
    const { userId } = req.params;
    const status = await userStatusService.getUserStatus(userId);
    return res.status(200).json(status);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
}

export async function getFriendsWithStatus(req: Request, res: Response): Promise<Response> {
  try {
    const userId = (req as any).user.id;
    const friends = await userStatusService.getFriendsWithStatus(userId);
    return res.status(200).json(friends);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
}