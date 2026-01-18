import mongoose from 'mongoose';
import { User } from '../models/user';
import { Event } from '../models/event';
import { Conversation } from '../models/conversation';
import { Friendship } from '../models/friendship';
import { Tag } from '../models/tag';
import { UserInterest } from '../models/userInterest';
import { Business } from '../models/business';
import { UserTrust } from '../models/userTrust';
import Message from '../models/message';
import { Post } from '../models/post';
import dotenv from 'dotenv';

dotenv.config();

const EVENT_CATEGORIES = [
    'Trap', 'Reagge', 'Edgy', 'Tecno', 'Reggaeton',
    'House', 'Loofy', 'Funk', 'Pop', 'Indie',
    'Rock', 'Metal', 'Trendy', 'Pop con ñ', 'España 2000'
];

const USER_AVATARS = [
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400',
    'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
    'https://images.unsplash.com/photo-1554151228-14d9def656ec?w=400',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=400',
    'https://images.unsplash.com/photo-1504257404462-f73f17277ad3?w=400',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
    'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=400',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
    'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=400',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c3?w=400',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
    'https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?w=400',
    'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400'
];

const BUSINESS_PHOTOS = [
    'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=800',
    'https://images.unsplash.com/photo-1514362545857-3bc16549766b?w=800',
    'https://images.unsplash.com/photo-1574391884720-3850b346e9bd?w=800',
    'https://images.unsplash.com/photo-1514525253344-781f39994a1a?w=800',
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800',
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800',
    'https://images.unsplash.com/photo-1533174072545-e8d4aa97edf9?w=800',
    'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800'
];

const PARTY_PHOTOS = [
    'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=800',
    'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800',
    'https://images.unsplash.com/photo-1429962714451-bb934ecbb4ec?w=800',
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800',
    'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=800',
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800',
    'https://images.unsplash.com/photo-1514525253344-781f39994a1a?w=800',
    'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800'
];

const CHILL_PHOTOS = [
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c3?w=800',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800',
    'https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?w=800',
    'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=800',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800',
    'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=800'
];

const FIRST_NAMES = [
    'Alex', 'Sofia', 'Lucas', 'Martina', 'Leo', 'Paula', 'Hugo', 'Valeria', 'Marc', 'Sara',
    'Adrián', 'Clara', 'Daniel', 'Irene', 'Mateo', 'Emma', 'Álvaro', 'Claudia', 'Pablo', 'Marta',
    'Diego', 'Lucia', 'Jorge', 'Elena', 'Ivan', 'Alba', 'Mario', 'Julia', 'Marcos', 'Ines'
];

const LAST_NAMES = [
    'Gomez', 'Lopez', 'Diaz', 'Martinez', 'Perez', 'Garcia', 'Sanchez', 'Rodriguez', 'Fernandez', 'Moreno',
    'Ruiz', 'Jimenez', 'Alvarez', 'Romero', 'Alonso', 'Gutierrez', 'Navarro', 'Torres', 'Dominguez', 'Vazquez',
    'Serrano', 'Ramos', 'Blanco', 'Castro', 'Suarez', 'Ortega', 'Rubio', 'Molina', 'Morales', 'Delgado'
];

const PARTY_CAPTIONS = [
    '¡Fiestón esta noche en la ciudad! 🔥🎉',
    'Noche legendaria con los mejores 🍻🥂',
    '¡A tope con el reggaeton! 💃🕺',
    'La noche es joven y nosotros también ✨',
    'Viviendo el momento en el club 🎧🔥',
    '¡No hay mañana! Fiestón total 🥳',
    'Luces, música y acción 🌟🔊'
];

const CHILL_CAPTIONS = [
    'Descansando de la fiesta de anoche... 😴☕',
    'Modo relax activado después de la locura de ayer 🧘‍♂️🛋️',
    'Sobreviviendo a la resaca con mucho café ☕😅',
    'Necesito 10 horas más de sueño por lo menos 💤',
    'Peli y manta hoy, que anoche fue intenso 🎬🏠',
    'Recuperando fuerzas para la próxima 🔋🔥',
    'Paz y tranquilidad después de la tempestad 🌊✨'
];

const COMMENT_SAMPLES = [
    '¡Qué envidia! Pásalo genial 🙌',
    '¡Fiestón total! El próximo no me lo pierdo 🥳',
    'Necesito café solo de verte ☕😂',
    '¡Vaya careto! Se nota que anoche lo diste todo 😜',
    'Brutal la noche de ayer 🔥🔥',
    'Top! 🔝🔝🔝',
    'Descansa que te lo mereces bro 🛋️🙌',
    '¡A darle con todo! 🚀🚀',
    '¿Volvemos esta noche? 🤔🎉',
    'Increíble outfit! 😍✨'
];

const REAL_BUSINESSES = [
    { name: 'Pacha Barcelona', address: 'Passeig Marítim de la Barceloneta, 38, Barcelona', city: 'Barcelona', coordinates: [2.1966, 41.3851] },
    { name: 'Razzmatazz', address: 'Carrer dels Almogàvers, 122, Barcelona', city: 'Barcelona', coordinates: [2.1911, 41.3977] },
    { name: 'Opium Barcelona', address: 'Passeig Marítim de la Barceloneta, 34, Barcelona', city: 'Barcelona', coordinates: [2.1945, 41.3857] },
    { name: 'Teatro Kapital', address: 'Calle de Atocha, 125, Madrid', city: 'Madrid', coordinates: [-3.6934, 40.4093] },
    { name: 'Fabrik', address: 'Av. de la Industria, 82, Humanes de Madrid', city: 'Madrid', coordinates: [-3.8344, 40.2691] }
];

function randomFromArray<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function getVariedImage(pool: string[], index: number): string {
    return pool[index % pool.length];
}

async function createInterestTags() {
    const tagsMap: any = {};
    for (const cat of EVENT_CATEGORIES) {
        let tag = await Tag.findOne({ name: cat });
        if (!tag) {
            tag = new Tag({
                name: cat,
                type: 'EventType',
                color: '#' + Math.floor(Math.random() * 16777215).toString(16),
                description: `Interest in ${cat}`
            });
            await tag.save();
        }
        tagsMap[cat.toLowerCase()] = tag;
    }
    return tagsMap;
}

export async function seedDemoData() {
    try {
        console.log('🚀 Iniciando seeding MAESTRO de base de datos...');
        if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
        await mongoose.connect('mongodb://localhost:27017/NIGHTUP_BBDD');
        console.log('🔗 Conectado a MongoDB');

        console.log('🗑️ Vaciando colecciones...');
        const collections = Object.keys(mongoose.connection.collections);
        for (const c of collections) await mongoose.connection.collections[c].deleteMany({});

        await createInterestTags();

        // --- PROTAGONISTAS ---
        console.log('👥 Creando Joel, David y Bryan...');
        const protagonists = [];
        const protoData = [
            { username: 'JoelMoreno', email: 'joel@nightup.com', firstName: 'Joel', lastName: 'Moreno' },
            { username: 'DavidSanchez', email: 'david@nightup.com', firstName: 'David', lastName: 'Sanchez' },
            { username: 'BryanGarcia', email: 'bryan@nightup.com', firstName: 'Bryan', lastName: 'Garcia' }
        ];

        for (let i = 0; i < protoData.length; i++) {
            const img = getVariedImage(USER_AVATARS, i);
            const user = new User({
                ...protoData[i],
                password: protoData[i].username + '123',
                avatar: img,
                profilePicture: img,
                coverPhoto: getVariedImage(BUSINESS_PHOTOS, i),
                birthday: new Date('1995-01-01'),
                phoneNumber: '+34 60000000' + i,
                active: true,
                onboardingCompleted: true,
                role: 'admin',
                location: { type: 'Point', coordinates: i === 2 ? [2.1686, 41.3874] : [-3.7038, 40.4168] },
                securityQuestion: 'security.question.pet_name',
                securityAnswer: 'Fluffy',
                authProvider: 'local'
            });
            await user.save();
            protagonists.push(user);
        }

        const [joel, david, bryan] = protagonists;

        // --- USUARIOS ALEATORIOS ---
        console.log('👥 Creando 100 usuarios con nombres REALES...');
        const randomUsers = [];
        for (let i = 0; i < 100; i++) {
            const firstName = randomFromArray(FIRST_NAMES);
            const lastName = randomFromArray(LAST_NAMES);
            const username = `${firstName}${lastName}_${i}`;
            const img = getVariedImage(USER_AVATARS, i + 5);

            const user = new User({
                username,
                email: `${firstName.toLocaleLowerCase()}.${i}@gmail.com`,
                password: 'User123',
                avatar: img,
                profilePicture: img,
                birthday: new Date('1992-01-01'),
                firstName,
                lastName,
                active: true,
                role: 'user',
                onboardingCompleted: true,
                securityQuestion: 'security.question.pet_name',
                securityAnswer: 'a'
            });
            await user.save();
            randomUsers.push(user);
        }

        // --- AMISTADES ---
        console.log('🤝 Estableciendo red de amistades...');
        const createFriendship = async (u1: any, u2: any) => {
            await Friendship.create({ requester: u1._id, recipient: u2._id, status: 'accepted' });
        };

        await createFriendship(joel, david);
        await createFriendship(david, bryan);
        await createFriendship(bryan, joel);

        const joelFriends = randomUsers.slice(0, 20);
        const davidFriends = randomUsers.slice(20, 40);
        const bryanFriends = randomUsers.slice(40, 60);

        for (const f of joelFriends) await createFriendship(joel, f);
        for (const f of davidFriends) await createFriendship(david, f);
        for (const f of bryanFriends) await createFriendship(bryan, f);

        const allSpecificFriends = [...joelFriends, ...davidFriends, ...bryanFriends];

        // --- POSTS ---
        console.log('📱 Creando posts realistas con comentarios y likes...');

        for (let i = 0; i < allSpecificFriends.length; i++) {
            const user = allSpecificFriends[i];
            const isPartyPost = Math.random() > 0.5;

            const caption = isPartyPost ? randomFromArray(PARTY_CAPTIONS) : randomFromArray(CHILL_CAPTIONS);
            const photo = isPartyPost ? randomFromArray(PARTY_PHOTOS) : randomFromArray(CHILL_PHOTOS);

            // Likes de usuarios random
            const numLikes = Math.floor(Math.random() * 50) + 5;
            const likers = [];
            for (let j = 0; j < numLikes; j++) {
                likers.push(randomFromArray(randomUsers)._id);
            }

            // Comentarios de usuarios random
            const numComments = Math.floor(Math.random() * 5) + 1;
            const comments = [];
            for (let j = 0; j < numComments; j++) {
                comments.push({
                    user: randomFromArray(randomUsers)._id,
                    text: randomFromArray(COMMENT_SAMPLES),
                    createdAt: new Date()
                });
            }

            await new Post({
                user: user._id,
                caption,
                media: [{ type: 'image', url: photo }],
                isPublic: true,
                likes: likers,
                comments: comments,
                music: {
                    title: isPartyPost ? 'Club Banger' : 'Lofi Beats',
                    artist: 'NightUp Artist',
                    cover: isPartyPost ? PARTY_PHOTOS[0] : CHILL_PHOTOS[0]
                }
            }).save();
        }

        // --- NEGOCIOS Y EVENTOS ---
        console.log('🏢 Creando negocios y eventos...');
        const businesses = [];
        for (let i = 0; i < REAL_BUSINESSES.length; i++) {
            const biz = new Business({
                ...REAL_BUSINESSES[i],
                avatar: getVariedImage(BUSINESS_PHOTOS, i),
                active: true,
                location: { type: 'Point', coordinates: REAL_BUSINESSES[i].coordinates },
                managers: [bryan._id]
            });
            await biz.save();
            businesses.push({ doc: biz, city: REAL_BUSINESSES[i].city });
        }

        for (let i = 0; i < 50; i++) {
            const biz = randomFromArray(businesses);
            await new Event({
                name: `Noche de ${randomFromArray(EVENT_CATEGORIES)} @ ${biz.doc.name} #${i}`,
                description: 'La mejor fiesta.',
                schedule: new Date(Date.now() + 86400000 * (i % 7)),
                location: biz.doc.location,
                city: biz.city,
                category: randomFromArray(EVENT_CATEGORIES),
                capacity: 500,
                price: 20,
                image: getVariedImage(BUSINESS_PHOTOS, i + 10),
                active: true,
                participants: randomUsers.slice(0, 5).map(u => u._id)
            }).save();
        }

        await mongoose.disconnect();
        console.log('✨ SEEDING COMPLETADO CON ÉXITO ✨');
        process.exit(0);
    } catch (err) {
        console.error('❌ ERROR:', err);
        process.exit(1);
    }
}

seedDemoData();