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

        // 1. Búsqueda Semántica (Weaviate)
        // Obtenemos los IDs de los eventos semánticamente relevantes
        const searchResult = await aiService.analyzeQuery(query);
        const relevantEventIds = searchResult.eventIds;

        console.log(`[AI Controller] Weaviate returned ${relevantEventIds.length} candidates.`);

        // 2. Recuperación de datos completos (MongoDB)
        // Filtramos en Mongo solo los eventos que la IA consideró relevantes
        // Nota: Mantenemos el filtro { active: true } por seguridad
        const events = await Event.find({
            _id: { $in: relevantEventIds },
            active: true
        });

        // Opcional: Podríamos reordenarlos para respetar el orden de relevancia de Weaviate
        const sortedEvents = relevantEventIds
            .map(id => events.find(e => e._id.toString() === id))
            .filter(e => e !== undefined);

        // 3. Generar respuesta natural (OpenAI)
        const naturalResponse = await aiService.generateResponse(query, sortedEvents);

        return res.status(200).json({
            meta: {
                originalQuery: query,
                strategy: 'semantic-search-weaviate + generative-response'
            },
            message: naturalResponse, // <--- Mensaje generado por GPT
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
