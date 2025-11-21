import { Request, Response } from 'express';
import { IUserTrust } from '../models/userTrust';
import { UserTrustService } from '../services/userTrustServices';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';

const userTrustService = new UserTrustService();

export async function createTrustRating(req: Request, res: Response): Promise<Response> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const rater = (req as any).user?.id; 
        const { rated, score, comment, context } = req.body;

        if (!rater) {
            return res.status(401).json({ error: 'Usuario no autenticado' });
        }

        if (!mongoose.Types.ObjectId.isValid(rated)) {
            return res.status(400).json({ error: 'Invalid rated user ID' });
        }

        if (score < 1 || score > 5) {
            return res.status(400).json({ error: 'Score must be between 1 and 5' });
        }

        const hasRated = await userTrustService.hasUserRated(rater, rated, context);
        if (hasRated) {
            return res.status(400).json({
                error: 'You have already rated this user in this context'
            });
        }

        const newTrust: Partial<IUserTrust> = {
            rater, 
            rated,
            score,
            comment,
            context
        };

        const trustRating = await userTrustService.createTrustRating(newTrust);

        return res.status(201).json(trustRating);
    } catch (error) {
        return res.status(500).json({
            error: 'Error creating trust rating',
            details: (error as Error).message
        });
    }
}

export async function getTrustRatings(req: Request, res: Response): Promise<Response> {
    try {
        const skip = parseInt(req.query.skip as string) || 0;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string | undefined;

        const result = await userTrustService.getTrustRatings(skip, limit, search);
        return res.status(200).json({
            ratings: result.ratings,
            pagination: {
                skip,
                limit,
                total: result.total,
                hasMore: (skip + limit) < result.total
            }
        });
    } catch (error) {
        return res.status(500).json({ message: (error as Error).message });
    }
}

export async function getTrustRatingById(req: Request, res: Response): Promise<Response> {
    try {
        const { id } = req.params;
        const rating = await userTrustService.getTrustRatingById(id);
        if (!rating) {
            return res.status(404).json({ message: 'Trust rating not found' });
        }
        return res.status(200).json(rating);
    } catch (error) {
        return res.status(500).json({ message: (error as Error).message });
    }
}

export async function updateTrustRating(req: Request, res: Response): Promise<Response> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { id } = req.params;
        const { score, comment } = req.body as Partial<IUserTrust>;

        if (score && (score < 1 || score > 5)) {
            return res.status(400).json({ error: 'Score must be between 1 and 5' });
        }
        const updatedRating = await userTrustService.updateTrustRating(id, { score, comment });
        if (!updatedRating) {
            return res.status(404).json({ message: 'Trust rating not found' });
        }
        return res.status(200).json(updatedRating);
    } catch (error) {
        return res.status(500).json({ message: (error as Error).message });
    }
}

export async function deleteTrustRating(req: Request, res: Response): Promise<Response> {
    try {
        const { id } = req.params;
        const rating = await userTrustService.deleteTrustRating(id);
        if (!rating) {
            return res.status(404).json({ message: 'Trust rating not found' });
        }
        return res.status(200).json({
            message: 'Trust rating deleted successfully',
            deletedRating: rating
        });
    } catch (error) {
        return res.status(500).json({ message: (error as Error).message });
    }
}

export async function getUserTrustStats(req: Request, res: Response): Promise<Response> {
    try {
        const { userId } = req.params;
        const stats = await userTrustService.getUserTrustStats(userId);
        return res.status(200).json(stats);
    } catch (error) {
        return res.status(500).json({ message: (error as Error).message });
    }
}

export async function getTrustRatingsByUser(req: Request, res: Response): Promise<Response> {
    try {
        const { userId } = req.params;
        const ratings = await userTrustService.getTrustRatingsByUser(userId);
        return res.status(200).json(ratings);
    } catch (error) {
        return res.status(500).json({ message: (error as Error).message });
    }
}

export async function getTrustRatingsFromUser(req: Request, res: Response): Promise<Response> {
    try {
        const { userId } = req.params;
        const ratings = await userTrustService.getTrustRatingsFromUser(userId);
        return res.status(200).json(ratings);
    } catch (error) {
        return res.status(500).json({ message: (error as Error).message });
    }
}

export async function getUserTrustSummary(req: Request, res: Response): Promise<Response> {
    try {
        const { userId } = req.params;
        const summary = await userTrustService.getUserTrustSummary(userId);
        return res.status(200).json(summary);
    } catch (error) {
        return res.status(500).json({ message: (error as Error).message });
    }
}

export async function getAllUsersTrustSummary(req: Request, res: Response): Promise<Response> {
    try {
        const summaries = await userTrustService.getAllUsersTrustSummary();
        return res.status(200).json(summaries);
    } catch (error) {
        return res.status(500).json({ message: (error as Error).message });
    }
}

export async function getGlobalAverageTrust(req: Request, res: Response): Promise<Response> {
  try {
    const average = await userTrustService.getGlobalAverageTrust();
    return res.status(200).json({ averageTrust: average });
  } catch (error) {
    return res.status(500).json({ message: (error as Error).message });
  }
}