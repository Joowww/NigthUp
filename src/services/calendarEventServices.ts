import { CalendarEvent, ICalendarEvent } from '../models/calendarEvent';
import { User } from '../models/user';
import { Types } from 'mongoose';

export class CalendarEventService {
  async createCalendarEvent(eventData: Partial<ICalendarEvent>): Promise<ICalendarEvent> {
    const calendarEvent = new CalendarEvent(eventData);
    return await calendarEvent.save();
  }

  async getCalendarEventsForUser(userId: string, start: Date, end: Date): Promise<ICalendarEvent[]> {
    return await CalendarEvent.find({
      $and: [
        {
          $or: [
            { userId },
            { 'sharedWith.userId': userId, 'sharedWith.status': 'accepted' },
            { isPublic: true, type: { $in: ['event', 'business'] } }
          ]
        },
        {
          $or: [
            { start: { $gte: start, $lte: end } },
            { end: { $gte: start, $lte: end } },
            { allDay: true, start: { $lte: end }, end: { $gte: start } }
          ]
        }
      ]
    })
    .populate('userId', 'username email profilePicture')
    .populate('relatedEvent', 'name schedule location')
    .populate('sharedWith.userId', 'username email profilePicture')
    .sort({ start: 1 });
  }

  async shareEventWithUser(eventId: string, ownerId: string, targetUserId: string, permission: 'view' | 'edit' = 'view'): Promise<ICalendarEvent | null> {
    const event = await CalendarEvent.findOne({ _id: eventId, userId: ownerId });
    if (!event) {
      throw new Error('Event not found or you are not the owner');
    }

    const alreadyShared = event.sharedWith.some(share => 
      share.userId.toString() === targetUserId
    );

    if (alreadyShared) {
      throw new Error('Event already shared with this user');
    }

    event.sharedWith.push({
      userId: targetUserId as any,
      permission,
      status: 'pending'
    });

    return await event.save();
  }

  async respondToSharedEvent(eventId: string, userId: string, accept: boolean): Promise<ICalendarEvent | null> {
    const event = await CalendarEvent.findOne({
      _id: eventId,
      'sharedWith.userId': userId
    });

    if (!event) {
      throw new Error('Shared event not found');
    }

    const shareIndex = event.sharedWith.findIndex(share => 
      share.userId.toString() === userId
    );

    if (shareIndex !== -1) {
      event.sharedWith[shareIndex].status = accept ? 'accepted' : 'declined';
    }

    return await event.save();
  }

  async syncUserEvents(userId: string): Promise<ICalendarEvent[]> {
    const user = await User.findById(userId).populate('events');
    
    if (!user) {
      throw new Error('User not found');
    }

    const userEvents = user.events || [];
    
    for (const event of userEvents) {
      const existingCalendarEvent = await CalendarEvent.findOne({
        userId,
        relatedEvent: event._id,
        type: 'event'
      });

      if (!existingCalendarEvent) {
        let locationString = '';
        if ((event as any).location && (event as any).location.coordinates) {
          const [lng, lat] = (event as any).location.coordinates;
          locationString = `${lat}, ${lng}`;
        }

        await this.createCalendarEvent({
          userId: new Types.ObjectId(userId),
          title: (event as any).name,
          description: (event as any).description,
          start: (event as any).schedule,
          end: new Date((event as any).schedule.getTime() + 3 * 60 * 60 * 1000), 
          allDay: false,
          type: 'event',
          relatedEvent: (event as any)._id,
          location: (event as any).location,
          color: '#10b981'
        });
      }
    }
    return await CalendarEvent.find({ 
      $or: [
        { userId },
        { 'sharedWith.userId': userId, 'sharedWith.status': 'accepted' }
      ]
    })
    .populate('relatedEvent', 'name schedule location')
    .populate('sharedWith.userId', 'username email')
    .sort({ start: 1 });
  }

  async updateCalendarEvent(eventId: string, eventData: Partial<ICalendarEvent>, userId: string): Promise<ICalendarEvent | null> {
    const event = await CalendarEvent.findById(eventId);
    
    if (!event) {
      throw new Error('Event not found');
    }

    const canEdit = event.userId.toString() === userId || 
      event.sharedWith.some(share => 
        share.userId.toString() === userId && 
        share.permission === 'edit' && 
        share.status === 'accepted'
      );

    if (!canEdit) {
      throw new Error('You do not have permission to edit this event');
    }

    return await CalendarEvent.findByIdAndUpdate(eventId, eventData, { new: true });
  }

  async deleteCalendarEvent(eventId: string, userId: string): Promise<ICalendarEvent | null> {
    const event = await CalendarEvent.findOne({ _id: eventId, userId });
    
    if (!event) {
      throw new Error('Event not found or you are not the owner');
    }

    return await CalendarEvent.findByIdAndDelete(eventId);
  }

  async addReminder(eventId: string, reminderTime: Date, userId: string): Promise<ICalendarEvent | null> {
    const event = await CalendarEvent.findOne({
      _id: eventId,
      $or: [
        { userId },
        { 'sharedWith.userId': userId, 'sharedWith.status': 'accepted' }
      ]
    });

    if (!event) {
      throw new Error('Event not found or no access');
    }

    return await CalendarEvent.findByIdAndUpdate(
      eventId,
      { $addToSet: { reminders: reminderTime } },
      { new: true }
    );
  }

  async getSharedEvents(userId: string): Promise<ICalendarEvent[]> {
    return await CalendarEvent.find({
      'sharedWith.userId': userId,
      'sharedWith.status': 'pending'
    })
    .populate('userId', 'username email profilePicture')
    .populate('relatedEvent', 'name schedule location')
    .sort({ createdAt: -1 });
  }
}