import { Request, Response } from 'express';
import { EventService } from '../services/eventServices';
import { User } from '../models/user';
import { Event } from '../models/event';

const eventService = new EventService();

function normalizeSchedule(s: any): string {
  if (Array.isArray(s)) return s[0] || '';
  return s || '';
}

function normalizeParticipants(p: any): string[] {
  if (Array.isArray(p)) return p.filter(Boolean);
  if (Array.isArray((p || {}).participants)) return (p.participants as any[]).filter(Boolean) as string[];
  return [];
}

export async function createEvent(req: Request, res: Response): Promise<Response> {
  try {
    const { name, schedule, address, participants } = req.body;
    const scheduleStr = normalizeSchedule(schedule);
    const participantIds = normalizeParticipants(participants);

    const created = await eventService.createEvent({
      name,
      schedule: scheduleStr,
      address,
      participants: participantIds as any
    });

    if (participantIds.length > 0) {
      await User.updateMany(
        { _id: { $in: participantIds } },
        { $addToSet: { events: created._id } }
      ).exec();
    }

    const populated = await Event.findById(created._id)
      .populate('participants', 'username email')
      .exec();

    return res.status(201).json(populated ?? created);
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
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
    return res.status(400).json({ message: (error as Error).message });
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
    return res.status(400).json({ message: (error as Error).message });
  }
}

export async function getEventById(req: Request, res: Response): Promise<Response> {
  try {
    const { id } = req.params;
    const event = await eventService.getEventById(id);
    if (!event) return res.status(404).json({ message: 'EVENT NOT FOUND' });
    return res.status(200).json(event);
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
}

export async function disableEventById(req: Request, res: Response): Promise<Response> {
  try {
    const { id } = req.params;
    const disabledEvent = await eventService.disableEventById(id);
    if (!disabledEvent) return res.status(404).json({ message: 'EVENT NOT FOUND' });
    return res.status(200).json({ 
      message: 'Event disabled successfully',
      event: disabledEvent 
    });
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
}

export async function reactivateEventById(req: Request, res: Response): Promise<Response> {
  try {
    const { id } = req.params;
    const reactivatedEvent = await eventService.reactivateEventById(id);
    if (!reactivatedEvent) return res.status(404).json({ message: 'EVENT NOT FOUND' });
    return res.status(200).json({ 
      message: 'Event reactivated successfully',
      event: reactivatedEvent 
    });
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
}

export async function deleteEventById(req: Request, res: Response): Promise<Response> {
  try {
    const { id } = req.params;
    const deletedEvent = await eventService.deleteEventById(id);
    if (!deletedEvent) return res.status(404).json({ message: 'EVENT NOT FOUND' });
    return res.status(200).json({ 
      message: 'Event permanently deleted',
      event: deletedEvent 
    });
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
}