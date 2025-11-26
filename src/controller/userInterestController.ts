import { Request, Response } from 'express';
import { IUserInterest } from '../models/userInterest';
import { UserInterestService } from '../services/userInterestServices';
import { validationResult } from 'express-validator';

const userInterestService = new UserInterestService();

export async function createUserInterest(req: Request, res: Response): Promise<Response> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { userId, tagId, score } = req.body as Partial<IUserInterest>;
        if (!userId || !tagId || typeof score !== 'number') {
            return res.status(400).json({ error: 'userId, tagId y score son requeridos' });
        }
        const newInterest = await userInterestService.createUserInterest({
            userId,
            tagId,
            score,
            active: true
        });
        return res.status(201).json(newInterest);
    } catch (error) {
        return res.status(500).json({
            error: 'Failed to create user interest',
            details: (error as Error).message
        });
    }
}

export async function getAllUserInterests(req: Request, res: Response): Promise<Response> {
    try {
        const skip = parseInt(req.query.skip as string) || 0;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string | undefined;

        const result = await userInterestService.getAllUserInterests(skip, limit, search);
        return res.status(200).json({
            interests: result.interests,
            pagination: {
                skip,
                limit,
                total: result.total,
                hasMore: (skip + limit) < result.total
            }
        });
    } catch (error) {
        return res.status(404).json({ message: (error as Error).message });
    }
}

export async function getUserInterestById(req: Request, res: Response): Promise<Response> {
    try {
        const { id } = req.params;
        const interest = await userInterestService.getUserInterestById(id);
        if (!interest) {
            return res.status(404).json({ message: 'User interest not found' });
        }
        return res.status(200).json(interest);
    } catch (error) {
        return res.status(404).json({ message: (error as Error).message });
    }
}

export async function updateUserInterest(req: Request, res: Response): Promise<Response> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { id } = req.params;
        const { score, active } = req.body as Partial<IUserInterest>;
        const updatedInterest = await userInterestService.updateUserInterest(id, { score, active });
        if (!updatedInterest) {
            return res.status(404).json({ message: 'User interest not found' });
        }
        return res.status(200).json(updatedInterest);
    } catch (error) {
        return res.status(400).json({ message: (error as Error).message });
    }
}

export async function deleteUserInterest(req: Request, res: Response): Promise<Response> {
    try {
        const { id } = req.params;
        const interest = await userInterestService.deleteUserInterest(id);
        if (!interest) {
            return res.status(404).json({ message: 'User interest not found' });
        }
        return res.status(200).json({
            message: 'User interest deleted successfully',
            deletedInterest: interest
        });
    } catch (error) {
        return res.status(400).json({ message: (error as Error).message });
    }
}

export async function getUserInterestStats(req: Request, res: Response): Promise<Response> {
    try {
        const stats = await userInterestService.getUserInterestStats();
        return res.status(200).json(stats);
    } catch (error) {
        return res.status(500).json({ message: (error as Error).message });
    }
}

export async function getUserInterestsByUser(req: Request, res: Response): Promise<Response> {
    try {
        const { userId } = req.params;
        const interests = await userInterestService.getUserInterestsByUser(userId);
        return res.status(200).json(interests);
    } catch (error) {
        return res.status(500).json({ message: (error as Error).message });
    }
}

export async function getUserInterestsByTag(req: Request, res: Response): Promise<Response> {
    try {
        const { tagId } = req.params;
        const interests = await userInterestService.getUserInterestsByTag(tagId);
        return res.status(200).json(interests);
    } catch (error) {
        return res.status(500).json({ message: (error as Error).message });
    }
}

export async function createInitialInterests(req: Request, res: Response): Promise<Response> {
    try {
        const { userId, interests } = req.body as { userId: string, interests: { tagId: string, score: number }[] };
        if (!userId || !Array.isArray(interests)) {
            return res.status(400).json({ error: 'userId e interests son requeridos' });
        }
        await userInterestService.createInitialInterests(userId, interests);
        return res.status(201).json({ message: 'Initial interests created successfully' });
    } catch (error) {
        return res.status(500).json({ message: (error as Error).message });
    }
}