import { Request, Response } from 'express';
import { IEvent } from '../models/event';
import { EventService } from '../services/eventServices';
import { validationResult } from 'express-validator';

const eventService = new EventService();

// Middleware para verificar si el usuario es administrador
export const requireAdmin = (req: Request, res: Response, next: Function) => {
  const userRole = req.headers['user-role'] as string;
  
  if (userRole !== 'admin') {
    return res.status(403).json({ message: 'Admin privileges required' });
  }
  
  next();
};

// Middleware para verificar si el usuario es administrador o manager
export const requireAdminOrManager = (req: Request, res: Response, next: Function) => {
  const userRole = req.headers['user-role'] as string;
  
  if (userRole !== 'admin' && userRole !== 'manager') {
    return res.status(403).json({ message: 'Admin or manager privileges required' });
  }
  
  next();
};

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
    return res.status(500).json({ error: 'FAILED TO CREATE EVENT', details: (error as Error).message });
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
  try {
    const skip = parseInt(req.query.skip as string) || 0;
    const limit = parseInt(req.query.limit as string) || 10;
    
    const result = await eventService.getAllEventsWithInactive(skip, limit);
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
    
    return res.status(200).json({ 
      message: 'Event updated successfully',
      event: updatedEvent 
    });
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
}

export async function disableEventByIdentifier(req: Request, res: Response): Promise<Response> {
  try {
    const { identifier } = req.params;
    const disabledEvent = await eventService.disableEventByIdentifier(identifier);
    if (!disabledEvent) return res.status(404).json({ message: 'EVENT NOT FOUND' });
    return res.status(200).json({ 
      message: 'Event disabled successfully',
      event: disabledEvent 
    });
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
}

export async function reactivateEventByIdentifier(req: Request, res: Response): Promise<Response> {
  try {
    const { identifier } = req.params;
    const reactivatedEvent = await eventService.reactivateEventByIdentifier(identifier);
    if (!reactivatedEvent) return res.status(404).json({ message: 'EVENT NOT FOUND' });
    return res.status(200).json({ 
      message: 'Event reactivated successfully',
      event: reactivatedEvent 
    });
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
}

export async function deleteEventByIdentifier(req: Request, res: Response): Promise<Response> {
  try {
    const { identifier } = req.params;
    const deletedEvent = await eventService.deleteEventByIdentifier(identifier);
    if (!deletedEvent) return res.status(404).json({ message: 'EVENT NOT FOUND' });
    return res.status(200).json({ 
      message: 'Event permanently deleted',
      event: deletedEvent 
    });
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