import { Request, Response } from 'express';
import { EventTinderService } from '../services/eventTinderServices';

const eventTinderService = new EventTinderService();

export async function participateInEventTinder(req: Request, res: Response): Promise<Response> {
  try {
    const { eventId } = req.params;
    const userId = (req as any).user.id;

    const eventTinder = await eventTinderService.participateInEventTinder(eventId, userId);
    return res.status(200).json(eventTinder);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
}

export async function leaveEventTinder(req: Request, res: Response): Promise<Response> {
  try {
    const { eventId } = req.params;
    const userId = (req as any).user.id;

    const eventTinder = await eventTinderService.leaveEventTinder(eventId, userId);
    return res.status(200).json(eventTinder);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
}

export async function likeUser(req: Request, res: Response): Promise<Response> {
  try {
    const { eventId } = req.params;
    const userId = (req as any).user.id;
    const { likedUserId } = req.body;

    if (!likedUserId) {
      return res.status(400).json({ error: 'likedUserId is required' });
    }

    const result = await eventTinderService.likeUser(eventId, userId, likedUserId);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
}

export async function dislikeUser(req: Request, res: Response): Promise<Response> {
  try {
    const { eventId } = req.params;
    const userId = (req as any).user.id;
    const { dislikedUserId } = req.body;

    if (!dislikedUserId) {
      return res.status(400).json({ error: 'dislikedUserId is required' });
    }

    const eventTinder = await eventTinderService.dislikeUser(eventId, userId, dislikedUserId);
    return res.status(200).json(eventTinder);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
}

export async function getMatches(req: Request, res: Response): Promise<Response> {
  try {
    const { eventId } = req.params;
    const userId = (req as any).user.id;

    const matches = await eventTinderService.getMatches(eventId, userId);
    return res.status(200).json(matches);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
}

export async function getNextUser(req: Request, res: Response): Promise<Response> {
  try {
    const { eventId } = req.params;
    const userId = (req as any).user.id;

    const nextUser = await eventTinderService.getNextUser(eventId, userId);
    return res.status(200).json(nextUser);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
}

export async function getEventTinderStats(req: Request, res: Response): Promise<Response> {
  try {
    const { eventId } = req.params;
    const stats = await eventTinderService.getEventTinderStats(eventId);
    return res.status(200).json(stats);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
}