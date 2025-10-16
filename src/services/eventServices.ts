import { Event, IEvent } from '../models/event';

export class EventService {
  async createEvent(data: Partial<IEvent>): Promise<IEvent> {
    const event = new Event(data);
    return await event.save();
  }

  async getAllEvents(skip: number = 0, limit: number = 10): Promise<{events: IEvent[], total: number}> {
    const events = await Event.find({ active: true })
      .skip(skip)
      .limit(limit)
      .populate('participants', 'username email');
    
    const total = await Event.countDocuments({ active: true });
    return { events, total };
  }

  async getAllEventsWithInactive(skip: number = 0, limit: number = 10): Promise<{events: IEvent[], total: number}> {
    const events = await Event.find()
      .skip(skip)
      .limit(limit)
      .populate('participants', 'username email');
    
    const total = await Event.countDocuments();
    return { events, total };
  }

  async getEventById(id: string): Promise<IEvent | null> {
    return await Event.findOne({ _id: id, active: true })
      .populate('participants', 'username email');
  }

  async disableEventById(id: string): Promise<IEvent | null> {
    return await Event.findByIdAndUpdate(
      id, 
      { active: false }, 
      { new: true }
    ).populate('participants', 'username email');
  }

  async reactivateEventById(id: string): Promise<IEvent | null> {
    return await Event.findByIdAndUpdate(
      id, 
      { active: true }, 
      { new: true }
    ).populate('participants', 'username email');
  }

  async deleteEventById(id: string): Promise<IEvent | null> {
    return await Event.findByIdAndDelete(id);
  }

  async updateEvent(id: string, data: Partial<IEvent>): Promise<IEvent | null> {
    return await Event.findByIdAndUpdate(
      id, 
      data, 
      { new: true }
    ).populate('participants', 'username email');
  }

  async getUsersByEventId(id: string): Promise<IEvent | null> {
    return await Event.findById(id)
      .populate('participants', 'username email birthday');
  }

  async addUserToEvent(eventId: string, userId: string): Promise<IEvent | null> {
    return await Event.findByIdAndUpdate(
      eventId,
      { $addToSet: { participants: userId } },
      { new: true }
    ).populate('participants', 'username email');
  }

  async removeUserFromEvent(eventId: string, userId: string): Promise<IEvent | null> {
    return await Event.findByIdAndUpdate(
      eventId,
      { $pull: { participants: userId } },
      { new: true }
    ).populate('participants', 'username email');
  }

  async getEventsByUserId(userId: string): Promise<IEvent[]> {
    return await Event.find({ participants: userId, active: true })
      .populate('participants', 'username email');
  }
}