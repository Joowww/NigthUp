import { Event, IEvent } from '../models/event';

export class EventService {
  async createEvent(data: Partial<IEvent>): Promise<IEvent> {
    const e = new Event(data);
    return await e.save();
  }

  async getAllEvents(skip: number = 0, limit: number = 10): Promise<{events: IEvent[], total: number}> {
    const events = await Event.find({ active: true })
      .skip(skip)
      .limit(limit);
    
    const total = await Event.countDocuments({ active: true });
    
    return { events, total };
  }

  async getAllEventsWithInactive(skip: number = 0, limit: number = 10): Promise<{events: IEvent[], total: number}> {
    const events = await Event.find()
      .skip(skip)
      .limit(limit);
    
    const total = await Event.countDocuments();
    
    return { events, total };
  }

  async getEventById(id: string): Promise<IEvent | null> {
    return await Event.findOne({ _id: id, active: true });
  }

  async disableEventById(id: string): Promise<IEvent | null> {
    return await Event.findByIdAndUpdate(
      id, 
      { active: false }, 
      { new: true }
    );
  }

  async reactivateEventById(id: string): Promise<IEvent | null> {
    return await Event.findByIdAndUpdate(
      id, 
      { active: true }, 
      { new: true }
    );
  }

  async deleteEventById(id: string): Promise<IEvent | null> {
    return await Event.findByIdAndDelete(id);
  }
  async updateEventById(id: string, event: Partial<IEvent>): Promise<IEvent | null> {
    return await Event.findOneAndUpdate(
      { _id: id, active: true }, 
      event, 
      { new: true }
    );
  }
  async getUsersByEventId(id: string): Promise<IEvent | null> {
    return await Event.findById(id).populate('users');
  }

  async addUserToEvent(eventId: string, userId: string): Promise<IEvent | null> {
    return await Event.findByIdAndUpdate(
      eventId,
      { $addToSet: { users: userId } },
      { new: true }
    ).populate('users');
  }

  async removeUserFromEvent(eventId: string, userId: string): Promise<IEvent | null> {
    return await Event.findByIdAndUpdate(
      eventId,
      { $pull: { users: userId } },
      { new: true }
    ).populate('users');
  }

  async getEventsByUserId(userId: string): Promise<IEvent[]> {
    return await Event.find({ participants: userId, active: true });
  }

async updateEvent(id: string, data: Partial<IEvent>): Promise<IEvent | null> {
    return await Event.findByIdAndUpdate(id, data, { new: true });
  }
  
}