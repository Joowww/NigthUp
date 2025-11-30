import User, { IUser } from '../models/user';
import EventModel from '../models/event';
import mongoose from 'mongoose';

export interface UserStats {
    total: number;
    active: number;
    inactive: number;
    newCount: number | null;
    lastUpdated?: string | null;
}

export class UserService {
    private buildIdentifierFilter(identifier: string) {
        if (mongoose.Types.ObjectId.isValid(identifier)) {
            return { _id: new mongoose.Types.ObjectId(identifier) };
        } else {
            return {
                $or: [
                    { username: identifier },
                    { email: identifier }
                ]
            };
        }
    }

    private async findEventByIdentifier(eventIdentifier: string) {
        if (mongoose.Types.ObjectId.isValid(eventIdentifier)) {
            return await EventModel.findById(eventIdentifier);
        } else {
            return await EventModel.findOne({ name: eventIdentifier });
        }
    }

    async createUser(userData: Partial<IUser>): Promise<IUser | null> {
        try {
            const newUser = new User(userData);
            return await newUser.save();
        } catch (error) {
            throw new Error((error as Error).message);
        }
    }

    async getAllUsers(skip: number = 0, limit: number = 10): Promise<{ users: IUser[], total: number }> {
        const users = await User.find({ active: true })
            .skip(skip)
            .limit(limit)
            .populate('events', 'username email');

        const total = await User.countDocuments({ active: true });
        return { users, total };
    }

    async getAllUsersWithInactive(skip: number = 0, limit: number = 10): Promise<{ users: IUser[], total: number }> {
        const users = await User.find()
            .skip(skip)
            .limit(limit)
            .populate('events', 'username email');

        const total = await User.countDocuments();
        return { users, total };
    }

    async getUserByIdentifier(identifier: string): Promise<IUser | null> {
        const filter = this.buildIdentifierFilter(identifier);
        return await User.findOne({ ...filter, active: true })
            .populate('events', 'username email')
            .select('-password');
    }

    async updateUserByIdentifier(identifier: string, userData: Partial<IUser>): Promise<IUser | null> {
        if (userData.password) {
            throw new Error('Password cannot be updated from this service');
        }
        const filter = this.buildIdentifierFilter(identifier);
        return await User.findOneAndUpdate(
            filter,
            userData,
            { new: true }
        ).populate('events', 'username email').select('-password');
    }

    async disableUserByIdentifier(identifier: string): Promise<IUser | null> {
        const filter = this.buildIdentifierFilter(identifier);
        return await User.findOneAndUpdate(
            filter,
            { active: false },
            { new: true }
        ).populate('events', 'username email').select('-password');
    }

    async reactivateUserByIdentifier(identifier: string): Promise<IUser | null> {
        const filter = this.buildIdentifierFilter(identifier);
        return await User.findOneAndUpdate(
            filter,
            { active: true },
            { new: true }
        ).populate('events', 'username email').select('-password');
    }

    async deleteUserByIdentifier(identifier: string): Promise<IUser | null> {
        const filter = this.buildIdentifierFilter(identifier);
        return await User.findOneAndDelete(filter);
    }

    async addEventToUser(identifier: string, eventIdentifier: string): Promise<IUser | null> {
        const userFilter = this.buildIdentifierFilter(identifier);

        const event = await this.findEventByIdentifier(eventIdentifier);
        if (!event) {
            throw new Error('EVENT NOT FOUND');
        }

        const updatedUser = await User.findOneAndUpdate(
            userFilter,
            { $addToSet: { events: event._id } },
            { new: true }
        ).populate('events', 'username email').select('-password');

        if (updatedUser) {
            await EventModel.findByIdAndUpdate(
                event._id,
                { $addToSet: { participants: updatedUser._id } },
                { new: true }
            );
        }
        return updatedUser;
    }

    async loginUser(username: string, password: string): Promise<any | null> {
        try {
            const userWithPass = await User.findOne({
                $or: [
                    { username, active: true },
                    { email: username, active: true }
                ]
            }).populate('events', 'username email');

            if (!userWithPass) return null;

            if (userWithPass.authProvider === 'google') {
                throw new Error('This account uses Google authentication. Please sign in with Google.');
            }

            const valid = await (userWithPass as any).comparePassword(password);
            if (!valid) return null;

            const user = await User.findById(userWithPass.id)
                .populate('events', 'username email')
                .select('-password');
            return user;
        } catch (error) {
            throw error;
        }
    }

    async findOrCreateUserByGoogle(googleData: {
        googleId: string;
        email?: string;
        name?: string;
        picture?: string;
        locale?: string;
    }): Promise<IUser> {
        const { googleId, email, name, picture, locale } = googleData;

        let user = await User.findOne({
            $or: [
                { googleId },
                { email }
            ]
        });

        if (user) {
            user.googleId = googleId;
            user.googleProfile = {
                name: name || user.googleProfile?.name,
                picture: picture || user.googleProfile?.picture,
                locale: locale || user.googleProfile?.locale
            };
            user.authProvider = 'google';
            
            await user.save();
            return user;
        } else {
            const username = email ? email.split('@')[0] : `user_${Date.now()}`;
        
            let finalUsername = username;
            let counter = 1;
            while (await User.findOne({ username: finalUsername })) {
                finalUsername = `${username}${counter}`;
                counter++;
            }

            user = new User({
                username: finalUsername,
                email: email || '',
                password: 'google_auth_' + Math.random().toString(36), // Contraseña dummy
                birthday: new Date('2000-01-01'), // Fecha por defecto
                googleId,
                googleProfile: {
                    name,
                    picture,
                    locale
                },
                authProvider: 'google',
                active: true,
                role: 'user'
            });

            await user.save();
            return user;
        }
    }

    async connectGoogleAccount(userId: string, googleData: {
        googleId: string;
        email?: string;
        name?: string;
        picture?: string;
        locale?: string;
    }): Promise<IUser> {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('USER NOT FOUND');
        }

        const { googleId, email, name, picture, locale } = googleData;

        if (email && user.email !== email) {
            throw new Error('Google account email does not match user email');
        }

        const existingUserWithGoogleId = await User.findOne({ 
            googleId, 
            _id: { $ne: userId } 
        });
        if (existingUserWithGoogleId) {
            throw new Error('Google account is already connected to another user');
        }

        user.googleId = googleId;
        user.googleProfile = {
            name: name || user.googleProfile?.name,
            picture: picture || user.googleProfile?.picture,
            locale: locale || user.googleProfile?.locale
        };
        user.authProvider = 'google';

        await user.save();
        return user;
    }

    async disconnectGoogleAccount(userId: string): Promise<IUser> {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('USER NOT FOUND');
        }

        if (user.authProvider === 'google' && !user.password) {
            throw new Error('Please set a password before disconnecting Google account');
        }

        user.googleId = undefined;
        user.googleProfile = undefined;
        user.authProvider = 'local';

        await user.save();
        return user;
    }

    async makeUserAdminByIdentifier(identifier: string): Promise<IUser | null> {
        const filter = this.buildIdentifierFilter(identifier);
        return await User.findOneAndUpdate(
            filter,
            { role: 'admin' },
            { new: true }
        ).populate('events', 'username email').select('-password');
    }

    async removeUserAdminByIdentifier(identifier: string): Promise<IUser | null> {
        const filter = this.buildIdentifierFilter(identifier);
        return await User.findOneAndUpdate(
            filter,
            { role: 'user' },
            { new: true }
        ).populate('events', 'username email').select('-password');
    }

    async makeUserManagerByIdentifier(identifier: string): Promise<IUser | null> {
        const filter = this.buildIdentifierFilter(identifier);
        return await User.findOneAndUpdate(
            filter,
            { role: 'manager' },
            { new: true }
        ).populate('events', 'username email').select('-password');
    }

    async removeUserManagerByIdentifier(identifier: string): Promise<IUser | null> {
        const filter = this.buildIdentifierFilter(identifier);
        return await User.findOneAndUpdate(
            filter,
            { role: 'user' },
            { new: true }
        ).populate('events', 'username email').select('-password');
    }

    async removeEventFromUser(identifier: string, eventIdentifier: string): Promise<IUser | null> {
        const userFilter = this.buildIdentifierFilter(identifier);
        const event = await this.findEventByIdentifier(eventIdentifier);
        if (!event) {
            throw new Error('EVENT NOT FOUND');
        }

        const updatedUser = await User.findOneAndUpdate(
            userFilter,
            { $pull: { events: event._id } },
            { new: true }
        ).populate('events', 'username email').select('-password');

        if (updatedUser) {
            await EventModel.findByIdAndUpdate(
                event._id,
                { $pull: { participants: updatedUser._id } },
                { new: true }
            );
        }
        return updatedUser;
    }

    async hasAnyAdmin(): Promise<boolean> {
        const adminCount = await User.countDocuments({ role: 'admin', active: true });
        return adminCount > 0;
    }

    async getUserStats(): Promise<UserStats> {
        const total = await User.countDocuments();
        const active = await User.countDocuments({ active: true });
        const inactive = await User.countDocuments({ active: false });

        let newCount: number | null = null;
        let lastUpdated: string | null = null;

        if (User.schema.path('createdAt')) {
            const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            newCount = await User.countDocuments({ createdAt: { $gte: since } });

            const last = await User.findOne().sort({ createdAt: -1 }).select('createdAt').lean();
            lastUpdated = last?.createdAt ? new Date(last.createdAt).toISOString() : null;
        }
        return { total, active, inactive, newCount, lastUpdated };
    }

    async getAuthProviderStats(): Promise<{ local: number; google: number }> {
        const localCount = await User.countDocuments({ authProvider: 'local' });
        const googleCount = await User.countDocuments({ authProvider: 'google' });
        
        return { local: localCount, google: googleCount };
    }

    async updateOnboardingData(userId: string, data: { comunidad: string; intereses: string[] }): Promise<IUser | null> {
        return await User.findByIdAndUpdate(
            userId,
            {
                $set: {
                    comunidad: data.comunidad,
                    intereses: data.intereses,
                    onboardingCompleted: true 
                }
            },
            { new: true } 
        );
    }
}