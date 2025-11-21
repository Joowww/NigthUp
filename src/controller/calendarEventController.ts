import { Request, Response } from 'express';
import { CalendarEventService } from '../services/calendarEventServices';

const calendarEventService = new CalendarEventService();

export async function createCalendarEvent(req: Request, res: Response): Promise<Response> {
  try {
    const userId = (req as any).user.id;
    const { title, description, start, end, allDay, type, relatedEvent, location } = req.body;

    const calendarEvent = await calendarEventService.createCalendarEvent({
      userId,
      title,
      description,
      start,
      end,
      allDay,
      type,
      relatedEvent,
      location
    });
    return res.status(201).json(calendarEvent);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
}

export async function getCalendarEvents(req: Request, res: Response): Promise<Response> {
  try {
    const userId = (req as any).user.id;
    const { start, end } = req.query;

    if (!start || !end) {
      return res.status(400).json({ error: 'Start and end dates are required' });
    }

    const startDate = new Date(start as string);
    const endDate = new Date(end as string);

    const events = await calendarEventService.getCalendarEventsForUser(userId, startDate, endDate);
    return res.status(200).json(events);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
}

export async function updateCalendarEvent(req: Request, res: Response): Promise<Response> {
  try {
    const { eventId } = req.params;
    const userId = (req as any).user.id;
    const eventData = req.body;

    const updatedEvent = await calendarEventService.updateCalendarEvent(eventId, eventData, userId);
    if (!updatedEvent) {
      return res.status(404).json({ error: 'Calendar event not found' });
    }
    return res.status(200).json(updatedEvent);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
}

export async function deleteCalendarEvent(req: Request, res: Response): Promise<Response> {
  try {
    const { eventId } = req.params;
    const userId = (req as any).user.id;
    const deletedEvent = await calendarEventService.deleteCalendarEvent(eventId, userId);
    if (!deletedEvent) {
      return res.status(404).json({ error: 'Calendar event not found' });
    }
    return res.status(200).json({ message: 'Calendar event deleted' });
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
}

export async function syncUserEvents(req: Request, res: Response): Promise<Response> {
  try {
    const userId = (req as any).user.id;
    const events = await calendarEventService.syncUserEvents(userId);
    return res.status(200).json(events);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
}

export async function addReminder(req: Request, res: Response): Promise<Response> {
  try {
    const { eventId } = req.params;
    const userId = (req as any).user.id;
    const { reminderTime } = req.body;

    const event = await calendarEventService.addReminder(eventId, new Date(reminderTime), userId);
    if (!event) {
      return res.status(404).json({ error: 'Calendar event not found' });
    }
    return res.status(200).json(event);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
}

export async function shareEventWithUser(req: Request, res: Response): Promise<Response> {
  try {
    const { eventId } = req.params;
    const ownerId = (req as any).user.id;
    const { targetUserId, permission } = req.body;

    if (!targetUserId) {
      return res.status(400).json({ error: 'targetUserId is required' });
    }

    const event = await calendarEventService.shareEventWithUser(eventId, ownerId, targetUserId, permission);
    return res.status(200).json(event);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
}

export async function respondToSharedEvent(req: Request, res: Response): Promise<Response> {
  try {
    const { eventId } = req.params;
    const userId = (req as any).user.id;
    const { accept } = req.body;

    const event = await calendarEventService.respondToSharedEvent(eventId, userId, accept);
    return res.status(200).json(event);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
}

export async function getSharedEvents(req: Request, res: Response): Promise<Response> {
  try {
    const userId = (req as any).user.id;
    const events = await calendarEventService.getSharedEvents(userId);
    return res.status(200).json(events);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
}