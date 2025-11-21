import { EventTinder, IEventTinder } from '../models/eventTinder';
import { User } from '../models/user';

export class EventTinderService {
  async participateInEventTinder(eventId: string, userId: string): Promise<IEventTinder> {
    let eventTinder = await EventTinder.findOne({ eventId });
    
    if (!eventTinder) {
      eventTinder = new EventTinder({
        eventId,
        participants: []
      });
    }

    // Verificar si el usuario ya está participando
    const existingParticipant = eventTinder.participants.find(p => p.userId.toString() === userId);
    if (existingParticipant) {
      existingParticipant.isParticipating = true;
    } else {
      eventTinder.participants.push({
        userId: userId as any,
        isParticipating: true,
        likes: [],
        dislikes: [],
        matches: []
      });
    }

    return await eventTinder.save();
  }

  async leaveEventTinder(eventId: string, userId: string): Promise<IEventTinder | null> {
    const eventTinder = await EventTinder.findOne({ eventId });
    if (!eventTinder) {
      throw new Error('Event tinder not found');
    }

    const participantIndex = eventTinder.participants.findIndex(p => p.userId.toString() === userId);
    if (participantIndex !== -1) {
      eventTinder.participants[participantIndex].isParticipating = false;
    }

    return await eventTinder.save();
  }

  async likeUser(eventId: string, userId: string, likedUserId: string): Promise<{ eventTinder: IEventTinder, isMatch: boolean }> {
    const eventTinder = await EventTinder.findOne({ eventId });
    if (!eventTinder) {
      throw new Error('Event tinder not found');
    }

    const participant = eventTinder.participants.find(p => p.userId.toString() === userId);
    if (!participant) {
      throw new Error('User is not participating in this event tinder');
    }

    // Verificar si ya likeó o dislikeó
    if (participant.likes.includes(likedUserId as any)) {
      throw new Error('User already liked this user');
    }
    if (participant.dislikes.includes(likedUserId as any)) {
      throw new Error('User already disliked this user');
    }

    participant.likes.push(likedUserId as any);

    // Verificar si es un match
    const likedUser = eventTinder.participants.find(p => p.userId.toString() === likedUserId);
    let isMatch = false;

    if (likedUser && likedUser.likes.includes(userId as any)) {
      // Es un match!
      participant.matches.push(likedUserId as any);
      likedUser.matches.push(userId as any);
      isMatch = true;
    }

    await eventTinder.save();
    return { eventTinder, isMatch };
  }

  async dislikeUser(eventId: string, userId: string, dislikedUserId: string): Promise<IEventTinder | null> {
    const eventTinder = await EventTinder.findOne({ eventId });
    if (!eventTinder) {
      throw new Error('Event tinder not found');
    }

    const participant = eventTinder.participants.find(p => p.userId.toString() === userId);
    if (!participant) {
      throw new Error('User is not participating in this event tinder');
    }

    // Verificar si ya likeó o dislikeó
    if (participant.likes.includes(dislikedUserId as any)) {
      throw new Error('User already liked this user');
    }
    if (participant.dislikes.includes(dislikedUserId as any)) {
      throw new Error('User already disliked this user');
    }

    participant.dislikes.push(dislikedUserId as any);
    return await eventTinder.save();
  }

  async getMatches(eventId: string, userId: string): Promise<any[]> {
    const eventTinder = await EventTinder.findOne({ eventId })
      .populate('participants.userId', 'username email profilePicture')
      .populate('participants.matches', 'username email profilePicture');

    if (!eventTinder) {
      return [];
    }

    const participant = eventTinder.participants.find(p => p.userId._id.toString() === userId);
    if (!participant) {
      return [];
    }

    return participant.matches;
  }

  async getNextUser(eventId: string, userId: string): Promise<any> {
    const eventTinder = await EventTinder.findOne({ eventId })
      .populate('participants.userId', 'username email profilePicture age bio');

    if (!eventTinder) {
      throw new Error('Event tinder not found');
    }

    const participant = eventTinder.participants.find(p => p.userId._id.toString() === userId);
    if (!participant) {
      throw new Error('User is not participating in this event tinder');
    }

    // Encontrar un usuario que no haya sido likeado ni dislikeado
    const nextUser = eventTinder.participants.find(p => 
      p.userId._id.toString() !== userId &&
      p.isParticipating &&
      !participant.likes.includes(p.userId._id) &&
      !participant.dislikes.includes(p.userId._id)
    );

    return nextUser ? nextUser.userId : null;
  }

  async getEventTinderStats(eventId: string): Promise<any> {
    const eventTinder = await EventTinder.findOne({ eventId })
      .populate('participants.userId', 'username email')
      .populate('eventId', 'name schedule');

    if (!eventTinder) {
      throw new Error('Event tinder not found');
    }

    const totalParticipants = eventTinder.participants.filter(p => p.isParticipating).length;
    const totalMatches = eventTinder.participants.reduce((sum, p) => sum + p.matches.length, 0) / 2;

    return {
      event: eventTinder.eventId,
      totalParticipants,
      totalMatches,
      isActive: eventTinder.isActive
    };
  }
}