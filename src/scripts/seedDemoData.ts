import mongoose from 'mongoose';
import { User } from '../models/user';
import { Event } from '../models/event';
import { Friendship } from '../models/friendship';
import { Tag } from '../models/tag';
import { Business } from '../models/business';
import { Post } from '../models/post';
import dotenv from 'dotenv';
import weaviate from 'weaviate-ts-client';

dotenv.config();

// --- ARRAYS DE DATOS ---
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
    'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400',
    'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=400',
    'https://images.unsplash.com/photo-1544723083-3a1dec2ce3bf?w=400',
    'https://images.unsplash.com/photo-1548142813-c348350df52b?w=400',
    'https://images.unsplash.com/photo-1535223289827-42f1e9919769?w=400',
    'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=400',
    'https://images.unsplash.com/photo-1534308143481-c55f00be8bd7?w=400',
    'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400',
    'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400',
    'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=400'
];

const BUSINESS_PHOTOS = [
    'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=800',
    'https://images.unsplash.com/photo-1514362545857-3bc16549766b?w=800',
    'https://images.unsplash.com/photo-1574391884720-3850b346e9bd?w=800',
    'https://images.unsplash.com/photo-1514525253344-781f39994a1a?w=800',
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800',
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800',
    'https://images.unsplash.com/photo-1533174072545-e8d4aa97edf9?w=800',
    'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800',
    'https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?w=800',
    'https://images.unsplash.com/photo-1599566217286-da346dc39359?w=800',
    'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800',
    'https://images.unsplash.com/photo-1551818255-e6e10975bc17?w=800',
    'https://images.unsplash.com/photo-1563841930606-67e2b24c9675?w=800',
    'https://images.unsplash.com/photo-1519671482538-518885384569?w=800',
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800',
    'https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?w=800',
    'https://images.unsplash.com/photo-1549497538-3012c5c95698?w=800',
    'https://images.unsplash.com/photo-1531050171651-a30ae146b9ec?w=800',
    'https://images.unsplash.com/photo-1522158633578-d19005a2c739?w=800'
];

const PARTY_PHOTOS = [
    'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=800',
    'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800',
    'https://images.unsplash.com/photo-1429962714451-bb934ecbb4ec?w=800',
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800',
    'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=800',
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800',
    'https://images.unsplash.com/photo-1514525253344-781f39994a1a?w=800',
    'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800',
    'https://images.unsplash.com/photo-1496333039240-4888be5a6d59?w=800',
    'https://images.unsplash.com/photo-1545128485-c400e7702796?w=800',
    'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800',
    'https://images.unsplash.com/photo-1490604001847-b712b0c2f967?w=800',
    'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800'
];

const CHILL_PHOTOS = [
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c3?w=800',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800',
    'https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?w=800',
    'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=800',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800',
    'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=800',
    'https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?w=800',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800'
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

const PARTY_COMMENTS = [
    '¡Qué envidia! 🔥',
    '¡Vaya fotón! 📸',
    'Invitaaa la próxima vez 😉',
    '¡Lo dimos todo! 🎉',
    'Guapos/as 😍',
    '¡Qué noche! Hay que repetir',
    '🔥🔥🔥',
    'Vaya cara llevas jajajaja',
    'El rey de la pista 🕺'
];

const CHILL_COMMENTS = [
    'Planazo 👏',
    'Descansa, te lo mereces',
    'Qué paz transmite eso',
    'Yo estoy igual... modo sofá',
    'Ánimo con la resaca 😂',
    'Café en vena y a seguir',
    'Qué sitio más chulo'
];

const SPANISH_CITIES = [
    { name: 'Madrid', coords: [-3.7038, 40.4168] },
    { name: 'Barcelona', coords: [2.1734, 41.3851] },
    { name: 'Valencia', coords: [-0.3763, 39.4699] },
    { name: 'Sevilla', coords: [-5.9845, 37.3891] },
    { name: 'Zaragoza', coords: [-0.8877, 41.6488] },
    { name: 'Málaga', coords: [-4.4214, 36.7213] },
    { name: 'Murcia', coords: [-1.1307, 37.9922] },
    { name: 'Bilbao', coords: [-2.9340, 43.2630] },
    { name: 'Alicante', coords: [-0.4815, 38.3452] },
    { name: 'Valladolid', coords: [-4.7245, 41.6523] },
    { name: 'Vigo', coords: [-8.7226, 42.2406] },
    { name: 'Gijón', coords: [-5.6611, 43.5357] },
    { name: 'Granada', coords: [-3.5986, 37.1773] },
    { name: 'A Coruña', coords: [-8.4115, 43.3623] },
    { name: 'Salamanca', coords: [-5.6635, 40.9701] },
    { name: 'Santander', coords: [-3.8099, 43.4623] },
    { name: 'Pamplona', coords: [-1.6432, 42.8125] },
    { name: 'Almería', coords: [-2.4637, 36.8340] },
    { name: 'Cáceres', coords: [-6.3722, 39.4739] },
    { name: 'Badajoz', coords: [-6.9706, 38.8794] }
];

const REAL_BUSINESSES = [
    { name: 'Pacha Barcelona', address: 'Passeig Marítim de la Barceloneta, 38, Barcelona', city: 'Barcelona', coordinates: [2.1966, 41.3851] },
    { name: 'Razzmatazz', address: 'Carrer dels Almogàvers, 122, Barcelona', city: 'Barcelona', coordinates: [2.1911, 41.3977] },
    { name: 'Opium Barcelona', address: 'Passeig Marítim de la Barceloneta, 34, Barcelona', city: 'Barcelona', coordinates: [2.1945, 41.3857] },
    { name: 'Teatro Kapital', address: 'Calle de Atocha, 125, Madrid', city: 'Madrid', coordinates: [-3.6934, 40.4093] },
    { name: 'Fabrik', address: 'Av. de la Industria, 82, Humanes de Madrid', city: 'Madrid', coordinates: [-3.8344, 40.2691] },
    { name: 'Shôko Barcelona', address: 'Passeig Marítim de la Barceloneta, 36, Barcelona', city: 'Barcelona', coordinates: [2.1955, 41.3854] },
    { name: 'Sutton Barcelona', address: 'Carrer de Tuset, 13, Barcelona', city: 'Barcelona', coordinates: [2.1524, 41.3951] },
    { name: 'Bling Bling', address: 'Carrer de Tuset, 8, Barcelona', city: 'Barcelona', coordinates: [2.1522, 41.3953] },
    { name: 'Joy Eslava', address: 'Calle del Arenal, 11, Madrid', city: 'Madrid', coordinates: [-3.7061, 40.4172] },
    { name: 'Teatro Barceló', address: 'Calle de Barceló, 11, Madrid', city: 'Madrid', coordinates: [-3.7001, 40.4265] },
    { name: 'BlackHaus', address: 'Ctra. de la Coruña, Km 8.700, Madrid', city: 'Madrid', coordinates: [-3.7654, 40.4561] },
    { name: 'La Terrrazza', address: 'Av. Francesc Ferrer i Guàrdia, s/n, Barcelona', city: 'Barcelona', coordinates: [2.1481, 41.3688] },
    { name: 'Nox Club', address: 'Estación de Chamartín, Madrid', city: 'Madrid', coordinates: [-3.6821, 40.4719] },
    { name: 'City Hall', address: 'Rambla de Catalunya, 2, Barcelona', city: 'Barcelona', coordinates: [2.1701, 41.3871] },
    { name: 'Moondance Sol', address: 'Calle de la Aduana, 21, Madrid', city: 'Madrid', coordinates: [-3.7011, 40.4185] }
];

// --- FUNCIONES AUXILIARES ---
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

// ⭐ FUNCIÓN DE AMISTAD ⭐
async function makeFriends(user1: any, user2: any) {
    await Friendship.create({
        requester: user1._id,
        recipient: user2._id,
        status: 'accepted'
    });

    user1.friends.push(user2._id);
    await user1.save();

    user2.friends.push(user1._id);
    await user2.save();
}

export async function seedDemoData() {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/NIGHTUP_BBDD';

        // Connect only if not connected
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(mongoUri);
        }

        console.log('🌱 Starting database seed...');

        // Configuración Weaviate - Default to weaviate:8081 for Docker production
        const weaviateClient = weaviate.client({
            scheme: process.env.WEAVIATE_SCHEME || 'http',
            host: process.env.WEAVIATE_HOST || 'weaviate:8081',
        });

        /* ... Weaviate setup skipped for brevity if unchanged, but included below ... */
        try {
            await weaviateClient.schema.classDeleter().withClassName('Event').do();
        } catch (e) { /* Ignorar si no existe */ }

        const eventClassObj = {
            class: 'Event',
            description: 'Eventos de NightUp',
            vectorizer: 'text2vec-transformers',
            moduleConfig: {
                'text2vec-transformers': {
                    poolingStrategy: 'masked_mean',
                    vectorizeClassName: false
                }
            },
            properties: [
                { name: 'eventId', dataType: ['string'], moduleConfig: { 'text2vec-transformers': { skip: true } } },
                { name: 'name', dataType: ['text'], moduleConfig: { 'text2vec-transformers': { skip: false } } },
                { name: 'description', dataType: ['text'], moduleConfig: { 'text2vec-transformers': { skip: false } } },
                { name: 'category', dataType: ['string'], moduleConfig: { 'text2vec-transformers': { skip: false } } }
            ]
        };
        try {
            await weaviateClient.schema.classCreator().withClass(eventClassObj).do();
        } catch (e) { console.error("Weaviate schema creation error (might exist):", e); }


        // Limpieza (SOLO SI LLEGAMOS AQUI ES QUE NO HABIA USUARIOS, PERO LIMPIAMOS POR SEGURIDAD)
        const collections = Object.keys(mongoose.connection.collections);
        for (const c of collections) await mongoose.connection.collections[c].deleteMany({});

        await createInterestTags();

        // 1. PROTAGONISTAS
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
                authProvider: 'local',
                friends: []
            });
            await user.save();
            protagonists.push(user);
        }
        const [joel, david, bryan] = protagonists;

        // 2. USUARIOS RANDOM
        const randomUsers = [];
        for (let i = 0; i < 100; i++) {
            const firstName = randomFromArray(FIRST_NAMES);
            const lastName = randomFromArray(LAST_NAMES);
            const username = `${firstName}${lastName}_${i}`;
            const img = getVariedImage(USER_AVATARS, i + 10);
            const targetCity = randomFromArray(SPANISH_CITIES);

            const user = new User({
                username,
                email: `${firstName.toLocaleLowerCase()}.${i}@gmail.com`,
                password: 'User123',
                avatar: img,
                profilePicture: img,
                birthday: new Date('1992-01-01'),
                firstName,
                lastName,
                city: targetCity.name,
                location: { type: 'Point', coordinates: targetCity.coords },
                active: true,
                role: 'user',
                onboardingCompleted: true,
                securityQuestion: 'security.question.pet_name',
                securityAnswer: 'a',
                friends: []
            });
            await user.save();
            randomUsers.push(user);
        }

        // 3. AMISTADES
        await makeFriends(joel, david);
        await makeFriends(david, bryan);
        await makeFriends(bryan, joel);

        for (const friend of randomUsers.slice(0, 20)) await makeFriends(joel, friend);
        for (const friend of randomUsers.slice(20, 40)) await makeFriends(david, friend);
        for (const friend of randomUsers.slice(40, 60)) await makeFriends(bryan, friend);

        // 4. POSTS CON LIKES Y COMENTARIOS
        const friendsOfProtagonists = randomUsers.slice(0, 60);

        for (let i = 0; i < friendsOfProtagonists.length; i++) {
            const user = friendsOfProtagonists[i];
            const numPosts = Math.floor(Math.random() * 3) + 1;

            for (let p = 0; p < numPosts; p++) {
                const isPartyPost = Math.random() > 0.5;
                const caption = isPartyPost ? randomFromArray(PARTY_CAPTIONS) : randomFromArray(CHILL_CAPTIONS);
                const photo = isPartyPost ? getVariedImage(PARTY_PHOTOS, i + p) : getVariedImage(CHILL_PHOTOS, i + p);

                // LIKES
                const numLikes = Math.floor(Math.random() * 20) + 2;
                const likers = [];
                for (let j = 0; j < numLikes; j++) likers.push(randomFromArray(randomUsers)._id);

                // COMENTARIOS (NUEVO)
                const numComments = Math.floor(Math.random() * 6); // Entre 0 y 5 comentarios
                const postComments = [];
                for (let c = 0; c < numComments; c++) {
                    const commenter = randomFromArray(randomUsers);
                    const commentText = isPartyPost ? randomFromArray(PARTY_COMMENTS) : randomFromArray(CHILL_COMMENTS);

                    postComments.push({
                        user: commenter._id,
                        text: commentText,
                        createdAt: new Date(Date.now() - Math.floor(Math.random() * 86400000))
                    });
                }

                await new Post({
                    user: user._id,
                    caption,
                    media: [{ type: 'image', url: photo }],
                    isPublic: true,
                    likes: likers,
                    comments: postComments, // AÑADIDO
                    createdAt: new Date(Date.now() - Math.floor(Math.random() * 1000000000)),
                    music: {
                        title: isPartyPost ? 'Club Banger' : 'Lofi Beats',
                        artist: 'NightUp Artist',
                        cover: isPartyPost ? PARTY_PHOTOS[0] : CHILL_PHOTOS[0]
                    }
                }).save();
            }
        }

        // 5. NEGOCIOS
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

        // 6. EVENTOS + WEAVIATE
        const createdEvents = [];
        for (let i = 0; i < 100; i++) {
            const biz = randomFromArray(businesses);
            const numLikes = Math.floor(Math.random() * 80) + 10;
            const likedByUsers = randomUsers.sort(() => 0.5 - Math.random()).slice(0, numLikes).map(u => u._id);

            const event = await new Event({
                name: `Noche de ${randomFromArray(EVENT_CATEGORIES)} @ ${biz.doc.name} #${i}`,
                description: 'La mejor fiesta de la semana.',
                schedule: new Date(Date.now() + 86400000 * (i % 30)),
                location: biz.doc.location,
                city: biz.city,
                category: randomFromArray(EVENT_CATEGORIES),
                capacity: 500,
                price: 20,
                image: getVariedImage(PARTY_PHOTOS, i + 15),
                active: true,
                participants: randomUsers.slice(0, 10).map(u => u._id),
                likes: numLikes,
                likedBy: likedByUsers
            }).save();
            createdEvents.push(event);
        }

        // Batching Weaviate
        const BATCH_SIZE = 10;
        for (let i = 0; i < createdEvents.length; i += BATCH_SIZE) {
            const batch = createdEvents.slice(i, i + BATCH_SIZE);
            let batcher = weaviateClient.batch.objectsBatcher();
            for (const event of batch) {
                batcher = batcher.withObject({
                    class: 'Event',
                    properties: {
                        eventId: event._id.toString(),
                        name: event.name,
                        description: event.description,
                        category: event.category
                    }
                });
            }
            await batcher.do();
            process.stdout.write('.');
        }

        console.log('\n✅ Database Seeded Successfully!');

        // Only exit if run directly
        if (require.main === module) {
            await mongoose.disconnect();
            process.exit(0);
        }

    } catch (err) {
        console.error(err);
        // Only exit if run directly
        if (require.main === module) {
            process.exit(1);
        } else {
            throw err; // Re-throw so importing app knows it failed
        }
    }
}

// Exec only if run directly
if (require.main === module) {
    seedDemoData();
}