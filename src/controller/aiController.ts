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

        const searchResult = await aiService.analyzeQuery(query);
        const relevantEventIds = searchResult.eventIds;

        console.log(`[AI Controller] Weaviate returned ${relevantEventIds.length} candidates.`);

        const events = await Event.find({
            _id: { $in: relevantEventIds },
            active: true
        });

        const sortedEvents = relevantEventIds
            .map(id => events.find(e => e._id.toString() === id))
            .filter(e => e !== undefined);

        const naturalResponse = await aiService.generateResponse(query, sortedEvents);

        return res.status(200).json({
            meta: {
                originalQuery: query,
                strategy: 'semantic-search-weaviate + generative-response'
            },
            message: naturalResponse,
            count: sortedEvents.length,
            events: sortedEvents
        });

    } catch (error) {
        console.error('[AI Controller] Error:', error);
        return res.status(500).json({
            message: 'Error processing AI search',
            error: (error as Error).message
        });
    }
}
