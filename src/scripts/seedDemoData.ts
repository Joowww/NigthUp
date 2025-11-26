import mongoose from 'mongoose';
import { User, DEFAULT_AVATAR, DEFAULT_COVER_PHOTO } from '../models/user';
import { Event, DEFAULT_EVENT_IMAGE } from '../models/event';
import { Conversation } from '../models/conversation';
import { Friendship } from '../models/friendship';
import { Tag } from '../models/tag';
import { UserInterest } from '../models/userInterest';

export async function seedDemoData() {
    try {
        await mongoose.connect('mongodb://localhost:27017/NIGHTUP_BBDD');
        console.log('Connected to MongoDB');

        // Primero crear algunos tags de intereses
        const interestTags = await createInterestTags();

        // Crear usuario principal JoelMoreno
        let joel = await User.findOne({ username: 'JoelMoreno' });
        
        if (!joel) {
            console.log('JoelMoreno not found, creating demo user...');
            joel = new User({
                username: 'JoelMoreno',
                email: 'joel@nightup.com',
                password: 'JoelMoreno123',
                birthday: new Date('1990-08-06'),
                phoneNumber: '+34 612 345 678',
                securityQuestion: 'security.question.pet_name',
                securityAnswer: 'Fluffy',
                avatar: DEFAULT_AVATAR,
                coverPhoto: DEFAULT_COVER_PHOTO,
                bio: 'Music lover and nightlife enthusiast. Always looking for the next great party! 🎵🎉',
                firstName: 'Joel',
                lastName: 'Moreno',
                gender: 'male',
                city: 'Barcelona',
                country: 'Spain',
                website: 'https://joelmoreno.com',
                socialMedia: {
                    instagram: '@joelmoreno',
                    twitter: '@joelmoreno'
                },
                location: {
                    type: 'Point',
                    coordinates: [2.1734, 41.3851] // Barcelona coordinates
                },
                isVisibleOnMap: true,
                lastLocationUpdate: new Date(),
                interests: [interestTags.techno._id, interestTags.electronic._id, interestTags.dj._id],
                friends: [],
                active: true,
                role: 'user',
                isOnline: true,
                lastSeen: new Date()
            });
            await joel.save();
            console.log('JoelMoreno user created');
        }

        // Crear amigos en inglés con locations realistas en Barcelona
        const friendData = [
            {
                username: 'AlexJohnson',
                email: 'alex.johnson@example.com',
                firstName: 'Alex',
                lastName: 'Johnson',
                bio: 'DJ and producer. Love electronic music and meeting new people at events.',
                gender: 'male' as const,
                city: 'Barcelona',
                coordinates: [2.1589, 41.3887], // Plaza Catalunya
                interests: ['techno', 'electronic', 'dj', 'production']
            },
            {
                username: 'SarahMiller',
                email: 'sarah.miller@example.com',
                firstName: 'Sarah',
                lastName: 'Miller',
                bio: 'Event organizer and social butterfly. Always up for a good time! 💃',
                gender: 'female' as const,
                city: 'Barcelona',
                coordinates: [2.1775, 41.3828], // Gothic Quarter
                interests: ['house', 'social', 'dance', 'festivals']
            },
            {
                username: 'MikeDavis',
                email: 'mike.davis@example.com',
                firstName: 'Mike',
                lastName: 'Davis',
                bio: 'Techno enthusiast and club goer. Love the Barcelona nightlife scene.',
                gender: 'male' as const,
                city: 'Barcelona',
                coordinates: [2.1900, 41.3830], // Eixample
                interests: ['techno', 'underground', 'clubbing', 'music']
            },
            {
                username: 'EmmaWilson',
                email: 'emma.wilson@example.com',
                firstName: 'Emma',
                lastName: 'Wilson',
                bio: 'Photographer and music lover. Capturing the best moments of nightlife.',
                gender: 'female' as const,
                city: 'Barcelona',
                coordinates: [2.1600, 41.3750], // Montjuic
                interests: ['photography', 'music', 'social', 'events']
            },
            {
                username: 'ChrisTaylor',
                email: 'chris.taylor@example.com',
                firstName: 'Chris',
                lastName: 'Taylor',
                bio: 'Bar manager and cocktail expert. Knows all the best spots in town.',
                gender: 'male' as const,
                city: 'Barcelona',
                coordinates: [2.1680, 41.3790], // El Raval
                interests: ['cocktails', 'social', 'bars', 'networking']
            },
            {
                username: 'JessicaBrown',
                email: 'jessica.brown@example.com',
                firstName: 'Jessica',
                lastName: 'Brown',
                bio: 'Marketing professional who loves discovering new music venues.',
                gender: 'female' as const,
                city: 'Barcelona',
                coordinates: [2.1500, 41.3700], // Sants
                interests: ['marketing', 'social', 'venues', 'networking']
            },
            {
                username: 'KevinLee',
                email: 'kevin.lee@example.com',
                firstName: 'Kevin',
                lastName: 'Lee',
                bio: 'Software developer by day, music producer by night. Always coding with beats.',
                gender: 'male' as const,
                city: 'Barcelona',
                coordinates: [2.1400, 41.3900], // Gràcia
                interests: ['production', 'electronic', 'coding', 'technology']
            },
            {
                username: 'RachelGreen',
                email: 'rachel.green@example.com',
                firstName: 'Rachel',
                lastName: 'Green',
                bio: 'Fashion designer and party lover. Dressing the nightlife scene.',
                gender: 'female' as const,
                city: 'Barcelona',
                coordinates: [2.1550, 41.3950], // Poblenou
                interests: ['fashion', 'social', 'design', 'events']
            }
        ];

        const friends = [];
        for (const friend of friendData) {
            let user = await User.findOne({ username: friend.username });
            
            if (!user) {
                user = new User({
                    username: friend.username,
                    email: friend.email,
                    password: 'Password123',
                    birthday: new Date('1990-01-01'),
                    phoneNumber: '+34 600 000 000',
                    securityQuestion: 'security.question.pet_name',
                    securityAnswer: 'Fluffy',
                    avatar: DEFAULT_AVATAR,
                    coverPhoto: DEFAULT_COVER_PHOTO,
                    bio: friend.bio,
                    firstName: friend.firstName,
                    lastName: friend.lastName,
                    gender: friend.gender,
                    city: friend.city,
                    country: 'Spain',
                    location: {
                        type: 'Point',
                        coordinates: friend.coordinates
                    },
                    isVisibleOnMap: true,
                    lastLocationUpdate: new Date(),
                    interests: friend.interests.map(interest => interestTags[interest]._id),
                    friends: [],
                    active: true,
                    role: 'user',
                    isOnline: Math.random() > 0.5, // Random online status
                    lastSeen: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Random last seen
                });
                await user.save();
                console.log(`User ${friend.username} created`);
            }
            friends.push(user);
        }

        // Crear amistades entre Joel y sus amigos
        for (const friend of friends) {
            const existingFriendship = await Friendship.findOne({
                $or: [
                    { requester: joel!._id, recipient: friend._id },
                    { requester: friend._id, recipient: joel!._id }
                ]
            });

            if (!existingFriendship) {
                const friendship = new Friendship({
                    requester: joel!._id,
                    recipient: friend._id,
                    status: 'accepted'
                });
                await friendship.save();
                console.log(`Friendship created between JoelMoreno and ${friend.username}`);
            }

            // Actualizar arrays de friends en ambos usuarios
            await User.findByIdAndUpdate(joel!._id, {
                $addToSet: { friends: friend._id }
            });

            await User.findByIdAndUpdate(friend._id, {
                $addToSet: { friends: joel!._id }
            });
        }

        // Crear algunos eventos de ejemplo en Barcelona
        await createDemoEvents(joel!._id);

        // Crear grupo de amigos
        const existingGroup = await Conversation.findOne({
            groupName: 'Barcelona Night Crew',
            isGroup: true
        });

        if (!existingGroup) {
            const allParticipantIds = [joel!._id, ...friends.map(f => f._id)];
            
            const group = new Conversation({
                participants: allParticipantIds.map(id => ({
                    participant: id,
                    participantModel: 'User',
                    role: id.equals(joel!._id) ? 'creator' : 'member',
                    joinedAt: new Date()
                })),
                isGroup: true,
                groupName: 'Barcelona Night Crew',
                groupDescription: 'The best group for nightlife enthusiasts in Barcelona! 🎉🌙',
                groupImage: 'https://via.placeholder.com/500x200/7c3aed/FFFFFF?text=BARCELONA+NIGHT+CREW',
                groupAdmins: [joel!._id, friends[0]._id, friends[1]._id] // Joel, Alex, Sarah como admins
            });

            await group.save();
            console.log('Group "Barcelona Night Crew" created successfully:', group._id);
        } else {
            console.log('The group "Barcelona Night Crew" already exists');
        }

        // Crear UserInterests para Joel
        await createUserInterests(joel!, interestTags);

        console.log('🎉 Demo data seeded successfully!');
        console.log('👤 Main user: JoelMoreno');
        console.log('👥 Friends created: ' + friends.length);
        console.log('🏙️ All users located in Barcelona with realistic coordinates');
        
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    } catch (error) {
        console.error('Error seeding demo data:', error);
    }
}

async function createInterestTags() {
    const tagsData = [
        { name: 'Techno', type: 'MusicType', color: '#3b82f6', description: 'Techno music' },
        { name: 'House', type: 'MusicType', color: '#ef4444', description: 'House music' },
        { name: 'Electronic', type: 'MusicType', color: '#8b5cf6', description: 'Electronic music' },
        { name: 'DJ', type: 'Musician', color: '#06b6d4', description: 'DJ performances' },
        { name: 'Production', type: 'Musician', color: '#10b981', description: 'Music production' },
        { name: 'Social', type: 'EventType', color: '#f59e0b', description: 'Social events' },
        { name: 'Dance', type: 'EventType', color: '#ec4899', description: 'Dance events' },
        { name: 'Clubbing', type: 'EventType', color: '#6366f1', description: 'Club events' },
        { name: 'Festivals', type: 'EventType', color: '#84cc16', description: 'Music festivals' },
        { name: 'Underground', type: 'EventType', color: '#78716c', description: 'Underground events' },
        { name: 'Photography', type: 'ChildhoodIdol', color: '#f97316', description: 'Photography interest' },
        { name: 'Cocktails', type: 'ChildhoodIdol', color: '#d946ef', description: 'Cocktail making' },
        { name: 'Bars', type: 'EventType', color: '#14b8a6', description: 'Bar events' },
        { name: 'Networking', type: 'EventType', color: '#64748b', description: 'Networking events' },
        { name: 'Marketing', type: 'ChildhoodIdol', color: '#0ea5e9', description: 'Marketing interest' },
        { name: 'Venues', type: 'EventType', color: '#a855f7', description: 'Venue exploration' },
        { name: 'Coding', type: 'ChildhoodIdol', color: '#06d6a0', description: 'Coding interest' },
        { name: 'Technology', type: 'ChildhoodIdol', color: '#118ab2', description: 'Technology interest' },
        { name: 'Fashion', type: 'ChildhoodIdol', color: '#ffd166', description: 'Fashion interest' },
        { name: 'Design', type: 'ChildhoodIdol', color: '#ef476f', description: 'Design interest' },
        { name: 'Music', type: 'MusicType', color: '#118ab2', description: 'General music interest' },
        { name: 'Events', type: 'EventType', color: '#073b4c', description: 'General events interest' }
    ];

    const tags: any = {};
    for (const tagData of tagsData) {
        let tag = await Tag.findOne({ name: tagData.name });
        if (!tag) {
            tag = new Tag(tagData);
            await tag.save();
            console.log(`Tag created: ${tagData.name}`);
        }
        tags[tagData.name.toLowerCase()] = tag;
    }
    return tags;
}

async function createDemoEvents(joelId: mongoose.Types.ObjectId) {
    const eventsData = [
        {
            name: 'Techno Night at Razzmatazz',
            schedule: new Date('2024-12-15T23:00:00.000Z'),
            coordinates: [2.1975, 41.4050], // Razzmatazz location
            description: 'The biggest techno night in Barcelona with international DJs',
            category: 'Techno',
            capacity: 2000,
            price: 30
        },
        {
            name: 'Sunset House Party at Opium',
            schedule: new Date('2024-12-20T20:00:00.000Z'),
            coordinates: [2.1950, 41.4020], // Opium location
            description: 'Beautiful sunset house music with beach views',
            category: 'House',
            capacity: 800,
            price: 25
        },
        {
            name: 'Electronic Festival at Poble Espanyol',
            schedule: new Date('2024-12-31T22:00:00.000Z'),
            coordinates: [2.1475, 41.3675], // Poble Espanyol
            description: 'New Years Eve electronic music festival',
            category: 'Electronic',
            capacity: 5000,
            price: 75
        }
    ];

    for (const eventData of eventsData) {
        let event = await Event.findOne({ name: eventData.name });
        if (!event) {
            event = new Event({
                ...eventData,
                location: {
                    type: 'Point',
                    coordinates: eventData.coordinates
                },
                image: DEFAULT_EVENT_IMAGE,
                participants: [joelId] // Joel participa en todos los eventos
            });
            await event.save();
            console.log(`Event created: ${eventData.name}`);
        }
    }
}

async function createUserInterests(joel: any, interestTags: any) {
    // Crear UserInterests para Joel con diferentes scores
    const userInterests = [
        { tagId: interestTags.techno._id, score: 5 },
        { tagId: interestTags.electronic._id, score: 4 },
        { tagId: interestTags.dj._id, score: 5 },
        { tagId: interestTags.production._id, score: 3 },
        { tagId: interestTags.music._id, score: 5 },
        { tagId: interestTags.events._id, score: 4 }
    ];

    for (const interest of userInterests) {
        const existingInterest = await UserInterest.findOne({
            userId: joel._id,
            tagId: interest.tagId
        });

        if (!existingInterest) {
            const userInterest = new UserInterest({
                userId: joel._id,
                tagId: interest.tagId,
                score: interest.score,
                active: true
            });
            await userInterest.save();
            console.log(`UserInterest created for Joel: ${interest.tagId}`);
        }
    }
}

// Ejecutar el script
seedDemoData().catch(console.error);