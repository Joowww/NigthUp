import User, { DEFAULT_AVATAR, DEFAULT_COVER_PHOTO, IUser } from '../models/user';
import EventModel, { IEvent } from '../models/event';
import mongoose from 'mongoose';

export interface UserStats {
    total: number;
    active: number;
    inactive: number;
    newCount: number | null;
    lastUpdated?: string | null;
}

export interface UserProfileResponse {
    _id: string;
    username: string;
    email: string;
    avatar?: string;
    coverPhoto?: string;
    bio?: string;
    firstName?: string;
    lastName?: string;
    gender?: string;
    city?: string;
    country?: string;
    website?: string;
    socialMedia?: {
        instagram?: string;
        twitter?: string;
        facebook?: string;
        tiktok?: string;
    };
    interests: any[];
    friends: any[];
    events: any[];
    isOnline: boolean;
    lastSeen: Date;
    createdAt: Date;
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
            const userWithDefaults = {
                avatar: DEFAULT_AVATAR,
                coverPhoto: DEFAULT_COVER_PHOTO,
                interests: [],
                friends: [],
                ...userData
            };

            const newUser = new User(userWithDefaults);
            return await newUser.save();
        } catch (error) {
            throw new Error((error as Error).message);
        }
    }

    async getAllUsers(skip: number = 0, limit: number = 10): Promise<{ users: IUser[], total: number }> {
        const users = await User.find({ active: true })
            .skip(skip)
            .limit(limit)
            .populate('events', 'username email')
            .populate('interests', 'name color type')
            .populate('friends', 'username avatar');

        const total = await User.countDocuments({ active: true });
        return { users, total };
    }

    async getAllUsersWithInactive(skip: number = 0, limit: number = 10): Promise<{ users: IUser[], total: number }> {
        const users = await User.find()
            .skip(skip)
            .limit(limit)
            .populate('events', 'username email')
            .populate('interests', 'name color type')
            .populate('friends', 'username avatar');

        const total = await User.countDocuments();
        return { users, total };
    }

    async getUserByIdentifier(identifier: string): Promise<IUser | null> {
        const filter = this.buildIdentifierFilter(identifier);
        return await User.findOne({ ...filter, active: true })
            .populate('events', 'name schedule location')
            .populate('interests', 'name color type')
            .populate('friends', 'username avatar coverPhoto bio isOnline lastSeen')
            .select('-password -securityAnswer');
    }

    async getUserProfile(identifier: string): Promise<UserProfileResponse | null> {
        const filter = this.buildIdentifierFilter(identifier);
        const user = await User.findOne({ ...filter, active: true })
            .populate('events', 'name schedule location image')
            .populate('interests', 'name color type description')
            .populate('friends', 'username avatar coverPhoto bio isOnline lastSeen')
            .select('-password -securityAnswer -securityQuestion -googleId -googleProfile -authProvider -emergencyContacts -location -isVisibleOnMap -lastLocationUpdate');

        if (!user) return null;

        return {
            _id: user._id.toString(),
            username: user.username,
            email: user.email,
            avatar: user.avatar,
            coverPhoto: user.coverPhoto,
            bio: user.bio,
            firstName: user.firstName,
            lastName: user.lastName,
            gender: user.gender,
            city: user.city,
            country: user.country,
            website: user.website,
            socialMedia: user.socialMedia,
            interests: user.interests,
            friends: user.friends,
            events: user.events,
            isOnline: user.isOnline,
            lastSeen: user.lastSeen,
            createdAt: user.createdAt!
        };
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
        )
            .populate('events', 'username email')
            .populate('interests', 'name color type')
            .populate('friends', 'username avatar')
            .select('-password');
    }

    async updateUserProfile(userId: string, profileData: {
        firstName?: string;
        lastName?: string;
        bio?: string;
        gender?: string;
        city?: string;
        country?: string;
        website?: string;
        socialMedia?: {
            instagram?: string;
            twitter?: string;
            facebook?: string;
            tiktok?: string;
        };
        avatar?: string;
        coverPhoto?: string;
    }): Promise<IUser | null> {
        return await User.findByIdAndUpdate(
            userId,
            profileData,
            { new: true }
        )
            .populate('events', 'name schedule location')
            .populate('interests', 'name color type')
            .populate('friends', 'username avatar coverPhoto bio isOnline lastSeen')
            .select('-password -securityAnswer');
    }

    async updateAvatar(userId: string, avatarUrl: string): Promise<IUser | null> {
        return await User.findByIdAndUpdate(
            userId,
            { avatar: avatarUrl },
            { new: true }
        )
            .select('-password -securityAnswer');
    }

    async updateCoverPhoto(userId: string, coverPhotoUrl: string): Promise<IUser | null> {
        return await User.findByIdAndUpdate(
            userId,
            { coverPhoto: coverPhotoUrl },
            { new: true }
        )
            .select('-password -securityAnswer');
    }

    async addUserInterests(userId: string, interestIds: string[]): Promise<IUser | null> {
        return await User.findByIdAndUpdate(
            userId,
            { $addToSet: { interests: { $each: interestIds } } },
            { new: true }
        )
            .populate('interests', 'name color type')
            .select('-password -securityAnswer');
    }

    async removeUserInterests(userId: string, interestIds: string[]): Promise<IUser | null> {
        return await User.findByIdAndUpdate(
            userId,
            { $pull: { interests: { $in: interestIds } } },
            { new: true }
        )
            .populate('interests', 'name color type')
            .select('-password -securityAnswer');
    }

    async disableUserByIdentifier(identifier: string): Promise<IUser | null> {
        const filter = this.buildIdentifierFilter(identifier);
        return await User.findOneAndUpdate(
            filter,
            { active: false },
            { new: true }
        )
            .populate('events', 'username email')
            .populate('interests', 'name color type')
            .populate('friends', 'username avatar')
            .select('-password');
    }

    async reactivateUserByIdentifier(identifier: string): Promise<IUser | null> {
        const filter = this.buildIdentifierFilter(identifier);
        return await User.findOneAndUpdate(
            filter,
            { active: true },
            { new: true }
        )
            .populate('events', 'username email')
            .populate('interests', 'name color type')
            .populate('friends', 'username avatar')
            .select('-password');
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
        )
            .populate('events', 'username email')
            .populate('interests', 'name color type')
            .populate('friends', 'username avatar')
            .select('-password');

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
            })
                .populate('events', 'username email')
                .populate('interests', 'name color type')
                .populate('friends', 'username avatar');

            if (!userWithPass) return null;

            if (userWithPass.authProvider === 'google') {
                throw new Error('This account uses Google authentication. Please sign in with Google.');
            }

            const valid = await (userWithPass as any).comparePassword(password);

            if (!valid) return null;

            const user = await User.findById(userWithPass.id)
                .populate('events', 'username email')
                .populate('interests', 'name color type')
                .populate('friends', 'username avatar coverPhoto bio isOnline lastSeen')
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
            const username = email ? email.split('@')[0] : 'user_' + Date.now();
            let finalUsername = username;
            let counter = 1;
            while (await User.findOne({ username: finalUsername })) {
                finalUsername = `${username}${counter}`;
                counter++;
            }

            user = new User({
                username: finalUsername,
                email: email || '',
                password: 'google_auth_' + Math.random().toString(36),
                birthday: new Date('2000-01-01'),
                googleId,
                googleProfile: {
                    name,
                    picture,
                    locale
                },
                authProvider: 'google',
                active: true,
                role: 'user',
                avatar: picture || '',
                interests: [],
                friends: []
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
        )
            .populate('events', 'username email')
            .populate('interests', 'name color type')
            .populate('friends', 'username avatar')
            .select('-password');
    }

    async removeUserAdminByIdentifier(identifier: string): Promise<IUser | null> {
        const filter = this.buildIdentifierFilter(identifier);
        return await User.findOneAndUpdate(
            filter,
            { role: 'user' },
            { new: true }
        )
            .populate('events', 'username email')
            .populate('interests', 'name color type')
            .populate('friends', 'username avatar')
            .select('-password');
    }

    async makeUserManagerByIdentifier(identifier: string): Promise<IUser | null> {
        const filter = this.buildIdentifierFilter(identifier);
        return await User.findOneAndUpdate(
            filter,
            { role: 'manager' },
            { new: true }
        )
            .populate('events', 'username email')
            .populate('interests', 'name color type')
            .populate('friends', 'username avatar')
            .select('-password');
    }

    async removeUserManagerByIdentifier(identifier: string): Promise<IUser | null> {
        const filter = this.buildIdentifierFilter(identifier);
        return await User.findOneAndUpdate(
            filter,
            { role: 'user' },
            { new: true }
        )
            .populate('events', 'username email')
            .populate('interests', 'name color type')
            .populate('friends', 'username avatar')
            .select('-password');
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
        )
            .populate('events', 'username email')
            .populate('interests', 'name color type')
            .populate('friends', 'username avatar')
            .select('-password');

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

    async getSuggestedUsers(userId: string, limit: number = 10): Promise<IUser[]> {
        const user = await User.findById(userId).select('interests friends');
        if (!user) return [];

        return await User.find({
            _id: { $ne: userId },
            $or: [
                { interests: { $in: user.interests } },
                { friends: { $in: user.friends } }
            ]
        })
            .select('username avatar coverPhoto bio interests isOnline lastSeen')
            .populate('interests', 'name color')
            .limit(limit)
            .sort({ isOnline: -1, lastSeen: -1 });
    }

    async updateOnboardingData(userId: string, data: { comunidad: string; intereses: string[] }): Promise<IUser | null> {
        const { comunidad, intereses } = data;
        const MAX_EVENTS = 6;
        let fypIds: mongoose.Types.ObjectId[] = [];

        const cityRegex = new RegExp(`^${comunidad}$`, 'i');

        const exactMatches = await EventModel.find({
            active: true,
            city: cityRegex,
            category: { $in: intereses }
        }).limit(MAX_EVENTS);

        fypIds = exactMatches.map(e => e._id);

        if (fypIds.length < MAX_EVENTS) {
            const cityMatches = await EventModel.find({
                active: true,
                city: cityRegex,
                _id: { $nin: fypIds }
            }).limit(MAX_EVENTS - fypIds.length);

            fypIds = [...fypIds, ...cityMatches.map(e => e._id)];
        }

        if (fypIds.length < MAX_EVENTS) {
            const interestMatches = await EventModel.find({
                active: true,
                category: { $in: intereses },
                _id: { $nin: fypIds }
            }).limit(MAX_EVENTS - fypIds.length);

            fypIds = [...fypIds, ...interestMatches.map(e => e._id)];
        }

        if (fypIds.length < MAX_EVENTS) {
            const remainingCount = MAX_EVENTS - fypIds.length;
            const randomEvents = await EventModel.aggregate([
                { $match: { active: true, _id: { $nin: fypIds } } },
                { $sample: { size: remainingCount } }
            ]);

            const randomIds = randomEvents.map(e => e._id as mongoose.Types.ObjectId);
            fypIds = [...fypIds, ...randomIds];
        }

        return await User.findByIdAndUpdate(
            userId,
            {
                $set: {
                    comunidad: data.comunidad,
                    intereses: data.intereses,
                    onboardingCompleted: true,
                    fyp: fypIds.slice(0, 6)
                }
            },
            { new: true }
        );
    }

    async getFyp(identifier: string): Promise<IEvent[]> {
        const filter = this.buildIdentifierFilter(identifier);
        const user = await User.findOne({ ...filter, active: true }).populate({
            path: 'fyp',
            populate: { path: 'participants likedBy', select: 'username email' }
        });

        if (!user || !user.fyp) return [];

        return (user.fyp as any[])
            .filter(event => event !== null && typeof event === 'object')
            .slice(0, 6) as IEvent[];
    }

    async addEventToRelevantFyps(event: IEvent): Promise<void> {
        try {
            const filter: any = {
                active: true,
                intereses: event.category
            };

            if (event.city) {
                filter.comunidad = { $regex: new RegExp(`^${event.city}$`, 'i') };
            }

            await User.updateMany(
                filter,
                {
                    $push: {
                        fyp: {
                            $each: [event._id],
                            $position: 0,
                            $slice: 6
                        }
                    }
                }
            );
        } catch (error) {
            throw error;
        }
    }
}