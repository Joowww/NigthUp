import { Request, Response } from 'express';
import { PollService } from '../services/pollServices';

const pollService = new PollService();

export async function createPoll(req: Request, res: Response): Promise<Response> {
  try {
    const creatorId = (req as any).user.id;
    const { question, options, isPublic, allowedVoters, expiresAt } = req.body;

    if (!question || !options || !Array.isArray(options)) {
      return res.status(400).json({ error: 'Question and options array are required' });
    }

    const poll = await pollService.createPoll(creatorId, question, options, isPublic, allowedVoters, expiresAt ? new Date(expiresAt) : undefined);
    return res.status(201).json(poll);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
}

export async function getActivePolls(req: Request, res: Response): Promise<Response> {
  try {
    const userId = (req as any).user.id;
    const polls = await pollService.getActivePolls(userId);
    return res.status(200).json(polls);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
}

export async function voteInPoll(req: Request, res: Response): Promise<Response> {
  try {
    const { pollId } = req.params;
    const { optionIndex } = req.body;
    const userId = (req as any).user.id;

    if (typeof optionIndex !== 'number') {
      return res.status(400).json({ error: 'optionIndex must be a number' });
    }

    const poll = await pollService.voteInPoll(pollId, optionIndex, userId);
    return res.status(200).json(poll);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
}

export async function closePoll(req: Request, res: Response): Promise<Response> {
  try {
    const { pollId } = req.params;
    const creatorId = (req as any).user.id;

    const poll = await pollService.closePoll(pollId, creatorId);
    return res.status(200).json(poll);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
}

export async function getPollResults(req: Request, res: Response): Promise<Response> {
  try {
    const { pollId } = req.params;
    const results = await pollService.getPollResults(pollId);
    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
}