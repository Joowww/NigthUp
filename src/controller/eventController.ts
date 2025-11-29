import { Request, Response } from 'express';
import { IEvent, Event } from '../models/event';
import { EventService } from '../services/eventServices';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';

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
    console.log('[DEBUG] getAllEventsWithInactive - INICIANDO');
    
    try {
        const skip = parseInt(req.query.skip as string) || 0;
        const limit = parseInt(req.query.limit as string) || 10;
        
        console.log(`[DEBUG] Params - skip: ${skip}, limit: ${limit}`);
        
        const result = await eventService.getAllEventsWithInactive(skip, limit);
        
        console.log(`[DEBUG] Encontrados ${result.events.length} eventos de ${result.total} totales`);
        
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
        console.error('[DEBUG] Error en getAllEventsWithInactive:', error);
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

// ... tus controladores existentes ...

export async function likeEvent(req: Request, res: Response): Promise<Response> {
    try {
        const { identifier } = req.params;
        const userId = (req as any).user.id;

        if (!userId) {
            return res.status(400).json({ message: 'User ID not found in token' });
        }

        const event = await Event.findById(identifier);
        if (!event) {
            return res.status(404).json({ message: 'EVENT NOT FOUND' });
        }

        // Verificar si ya dio like
        if (event.likedBy.includes(new mongoose.Types.ObjectId(userId))) {
            return res.status(400).json({ message: 'EVENT ALREADY LIKED' });
        }

        // Añadir like
        event.likedBy.push(new mongoose.Types.ObjectId(userId));
        event.likes += 1;

        await event.save();

        return res.status(200).json({
            message: 'Event liked successfully',
            event: event,
            liked: true
        });
    } catch (error) {
        return res.status(400).json({ message: (error as Error).message });
    }
}

export async function unlikeEvent(req: Request, res: Response): Promise<Response> {
    try {
        const { identifier } = req.params;
        const userId = (req as any).user.id;

        if (!userId) {
            return res.status(400).json({ message: 'User ID not found in token' });
        }

        const event = await Event.findById(identifier);
        if (!event) {
            return res.status(404).json({ message: 'EVENT NOT FOUND' });
        }

        // Verificar si dio like
        if (!event.likedBy.includes(new mongoose.Types.ObjectId(userId))) {
            return res.status(400).json({ message: 'EVENT NOT LIKED' });
        }

        // Quitar like
        event.likedBy = event.likedBy.filter(
            id => id.toString() !== userId
        );
        event.likes = Math.max(0, event.likes - 1);

        await event.save();

        return res.status(200).json({
            message: 'Event unliked successfully',
            event: event,
            liked: false
        });
    } catch (error) {
        return res.status(400).json({ message: (error as Error).message });
    }
}

export async function getLikeStatus(req: Request, res: Response): Promise<Response> {
    try {
        const { identifier } = req.params;
        const userId = (req as any).user.id;

        if (!userId) {
            return res.status(400).json({ message: 'User ID not found in token' });
        }

        const event = await Event.findById(identifier);
        if (!event) {
            return res.status(404).json({ message: 'EVENT NOT FOUND' });
        }

        const liked = event.likedBy.includes(new mongoose.Types.ObjectId(userId));

        return res.status(200).json({
            liked: liked,
            likesCount: event.likes
        });
    } catch (error) {
        return res.status(400).json({ message: (error as Error).message });
    }
}

export async function getEventsByParticipant(req: Request, res: Response) {
    try {
        const userId = req.params.userId;
        const events = await Event.find({ participants: userId });
        return res.json({ events });
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching events', error: (error as Error).message });
    }
}

export async function getEventIdsByParticipant(req: Request, res: Response) {
    try {
        const userId = req.params.userId;
        const events = await Event.find({ participants: userId }).select('_id');
        const eventIds = events.map(e => e._id);
        return res.json({ eventIds });
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching event IDs', error: (error as Error).message });
    }
}

export async function isUserInEvent(req: Request, res: Response) {
    try {
        const { userId, eventId } = req.params;
        const event = await Event.findOne({ _id: eventId, participants: userId });
        return res.json({ isParticipant: !!event });
    } catch (error) {
        return res.status(500).json({ message: 'Error checking participation', error: (error as Error).message });
    }
}

export async function getParticipantsByEvent(req: Request, res: Response) {
    try {
        const eventId = req.params.eventId;
        const event = await Event.findById(eventId).populate('participants', 'username avatar _id');
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        return res.json({ participants: event.participants });
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching participants', error: (error as Error).message });
    }
}

