import mongoose from 'mongoose';
import { User, DEFAULT_AVATAR, DEFAULT_COVER_PHOTO } from '../models/user';
import { Event, DEFAULT_EVENT_IMAGE } from '../models/event';
import { Conversation } from '../models/conversation';
import { Friendship } from '../models/friendship';
import { Tag } from '../models/tag';
import { UserInterest } from '../models/userInterest';
import { Business } from '../models/business';
import { UserTrust } from '../models/userTrust';
import { Message } from '../models/message'; // Añade este import arriba si no lo tienes

function randomFromArray<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randomCoordsInBarcelona() {
    const minLat = 41.36, maxLat = 41.41, minLng = 2.13, maxLng = 2.20;
    return [
        +(minLng + Math.random() * (maxLng - minLng)).toFixed(6),
        +(minLat + Math.random() * (maxLat - minLat)).toFixed(6)
    ];
}

function randomCoordsInMadrid() {
    const minLat = 40.40, maxLat = 40.48, minLng = -3.73, maxLng = -3.60;
    return [
        +(minLng + Math.random() * (maxLng - minLng)).toFixed(6),
        +(minLat + Math.random() * (maxLat - minLat)).toFixed(6)
    ];
}

function randomPhone() {
    return '+34 6' + Math.floor(10000000 + Math.random() * 89999999);
}

function randomDate(start: Date, end: Date) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
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
        }
        tags[tagData.name.toLowerCase()] = tag;
    }
    return tags;
}

async function createUserInterests(user: any, interestTags: any) {
    const tagKeys = Object.keys(interestTags);
    for (let i = 0; i < 5; i++) {
        const tagKey = randomFromArray(tagKeys);
        const tagId = interestTags[tagKey]._id;
        const existingInterest = await UserInterest.findOne({
            userId: user._id,
            tagId: tagId
        });
        if (!existingInterest) {
            const userInterest = new UserInterest({
                userId: user._id,
                tagId: tagId,
                score: Math.floor(Math.random() * 5) + 1,
                active: true
            });
            await userInterest.save();
        }
    }
}

async function createDemoEvents(users: any[], interestTags: any) {
    const eventNames = [
        'Techno Night at Razzmatazz', 'Sunset House Party at Opium', 'Electronic Festival at Poble Espanyol',
        'House Vibes', 'Underground Session', 'Clubbing Madness', 'Photography Meetup', 'Cocktail Night',
        'Networking Afterwork', 'Fashion Gala', 'Design Expo', 'Music Jam', 'Events Summit'
    ];
    const categories = ['Techno', 'House', 'Electronic', 'Social', 'Dance', 'Clubbing', 'Festivals', 'Photography', 'Cocktails', 'Bars', 'Networking', 'Marketing', 'Venues', 'Coding', 'Technology', 'Fashion', 'Design', 'Music', 'Events'];
    const events = [];
    for (let i = 0; i < 100; i++) {
        const name = eventNames[i % eventNames.length] + ' #' + (i + 1);
        const event = new Event({
            name,
            schedule: randomDate(new Date(), new Date(Date.now() + 1000 * 60 * 60 * 24 * 180)),
            location: {
                type: 'Point',
                coordinates: randomCoordsInBarcelona()
            },
            description: `Evento de ${randomFromArray(categories)} en Barcelona.`,
            category: randomFromArray(categories),
            capacity: Math.floor(Math.random() * 2000) + 100,
            price: Math.floor(Math.random() * 50) + 10,
            participants: users.slice(i % users.length, (i % users.length) + 10).map(u => u._id),
            likes: Math.floor(Math.random() * 100),
            likedBy: [],
            active: true,
            image: DEFAULT_EVENT_IMAGE
        });
        await event.save();
        events.push(event);
    }
    return events;
}

async function createBusinesses(users: any[]) {
    const businessNames = [
        'Razzmatazz', 'Opium', 'Pacha', 'Shoko', 'Bling Bling', 'Sutton', 'Macarena Club', 'Jamboree', 'Moog', 'Input', 'City Hall', 'La Terrrazza'
    ];
    const businesses = [];
    for (let i = 0; i < 100; i++) {
        const name = businessNames[i % businessNames.length] + ' Business #' + (i + 1);
        const business = new Business({
            name,
            address: `Calle Falsa ${i + 1}, Barcelona`,
            phone: randomPhone(),
            email: `contact${i + 1}@${name.replace(/\s/g, '').toLowerCase()}.com`,
            location: {
                type: 'Point',
                coordinates: randomCoordsInBarcelona()
            },
            events: [],
            managers: [randomFromArray(users)._id],
            active: true,
            avatar: ''
        });
        await business.save();
        businesses.push(business);
    }
    return businesses;
}

async function createFriendships(users: any[]) {
    for (let i = 0; i < users.length; i++) {
        for (let j = i + 1; j < users.length && j < i + 6; j++) {
            const requester = users[i];
            const recipient = users[j];
            const exists = await Friendship.findOne({
                $or: [
                    { requester: requester._id, recipient: recipient._id },
                    { requester: recipient._id, recipient: requester._id }
                ]
            });
            if (!exists) {
                const friendship = new Friendship({
                    requester: requester._id,
                    recipient: recipient._id,
                    status: 'accepted'
                });
                await friendship.save();
            }
        }
    }
}

export async function seedDemoData() {
    try {
        await mongoose.connect('mongodb://localhost:27017/NIGHTUP_BBDD');
        await Business.deleteMany({});
        await Event.deleteMany({});
        await Friendship.deleteMany({});
        await User.deleteMany({});
        await UserInterest.deleteMany({});
        await UserTrust.deleteMany({});
        console.log('Collections cleared');

        const interestTags = await createInterestTags();

        // Crear JoelMoreno y DavidSanchez
        const specialUsersData = [
            {
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
                city: 'Madrid',
                country: 'Spain',
                website: 'https://joelmoreno.com',
                socialMedia: {
                    instagram: '@joelmoreno',
                    twitter: '@joelmoreno'
                },
                location: {
                    type: 'Point',
                    coordinates: randomCoordsInMadrid()
                },
                isVisibleOnMap: true,
                lastLocationUpdate: new Date(),
                interests: [interestTags.techno._id, interestTags.electronic._id, interestTags.dj._id],
                friends: [],
                active: true,
                role: 'admin',
                isOnline: true,
                lastSeen: new Date(),
                emergencyContacts: [],
                authProvider: 'local'
            },
            {
                username: 'DavidSanchez',
                email: 'david@nightup.com',
                password: 'DavidSanchez123',
                birthday: new Date('1992-05-12'),
                phoneNumber: '+34 612 345 679',
                securityQuestion: 'security.question.pet_name',
                securityAnswer: 'Rocky',
                avatar: DEFAULT_AVATAR,
                coverPhoto: DEFAULT_COVER_PHOTO,
                bio: 'Nightlife explorer and event organizer.',
                firstName: 'David',
                lastName: 'Sanchez',
                gender: 'male',
                city: 'Madrid',
                country: 'Spain',
                website: 'https://davidsanchez.com',
                socialMedia: {
                    instagram: '@davidsanchez',
                    twitter: '@davidsanchez'
                },
                location: {
                    type: 'Point',
                    coordinates: randomCoordsInMadrid()
                },
                isVisibleOnMap: true,
                lastLocationUpdate: new Date(),
                interests: [interestTags.house._id, interestTags.electronic._id, interestTags.dj._id],
                friends: [],
                active: true,
                role: 'admin',
                isOnline: true,
                lastSeen: new Date(),
                emergencyContacts: [],
                authProvider: 'local'
            }
        ];

        const specialUsers = [];
        for (const userData of specialUsersData) {
            let user = new User(userData);
            await user.save();
            specialUsers.push(user);
        }

        // Crear 98 usuarios aleatorios
        const names = ['Alex', 'Sarah', 'Mike', 'Emma', 'Chris', 'Jessica', 'Kevin', 'Rachel', 'Laura', 'Daniel', 'Sofia', 'Luis', 'Marta', 'Carlos', 'Lucia', 'Pablo', 'Elena', 'Jorge', 'Ana', 'Victor'];
        const surnames = ['Johnson', 'Miller', 'Davis', 'Wilson', 'Taylor', 'Brown', 'Lee', 'Green', 'Martinez', 'Garcia', 'Lopez', 'Sanchez', 'Perez', 'Gomez', 'Ruiz', 'Diaz', 'Morales', 'Torres', 'Ramos', 'Castro'];
        const users = [...specialUsers];
        for (let i = 0; i < 98; i++) {
            const firstName = randomFromArray(names);
            const lastName = randomFromArray(surnames);
            const username = `${firstName}${lastName}${i}`;
            const email = `${username.toLowerCase()}@nightup.com`;
            const gender = randomFromArray(['male', 'female', 'other', 'prefer_not_to_say']);
            const city = 'Barcelona';
            const country = 'Spain';
            const website = `https://${username.toLowerCase()}.com`;
            const socialMedia = {
                instagram: `@${username.toLowerCase()}`,
                twitter: `@${username.toLowerCase()}`,
                facebook: `@${username.toLowerCase()}`,
                tiktok: `@${username.toLowerCase()}`
            };
            const location = {
                type: 'Point',
                coordinates: randomCoordsInMadrid()
            };
            const interests = Object.values(interestTags)
                .sort(() => 0.5 - Math.random())
                .slice(0, Math.floor(Math.random() * 5) + 1)
                .map((tag: any) => tag._id);
            const user = new User({
                username,
                email,
                password: 'Password123',
                birthday: randomDate(new Date(1980, 0, 1), new Date(2005, 0, 1)),
                phoneNumber: randomPhone(),
                securityQuestion: 'security.question.pet_name',
                securityAnswer: 'Fluffy',
                avatar: DEFAULT_AVATAR,
                coverPhoto: DEFAULT_COVER_PHOTO,
                bio: 'Generated user for demo data.',
                firstName,
                lastName,
                gender,
                city,
                country,
                website,
                socialMedia,
                location,
                isVisibleOnMap: true,
                lastLocationUpdate: new Date(),
                interests,
                friends: [],
                active: true,
                role: 'user',
                isOnline: Math.random() > 0.5,
                lastSeen: randomDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date()),
                emergencyContacts: [],
                authProvider: 'local'
            });
            await user.save();
            users.push(user);
        }

        // Crear UserInterests para todos los usuarios
        for (const user of users) {
            await createUserInterests(user, interestTags);
        }

        // Crear 100 eventos
        const events = await createDemoEvents(users, interestTags);

        // Crear 100 negocios
        await createBusinesses(users);

        // Crear amistades
        await createFriendships(users);

        // Después de crear todos los usuarios y amistades
        const joel = specialUsers.find(u => u.username === 'JoelMoreno');
        if (joel) {
            // Escoge 3-4 amigos de Joel (que no sean DavidSanchez)
            const possibleFriends = users.filter(u => u._id.toString() !== joel._id.toString() && u.username !== 'DavidSanchez');
            const joelFriends = possibleFriends.sort(() => 0.5 - Math.random()).slice(0, 4);

            // Asegura la amistad en la colección Friendship
            for (const friend of joelFriends) {
                const exists = await Friendship.findOne({
                    $or: [
                        { requester: joel._id, recipient: friend._id },
                        { requester: friend._id, recipient: joel._id }
                    ]
                });
                if (!exists) {
                    await new Friendship({
                        requester: joel._id,
                        recipient: friend._id,
                        status: 'accepted'
                    }).save();
                }
            }

            // Crea una conversación de grupo
            const participants = [joel, ...joelFriends].map(u => ({
                participant: u._id,
                participantModel: 'User'
            }));
            const conversation = await new Conversation({
                participants,
                isGroup: true,
                groupName: 'Grupo de Joel y amigos'
            }).save();

            // Añade algunos mensajes de ejemplo como documentos Message
            const messages = [
                { sender: joel._id, text: '¡Hola equipo! ¿Dónde salimos este finde?' },
                { sender: joelFriends[0]._id, text: '¡Yo voto por Malasaña!' },
                { sender: joelFriends[1]._id, text: '¿Y si probamos algo nuevo?' },
                { sender: joel._id, text: '¡Me apunto a lo que sea!' }
            ];
            for (const msg of messages) {
                await Message.create({
                    conversation: conversation._id,
                    sender: msg.sender,
                    senderModel: 'User',
                    text: msg.text,
                    readBy: [msg.sender],
                    createdAt: new Date()
                });
            }
            console.log('Conversación de grupo creada para JoelMoreno y amigos');
        }

        // === Añadir 20 userTrust a JoelMoreno ===
        const joelUser = specialUsers.find(u => u.username === 'JoelMoreno');
        if (joelUser) {
            // Escoge 20 usuarios únicos distintos de Joel
            const possibleRaters = users.filter(u => u._id.toString() !== joelUser._id.toString());
            const raters = possibleRaters.sort(() => 0.5 - Math.random()).slice(0, 20);

            for (let i = 0; i < raters.length; i++) {
                await new UserTrust({
                    rated: joelUser._id,
                    rater: raters[i]._id,
                    score: Math.floor(Math.random() * 5) + 1,
                    comment: `Trust demo #${i + 1}`,
                    context: 'demo'
                }).save();
            }
            console.log('20 userTrust añadidos a JoelMoreno');
        }

        console.log('🎉 Demo data seeded successfully!');
        console.log('👤 Main users: JoelMoreno, DavidSanchez');
        console.log('👥 Users created: ' + users.length);
        console.log('🏙️ All users located in Barcelona with realistic coordinates');
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    } catch (error) {
        console.error('Error seeding demo data:', error);
    }
}

seedDemoData().catch(console.error);