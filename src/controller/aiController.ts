import { Request, Response } from 'express';
import { AiService } from '../services/aiService';
import { Event } from '../models/event';

const aiService = new AiService();

export async function searchEventsWithAi(req: Request, res: Response): Promise<Response> {
    try {
        const { query } = req.body;

        if (!query) {
            return res.status(400).json({ message: 'Query is required' });
        }

        const criteria = await aiService.analyzeQuery(query);
        console.log('[AI Controller] Criteria extracted:', criteria);

        const mongooseFilter: any = { active: true };

        if (criteria.keywords) {
            const regex = new RegExp(criteria.keywords, 'i');
            mongooseFilter.$or = [
                { name: regex },
                { description: regex }
            ];
        }

        if (criteria.category) {
            mongooseFilter.category = new RegExp(criteria.category, 'i');
        }

        if (criteria.maxPrice !== undefined) {
            mongooseFilter.price = { $lte: criteria.maxPrice };
        }

        if (criteria.date) {
            const startDate = new Date(criteria.date);
            startDate.setHours(0, 0, 0, 0);

            const endDate = new Date(criteria.date);
            endDate.setHours(23, 59, 59, 999);

            mongooseFilter.schedule = { $gte: startDate, $lte: endDate };
        }
        // 3. Ejecutar la búsqueda
        console.log('[AI Controller] Final Mongoose Filter:', JSON.stringify(mongooseFilter, null, 2));
        const events = await Event.find(mongooseFilter).limit(20);

        return res.status(200).json({
            meta: {
                originalQuery: query,
                interpretedCriteria: criteria
            },
            count: events.length,
            events: events
        });

    } catch (error) {
        console.error('[AI Controller] Error:', error);
        return res.status(500).json({
            message: 'Error processing AI search',
            error: (error as Error).message
        });
    }
}
