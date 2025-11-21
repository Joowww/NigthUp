import Event, { IEvent } from '../models/event';
import User from '../models/user';
import mongoose from 'mongoose';

export interface EventStats {
    total: number;
    active: number;
    inactive: number;
    newCount: number | null;
    lastUpdated?: string | null;
}

export class EventService {
    private buildEventIdentifierFilter(identifier: string) {
        if (mongoose.Types.ObjectId.isValid(identifier)) {
            return { _id: new mongoose.Types.ObjectId(identifier) };
        } else {
            return { name: identifier };
        }
    }

    async createEvent(eventData: Partial<IEvent>): Promise<IEvent | null> {
        try {
            const newEvent = new Event(eventData);
            return await newEvent.save();
        } catch (error) {
            throw new Error((error as Error).message);
        }
    }

    async getAllEvents(skip: number = 0, limit: number = 10): Promise<{events: IEvent[], total: number}> {
        const events = await Event.find({ active: true })
            .skip(skip)
            .limit(limit)
            .populate('participants', 'username email')
            .sort({ createdAt: -1 });

        const total = await Event.countDocuments({ active: true });
        return { events, total };
    }

    async getAllEventsWithInactive(skip: number = 0, limit: number = 10): Promise<{events: IEvent[], total: number}> {
        console.log('[DEBUG SERVICE] getAllEventsWithInactive - Buscando eventos...');
        
        try {
            const events = await Event.find()
                .skip(skip)
                .limit(limit)
                .populate('participants', 'username email')
                .sort({ createdAt: -1 });

            const total = await Event.countDocuments();
            
            console.log(`[DEBUG SERVICE] Encontrados ${events.length} eventos de ${total} totales`);
            
            return { events, total };
        } catch (error) {
            console.error('[DEBUG SERVICE] Error en getAllEventsWithInactive:', error);
            throw error;
        }
    }

    async getEventByIdentifier(identifier: string): Promise<IEvent | null> {
        const filter = this.buildEventIdentifierFilter(identifier);
        return await Event.findOne({ ...filter, active: true })
            .populate('participants', 'username email');
    }

    async updateEventByIdentifier(identifier: string, eventData: Partial<IEvent>): Promise<IEvent | null> {
        const filter = this.buildEventIdentifierFilter(identifier);
        return await Event.findOneAndUpdate(
            { ...filter, active: true },
            eventData,
            { new: true }
        ).populate('participants', 'username email');
    }

    async disableEventByIdentifier(identifier: string): Promise<IEvent | null> {
        const filter = this.buildEventIdentifierFilter(identifier);
        return await Event.findOneAndUpdate(
            filter,
            { active: false },
            { new: true }
        ).populate('participants', 'username email');
    }

    async reactivateEventByIdentifier(identifier: string): Promise<IEvent | null> {
        const filter = this.buildEventIdentifierFilter(identifier);
        return await Event.findOneAndUpdate(
            filter,
            { active: true },
            { new: true }
        ).populate('participants', 'username email');
    }

    async deleteEventByIdentifier(identifier: string): Promise<IEvent | null> {
        const filter = this.buildEventIdentifierFilter(identifier);
        return await Event.findOneAndDelete(filter);
    }

    async addUserToEvent(eventIdentifier: string, userIdentifier: string): Promise<IEvent | null> {
        const eventFilter = this.buildEventIdentifierFilter(eventIdentifier);

        let userFilter;
        if (mongoose.Types.ObjectId.isValid(userIdentifier)) {
            userFilter = { _id: new mongoose.Types.ObjectId(userIdentifier) };
        } else {
            userFilter = {
                $or: [
                    { username: userIdentifier },
                    { email: userIdentifier }
                ]
            };
        }

        const user = await User.findOne(userFilter);
        if (!user) {
            throw new Error('USER NOT FOUND');
        }

        const updatedEvent = await Event.findOneAndUpdate(
            eventFilter,
            { $addToSet: { participants: user._id } },
            { new: true }
        ).populate('participants', 'username email');

        if (updatedEvent) {
            await User.findByIdAndUpdate(
                user._id,
                { $addToSet: { events: updatedEvent._id } },
                { new: true }
            );
        }

        return updatedEvent;
    }

    async removeUserFromEvent(eventIdentifier: string, userIdentifier: string): Promise<IEvent | null> {
        const eventFilter = this.buildEventIdentifierFilter(eventIdentifier);

        let userFilter;
        if (mongoose.Types.ObjectId.isValid(userIdentifier)) {
            userFilter = { _id: new mongoose.Types.ObjectId(userIdentifier) };
        } else {
            userFilter = {
                $or: [
                    { username: userIdentifier },
                    { email: userIdentifier }
                ]
            };
        }

        const user = await User.findOne(userFilter);
        if (!user) {
            throw new Error('USER NOT FOUND');
        }

        const updatedEvent = await Event.findOneAndUpdate(
            eventFilter,
            { $pull: { participants: user._id } },
            { new: true }
        ).populate('participants', 'username email');

        if (updatedEvent) {
            await User.findByIdAndUpdate(
                user._id,
                { $pull: { events: updatedEvent._id } },
                { new: true }
            );
        }
        return updatedEvent;
    }

    async getEventStats(): Promise<EventStats> {
        const total = await Event.countDocuments();
        const active = await Event.countDocuments({ active: true });
        const inactive = await Event.countDocuments({ active: false });

        let newCount: number | null = null;
        let lastUpdated: string | null = null;

        const schemaPaths = Event.schema.paths;
        if (schemaPaths['createdAt']) {
            const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            newCount = await Event.countDocuments({ createdAt: { $gte: since } });
            const last = await Event.findOne().sort({ createdAt: -1 }).select('createdAt').lean() as any;
            lastUpdated = last?.createdAt ? new Date(last.createdAt).toISOString() : null;
        }
        return { total, active, inactive, newCount, lastUpdated };
    }

    async addSelfToEvent(eventIdentifier: string, userId: string): Promise<IEvent | null> {
        const eventFilter = this.buildEventIdentifierFilter(eventIdentifier);
        
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('USER NOT FOUND');
        }

        const updatedEvent = await Event.findOneAndUpdate(
            eventFilter,
            { $addToSet: { participants: user._id } },
            { new: true }
        ).populate('participants', 'username email');

        if (updatedEvent) {
            await User.findByIdAndUpdate(
                user._id,
                { $addToSet: { events: updatedEvent._id } },
                { new: true }
            );
        }

        return updatedEvent;
    }

    async removeSelfFromEvent(eventIdentifier: string, userId: string): Promise<IEvent | null> {
        const eventFilter = this.buildEventIdentifierFilter(eventIdentifier);
        
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('USER NOT FOUND');
        }

        const updatedEvent = await Event.findOneAndUpdate(
            eventFilter,
            { $pull: { participants: user._id } },
            { new: true }
        ).populate('participants', 'username email');

        if (updatedEvent) {
            await User.findByIdAndUpdate(
                user._id,
                { $pull: { events: updatedEvent._id } },
                { new: true }
            );
        }

        return updatedEvent;
    }
}