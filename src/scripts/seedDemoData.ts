import mongoose from 'mongoose';
import { User, DEFAULT_AVATAR, DEFAULT_COVER_PHOTO } from '../models/user';
import { Event, DEFAULT_EVENT_IMAGE } from '../models/event';
import { Conversation } from '../models/conversation';
import { Friendship } from '../models/friendship';
import { Tag } from '../models/tag';
import { UserInterest } from '../models/userInterest';
import { Business } from '../models/business';
import { UserTrust } from '../models/userTrust';
import Message from '../models/message';
import { Post } from '../models/post';


declare global {
    // eslint-disable-next-line no-var
    var __spainGrid: [number, number][] | undefined;
}


const SPAIN_REGIONS = [
    { name: "Andalucía", coords: [-4.7794, 37.8882] },        // Sevilla
    { name: "Aragón", coords: [-0.8877, 41.6488] },           // Zaragoza
    { name: "Asturias", coords: [-5.8448, 43.3619] },         // Oviedo
    { name: "Islas Baleares", coords: [2.6502, 39.5696] },    // Palma
    { name: "Canarias", coords: [-15.4134, 28.0997] },        // Las Palmas
    { name: "Cantabria", coords: [-3.8044, 43.4623] },        // Santander
    { name: "Castilla y León", coords: [-4.7286, 41.6529] },  // Valladolid
    { name: "Castilla-La Mancha", coords: [-3.0026, 39.8628] },// Toledo
    { name: "Cataluña", coords: [2.1686, 41.3874] },          // Barcelona
    { name: "Comunidad Valenciana", coords: [-0.3763, 39.4699] },// Valencia
    { name: "Extremadura", coords: [-6.3703, 39.4752] },      // Mérida
    { name: "Galicia", coords: [-8.5448, 42.8782] },          // Santiago
    { name: "Madrid", coords: [-3.7038, 40.4168] },           // Madrid
    { name: "Murcia", coords: [-1.1307, 37.9922] },           // Murcia
    { name: "Navarra", coords: [-1.6461, 42.8185] },          // Pamplona
    { name: "País Vasco", coords: [-2.935, 43.263] },         // Bilbao
    { name: "La Rioja", coords: [-2.4456, 42.4650] }          // Logroño
];


function generateGridPoints(baseCoords: [number, number], count: number): [number, number][] {
    const points: [number, number][] = [];
    const perRegion = Math.ceil(count / SPAIN_REGIONS.length);
    const step = 0.0045;
    let idx = 0;
    for (const region of SPAIN_REGIONS) {
        let n = 0;
        let x = 0, y = 0;
        while (n < perRegion && points.length < count) {
            const angle = 2 * Math.PI * (idx % 8) / 8;
            const radius = step * Math.floor(idx / 8 + 1);
            const lng = +(region.coords[0] + Math.cos(angle) * radius).toFixed(6);
            const lat = +(region.coords[1] + Math.sin(angle) * radius).toFixed(6);
            points.push([lng, lat]);
            n++; idx++;
        }
    }
    return points.slice(0, count);
}

function randomFromArray<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
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

function randomCoordsAcrossSpain(idx: number, total: number): [number, number] {
    if (!globalThis.__spainGrid) {
        globalThis.__spainGrid = generateGridPoints([-3.7038, 40.4168], total);
    }
    return globalThis.__spainGrid[idx];
}


function usersNearCoords(users: any[], coords: [number, number], maxDistanceKm: number, excludeIds: string[] = []) {
    // Haversine formula
    function distance([lng1, lat1]: [number, number], [lng2, lat2]: [number, number]) {
        const R = 6371; // km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }
    return users.filter(u =>
        !excludeIds.includes(u._id.toString()) &&
        distance(u.location.coordinates, coords) <= maxDistanceKm
    );
}


async function createUserTrustSafe(ratedId: any, raterId: any, score: number, comment: string, context: string = 'demo') {
    const existing = await UserTrust.findOne({
        rated: ratedId,
        rater: raterId,
        context: context
    });

    if (!existing) {
        await UserTrust.create({
            rated: ratedId,
            rater: raterId,
            score: score,
            comment: comment,
            context: context
        });
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
        await Message.deleteMany({});
        await Conversation.deleteMany({});
        console.log('Collections cleared');

        const weaviateClient = (await import('../config/weaviate')).default;
        try {
            await weaviateClient.schema.classDeleter().withClassName('Event').do();
            console.log('Weaviate "Event" class deleted');
        } catch (e) {
        }


        const classObj = {
            class: 'Event',
            vectorizer: 'text2vec-transformers',
            moduleConfig: {
                'text2vec-transformers': {},
            },
            properties: [
                {
                    name: 'name',
                    dataType: ['text'],
                },
                {
                    name: 'description',
                    dataType: ['text'],
                },
                {
                    name: 'category',
                    dataType: ['text'],
                },
                {
                    name: 'eventId',
                    dataType: ['string'],
                }
            ],
        };

        try {
            await weaviateClient.schema.classCreator().withClass(classObj).do();
            console.log('Weaviate "Event" class created');
        } catch (e) {
            console.log('Weaviate class already exists or error:', e);
        }

        const interestTags = await createInterestTags();


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
                    coordinates: [-3.7038, 40.4168]
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
                authProvider: 'local',
                onboardingCompleted: true
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
                    coordinates: randomCoordsAcrossSpain(1, 1000)
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
                authProvider: 'local',
                onboardingCompleted: true
            }
        ];

        const specialUsers = [];
        for (const userData of specialUsersData) {
            let user = new User(userData);
            await user.save();
            specialUsers.push(user);
        }


        const names = ['Alex', 'Sarah', 'Mike', 'Emma', 'Chris', 'Jessica', 'Kevin', 'Rachel', 'Laura', 'Daniel', 'Sofia', 'Luis', 'Marta', 'Carlos', 'Lucia', 'Pablo', 'Elena', 'Jorge', 'Ana', 'Victor'];
        const surnames = ['Johnson', 'Miller', 'Davis', 'Wilson', 'Taylor', 'Brown', 'Lee', 'Green', 'Martinez', 'Garcia', 'Lopez', 'Sanchez', 'Perez', 'Gomez', 'Ruiz', 'Diaz', 'Morales', 'Torres', 'Ramos', 'Castro'];
        const users = [...specialUsers];
        const userCoords = generateGridPoints([-3.7038, 40.4168], 1000);
        for (let i = 0; i < 1000; i++) {
            const firstName = randomFromArray(names);
            const lastName = randomFromArray(surnames);
            const username = `${firstName}${lastName}${i}`;
            const email = `${username.toLowerCase()}@nightup.com`;
            const gender = randomFromArray(['male', 'female', 'other', 'prefer_not_to_say']);
            const city = 'España';
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
                coordinates: userCoords[i]
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
                authProvider: 'local',
                onboardingCompleted: true
            });
            await user.save();
            users.push(user);
        }


        for (const user of users) {
            await createUserInterests(user, interestTags);
        }


        const eventCoords = generateGridPoints([-3.7038, 40.4168], 1000);
        const eventNames = [
            'Techno Night', 'Sunset House Party', 'Electronic Festival',
            'House Vibes', 'Underground Session', 'Clubbing Madness', 'Photography Meetup', 'Cocktail Night',
            'Networking Afterwork', 'Fashion Gala', 'Design Expo', 'Music Jam', 'Events Summit'
        ];
        const categories = Object.keys(interestTags);
        const events = [];
        for (let i = 0; i < 1000; i++) {
            const name = eventNames[i % eventNames.length] + ' #' + (i + 1);
            const participants = users.slice(i % users.length, (i % users.length) + 10);
            const numRatings = Math.random() < 0.5 ? 1 : 2;
            const ratingUsers: typeof users = [];
            while (ratingUsers.length < numRatings) {
                const candidate = randomFromArray(users);
                if (!participants.some(u => u._id.toString() === candidate._id.toString()) && !ratingUsers.some(u => u._id.toString() === candidate._id.toString())) {
                    ratingUsers.push(candidate);
                }
            }
            const ratings = ratingUsers.map((u, idx) => ({
                user: u._id,
                score: Math.floor(Math.random() * 5) + 1,
                comment: `Valoración extra demo #${idx + 1}`
            }));
            const event = new Event({
                name,
                schedule: randomDate(new Date(), new Date(Date.now() + 1000 * 60 * 60 * 24 * 180)),
                location: {
                    type: 'Point',
                    coordinates: eventCoords[i]
                },
                description: `Evento de ${randomFromArray(categories)} en España.`,
                category: randomFromArray(categories),
                capacity: Math.floor(Math.random() * 2000) + 100,
                price: Math.floor(Math.random() * 50) + 10,
                participants: participants.map(u => u._id),
                likes: Math.floor(Math.random() * 100),
                likedBy: [],
                active: true,
                image: DEFAULT_EVENT_IMAGE,
                ratings
            });
            await event.save();


            try {
                await weaviateClient.data.creator()
                    .withClassName('Event')
                    .withProperties({
                        name: event.name,
                        description: event.description,
                        category: event.category,
                        eventId: event._id.toString()
                    })
                    .do();
            } catch (error) {
                console.error(`Error indexing event ${event.name} in Weaviate:`, error);
            }

            events.push(event);
        }


        for (const user of users) {

            const userEvents: any[] = [];
            const usedEventIndexes = new Set<number>();
            while (userEvents.length < 5 && usedEventIndexes.size < events.length) {
                const idx = Math.floor(Math.random() * events.length);
                if (!usedEventIndexes.has(idx)) {
                    usedEventIndexes.add(idx);
                    userEvents.push(events[idx]);
                }
            }
            for (const event of userEvents) {
                if (!event.participants.map((id: any) => id.toString()).includes(user._id.toString())) {
                    event.participants.push(user._id);
                    await event.save();
                }
            }


            const otherUsers = users.filter(u => u._id.toString() !== user._id.toString());


            const selectedRaters: any[] = [];
            while (selectedRaters.length < 3 && selectedRaters.length < otherUsers.length) {
                const rater = randomFromArray(otherUsers);
                if (!selectedRaters.some(r => r._id.toString() === rater._id.toString())) {
                    selectedRaters.push(rater);
                }
            }
            for (let i = 0; i < selectedRaters.length; i++) {
                await createUserTrustSafe(
                    user._id,
                    selectedRaters[i]._id,
                    Math.floor(Math.random() * 5) + 1,
                    `Valoración recibida demo #${i + 1}`,
                    'demo'
                );
            }


            const selectedRated: any[] = [];
            while (selectedRated.length < 3 && selectedRated.length < otherUsers.length) {
                const rated = randomFromArray(otherUsers);
                if (!selectedRated.some(r => r._id.toString() === rated._id.toString()) &&
                    !selectedRaters.some(r => r._id.toString() === rated._id.toString())) {
                    selectedRated.push(rated);
                }
            }
            for (let i = 0; i < selectedRated.length; i++) {
                await createUserTrustSafe(
                    selectedRated[i]._id,
                    user._id,
                    Math.floor(Math.random() * 5) + 1,
                    `Valoración dada demo #${i + 1}`,
                    'demo'
                );
            }
        }


        const businessCoords = generateGridPoints([-3.7038, 40.4168], 1000);
        const businessNames = [
            'Razzmatazz', 'Opium', 'Pacha', 'Shoko', 'Bling Bling', 'Sutton', 'Macarena Club', 'Jamboree', 'Moog', 'Input', 'City Hall', 'La Terrrazza'
        ];
        const businesses = [];
        for (let i = 0; i < 1000; i++) {
            const name = businessNames[i % businessNames.length] + ' Business #' + (i + 1);
            const business = new Business({
                name,
                address: `Calle Falsa ${i + 1}, España`,
                phone: randomPhone(),
                email: `contact${i + 1}@${name.replace(/\s/g, '').toLowerCase()}.com`,
                location: {
                    type: 'Point',
                    coordinates: businessCoords[i]
                },
                events: [],
                managers: [randomFromArray(users)._id],
                active: true,
                avatar: ''
            });
            await business.save();
            businesses.push(business);
        }


        const joel = specialUsers.find(u => u.username === 'JoelMoreno');
        const david = specialUsers.find(u => u.username === 'DavidSanchez');


        if (joel) {
            // Excluye amigos y solicitudes ya existentes
            const allFriendships = await Friendship.find({
                $or: [
                    { requester: joel._id },
                    { recipient: joel._id }
                ]
            });
            const alreadyRelatedIds = new Set([
                ...allFriendships.map(f => f.requester.toString()),
                ...allFriendships.map(f => f.recipient.toString()),
                joel._id.toString()
            ]);
            const possibleRequesters = users.filter(u => !alreadyRelatedIds.has(u._id.toString()));
            const chosenRequesters: any[] = [];
            while (chosenRequesters.length < 10 && possibleRequesters.length > 0) {
                const idx = Math.floor(Math.random() * possibleRequesters.length);
                const user = possibleRequesters.splice(idx, 1)[0];
                chosenRequesters.push(user);
            }
            for (const requester of chosenRequesters) {
                await Friendship.create({
                    requester: requester._id,
                    recipient: joel._id,
                    status: 'pending'
                });
            }
        }

        if (joel && david) {
            const possibleFriends = users.filter(u => ![joel._id.toString(), david._id.toString()].includes(u._id.toString()));


            const madridCoords: [number, number] = [-3.7038, 40.4168];
            const madridFriends = usersNearCoords(possibleFriends, madridCoords, 30).slice(0, 15);


            const bcnCoords: [number, number] = [2.1686, 41.3874];
            const bcnFriends = usersNearCoords(possibleFriends, bcnCoords, 15, madridFriends.map(u => u._id.toString())).slice(0, 10);


            const catalunyaCoords: [number, number] = [2.1686, 41.3874];
            const catalunyaFriends = usersNearCoords(possibleFriends, catalunyaCoords, 80, [
                ...madridFriends.map(u => u._id.toString()),
                ...bcnFriends.map(u => u._id.toString())
            ]).slice(0, 10);


            const alreadyPicked = [
                ...madridFriends.map(u => u._id.toString()),
                ...bcnFriends.map(u => u._id.toString()),
                ...catalunyaFriends.map(u => u._id.toString())
            ];
            const restFriends = possibleFriends.filter(u => !alreadyPicked.includes(u._id.toString())).slice(0, 15);


            const joelFriends = [
                ...madridFriends,
                ...bcnFriends,
                ...catalunyaFriends,
                ...restFriends
            ].slice(0, 50);


            const davidFriends = [
                ...madridFriends,
                ...bcnFriends,
                ...catalunyaFriends,
                ...possibleFriends.filter(u => !alreadyPicked.includes(u._id.toString())).slice(15, 65)
            ].slice(0, 50);


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


            for (const friend of davidFriends) {
                const exists = await Friendship.findOne({
                    $or: [
                        { requester: david._id, recipient: friend._id },
                        { requester: friend._id, recipient: david._id }
                    ]
                });
                if (!exists) {
                    await new Friendship({
                        requester: david._id,
                        recipient: friend._id,
                        status: 'accepted'
                    }).save();
                }
            }

            console.log('JoelMoreno friends:');
            console.log(joelFriends.map(u => u.username).join(', '));

            console.log('DavidSanchez friends:');
            console.log(davidFriends.map(u => u.username).join(', '));


            const raters = joelFriends.slice(0, 20);
            for (let i = 0; i < raters.length; i++) {
                await createUserTrustSafe(
                    joel._id,
                    raters[i]._id,
                    Math.floor(Math.random() * 5) + 1,
                    `Trust demo #${i + 1}`,
                    'demo'
                );
            }


            console.log('Seeding posts for friends...');
            const postThemes = [
                { caption: 'Amazing night! 🌟', isVideo: false },
                { caption: 'Check this out! 🎬', isVideo: true },
                { caption: 'Loving the vibes here.', isVideo: false },
                { caption: 'Best party ever! 🔥', isVideo: true }
            ];

            const songs = [
                { title: 'Blinding Lights', artist: 'The Weeknd', coverUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music113/v4/4a/59/2c/4a592c3a-231a-6379-373a-4467c69992c3/19UMGIM83808.rgb.jpg/100x100bb.jpg' },
                { title: 'Dance Monkey', artist: 'Tones and I', coverUrl: 'https://is4-ssl.mzstatic.com/image/thumb/Music123/v4/64/0e/01/640e0149-a2e6-7788-2949-07920155660b/075679822604.jpg/100x100bb.jpg' },
                { title: 'Techno Vibe', artist: 'Underground DJ', coverUrl: 'https://via.placeholder.com/100' }
            ];

            for (const friend of joelFriends.slice(0, 10)) {
                const theme = postThemes[Math.floor(Math.random() * postThemes.length)];
                const song = songs[Math.floor(Math.random() * songs.length)];

                const mediaUrl = theme.isVideo
                    ? 'https://www.w3schools.com/html/mov_bbb.mp4'
                    : 'https://images.unsplash.com/photo-1514525253344-781f39994a1a?w=500';

                await new Post({
                    user: friend._id,
                    caption: theme.caption,
                    media: [{
                        url: mediaUrl,
                        type: theme.isVideo ? 'video' : 'image'
                    }],
                    location: 'Barcelona, Spain',
                    isPublic: true,
                    music: {
                        title: song.title,
                        artist: song.artist,
                        coverUrl: song.coverUrl
                    },
                    likes: users.slice(0, Math.floor(Math.random() * 20)).map(u => u._id),
                    comments: [
                        { user: users[0]._id, text: 'Que guapo!', createdAt: new Date() }
                    ]
                }).save();
            }
        }

        console.log('🎉 Demo data seeded successfully!');
        console.log('👤 Main users: JoelMoreno, DavidSanchez');
        console.log('👥 Users created: ' + users.length);
        console.log('🎉 Events created: ' + events.length);
        console.log('🏢 Businesses created: ' + businesses.length);
        console.log('🏙️ All users, events, and businesses distributed across Spain');
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    } catch (error) {
        console.error('Error seeding demo data:', error);
    }
}

seedDemoData().catch(console.error);