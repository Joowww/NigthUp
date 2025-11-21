import { Request, Response } from 'express';
import { IEvent } from '../models/event';
import { EventService } from '../services/eventServices';
import { validationResult } from 'express-validator';

const eventService = new EventService();

export async function createEvent(req: Request, res: Response): Promise<Response> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const eventData: Partial<IEvent> = req.body;
        const event = await eventService.createEvent(eventData);

        if (!event) {
            return res.status(500).json({ error: 'FAILED TO CREATE EVENT' });
        }

        return res.status(201).json(event);
    } catch (error) {
        return res.status(500).json({
            error: 'FAILED TO CREATE EVENT',
            details: (error as Error).message
        });
    }
}

export async function getAllEvents(req: Request, res: Response): Promise<Response> {
    try {
        const skip = parseInt(req.query.skip as string) || 0;
        const limit = parseInt(req.query.limit as string) || 10;
        
        const result = await eventService.getAllEvents(skip, limit);
        
        return res.status(200).json({
            events: result.events,
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

export async function getAllEventsWithInactive(req: Request, res: Response): Promise<Response> {
    console.log('🔍 [DEBUG] getAllEventsWithInactive - INICIANDO');
    
    try {
        const skip = parseInt(req.query.skip as string) || 0;
        const limit = parseInt(req.query.limit as string) || 10;
        
        console.log(`🔍 [DEBUG] Params - skip: ${skip}, limit: ${limit}`);
        
        const result = await eventService.getAllEventsWithInactive(skip, limit);
        
        console.log(`🔍 [DEBUG] Encontrados ${result.events.length} eventos de ${result.total} totales`);
        
        return res.status(200).json({
            events: result.events,
            pagination: {
                skip,
                limit,
                total: result.total,
                hasMore: (skip + limit) < result.total
            }
        });
    } catch (error) {
        console.error('❌ [DEBUG] Error en getAllEventsWithInactive:', error);
        return res.status(404).json({ message: (error as Error).message });
    }
}

export async function getEventByIdentifier(req: Request, res: Response): Promise<Response> {
    try {
        const { identifier } = req.params;
        const event = await eventService.getEventByIdentifier(identifier);
        if (!event) return res.status(404).json({ message: 'EVENT NOT FOUND' });

        return res.status(200).json(event);
    } catch (error) {
        return res.status(400).json({ message: (error as Error).message });
    }
}

export async function updateEventByIdentifier(req: Request, res: Response): Promise<Response> {
    try {
        const { identifier } = req.params;
        const eventData: Partial<IEvent> = req.body;

        const updatedEvent = await eventService.updateEventByIdentifier(identifier, eventData);
        if (!updatedEvent) return res.status(404).json({ message: 'EVENT NOT FOUND' });

        return res.status(200).json({ message: 'Event updated successfully', event: updatedEvent });
    } catch (error) {
        return res.status(400).json({ message: (error as Error).message });
    }
}

export async function disableEventByIdentifier(req: Request, res: Response): Promise<Response> {
    try {
        const { identifier } = req.params;
        const disabledEvent = await eventService.disableEventByIdentifier(identifier);
        if (!disabledEvent) return res.status(404).json({ message: 'EVENT NOT FOUND' });

        return res.status(200).json({ message: 'Event disabled successfully', event: disabledEvent });
    } catch (error) {
        return res.status(400).json({ message: (error as Error).message });
    }
}

export async function reactivateEventByIdentifier(req: Request, res: Response): Promise<Response> {
    try {
        const { identifier } = req.params;
        const reactivatedEvent = await eventService.reactivateEventByIdentifier(identifier);
        if (!reactivatedEvent) return res.status(404).json({ message: 'EVENT NOT FOUND' });

        return res.status(200).json({ message: 'Event reactivated successfully', event: reactivatedEvent });
    } catch (error) {
        return res.status(400).json({ message: (error as Error).message });
    }
}

export async function deleteEventByIdentifier(req: Request, res: Response): Promise<Response> {
    try {
        const { identifier } = req.params;
        const deletedEvent = await eventService.deleteEventByIdentifier(identifier);

        if (!deletedEvent) return res.status(404).json({ message: 'EVENT NOT FOUND' });

        return res.status(200).json({ message: 'Event permanently deleted', event: deletedEvent });
    } catch (error) {
        return res.status(400).json({ message: (error as Error).message });
    }
}

export async function addUserToEvent(req: Request, res: Response): Promise<Response> {
    try {
        const { identifier } = req.params;
        const { userIdentifier } = req.body;

        if (!userIdentifier) return res.status(400).json({ message: 'Missing userIdentifier' });

        const updated = await eventService.addUserToEvent(identifier, userIdentifier);

        if (!updated) return res.status(404).json({ message: 'EVENT NOT FOUND' });

        return res.status(200).json(updated);
    } catch (error) {
        return res.status(400).json({ message: (error as Error).message });
    }
}

export async function removeUserFromEvent(req: Request, res: Response): Promise<Response> {
    try {
        const { identifier } = req.params;
        const { userIdentifier } = req.body;

        if (!userIdentifier) return res.status(400).json({ message: 'Missing userIdentifier' });

        const updated = await eventService.removeUserFromEvent(identifier, userIdentifier);
        if (!updated) return res.status(404).json({ message: 'EVENT NOT FOUND' });

        return res.status(200).json(updated);
    } catch (error) {
        return res.status(400).json({ message: (error as Error).message });
    }
}

export async function getEventStats(req: Request, res: Response): Promise<Response> {
    try {
        const stats = await eventService.getEventStats();
        return res.status(200).json(stats);
    } catch (error) {
        return res.status(500).json({ message: (error as Error).message });
    }
}

// NUEVO: Unirse a un evento como usuario autenticado
export async function joinEvent(req: Request, res: Response): Promise<Response> {
    try {
        const { identifier } = req.params;
        const userId = (req as any).user.id;

        if (!userId) {
            return res.status(400).json({ message: 'User ID not found in token' });
        }

        const updated = await eventService.addSelfToEvent(identifier, userId);

        if (!updated) {
            return res.status(404).json({ message: 'EVENT NOT FOUND' });
        }

        return res.status(200).json({
            message: 'Successfully joined the event',
            event: updated
        });
    } catch (error) {
        return res.status(400).json({ message: (error as Error).message });
    }
}

// NUEVO: Salir de un evento como usuario autenticado
export async function leaveEvent(req: Request, res: Response): Promise<Response> {
    try {
        const { identifier } = req.params;
        const userId = (req as any).user.id;

        if (!userId) {
            return res.status(400).json({ message: 'User ID not found in token' });
        }

        const updated = await eventService.removeSelfFromEvent(identifier, userId);

        if (!updated) {
            return res.status(404).json({ message: 'EVENT NOT FOUND' });
        }

        return res.status(200).json({
            message: 'Successfully left the event',
            event: updated
        });
    } catch (error) {
        return res.status(400).json({ message: (error as Error).message });
    }
}