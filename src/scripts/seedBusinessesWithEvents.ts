// backend/scripts/seed.ts
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Business } from '../models/business';
import { Event } from '../models/event';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/NIGHTUP_BBDD';

// Coordenadas de Barcelona y alrededores
const businessesData = [
  {
    name: 'Pacha Barcelona',
    address: 'Av. del Gregorio Marañón, 17, Barcelona',
    phone: '+34 933 196 000',
    email: 'info@pachabarcelona.com',
    coordinates: [2.1734, 41.3851], // [lng, lat]
    avatar: '/images/businesses/pacha-barcelona.jpg' // ✅ Ruta local
  },
  {
    name: 'Razzmatazz',
    address: 'Carrer dels Almogàvers, 122, Barcelona',
    phone: '+34 933 208 200',
    email: 'info@salarazzmatazz.com',
    coordinates: [2.1966, 41.3950],
    avatar: '/images/businesses/razzmatazz.jpg' // ✅ Ruta local
  },
  {
    name: 'Opium Barcelona',
    address: 'Passeig Marítim de la Barceloneta, 34, Barcelona',
    phone: '+34 932 251 660',
    email: 'reservas@opiumbarcelona.com',
    coordinates: [2.1950, 41.3776],
    avatar: '/images/businesses/opium.jpg' // ✅ Ruta local
  },
  {
    name: 'Shôko Barcelona',
    address: 'Passeig Marítim de la Barceloneta, 36, Barcelona',
    phone: '+34 932 250 710',
    email: 'info@shokobarcelona.com',
    coordinates: [2.1960, 41.3780],
    avatar: '/images/businesses/shoko.jpg' // ✅ Ruta local
  },
  {
    name: 'Sutton Club Barcelona',
    address: 'Carrer de Tuset, 13, Barcelona',
    phone: '+34 933 629 500',
    email: 'info@thesuttonclub.com',
    coordinates: [2.1520, 41.3960],
    avatar: '/images/businesses/sutton.jpg' // ✅ Ruta local
  },
  {
    name: 'Jamboree Jazz Club',
    address: 'Plaça Reial, 17, Barcelona',
    phone: '+34 933 191 789',
    email: 'info@masimas.com',
    coordinates: [2.1750, 41.3800],
    avatar: '/images/businesses/jamboree.jpg' // ✅ Ruta local
  },
  {
    name: 'City Hall Barcelona',
    address: 'Rambla de Catalunya, 2-4, Barcelona',
    phone: '+34 933 178 722',
    email: 'info@grup-cityhall.com',
    coordinates: [2.1700, 41.3870],
    avatar: '/images/businesses/cityhall.jpg' // ✅ Ruta local
  },
  {
    name: 'Eclipse Barcelona',
    address: 'Plaça de Rosa dels Vents, 1, Barcelona',
    phone: '+34 932 952 800',
    email: 'eclipse.w@w-barcelona.com',
    coordinates: [2.1890, 41.3690],
    avatar: '/images/businesses/eclipse.jpg' // ✅ Ruta local
  },
  {
    name: 'Sala Apolo',
    address: 'Carrer Nou de la Rambla, 113, Barcelona',
    phone: '+34 934 414 001',
    email: 'info@sala-apolo.com',
    coordinates: [2.1680, 41.3750],
    avatar: '/images/businesses/apolo.jpg' // ✅ Ruta local
  },
  {
    name: 'Input High Fidelity Dance Club',
    address: 'Carrer de Zamora, 78, Barcelona',
    phone: '+34 933 157 333',
    email: 'info@inputbarcelona.com',
    coordinates: [2.1900, 41.4050],
    avatar: '/images/businesses/input.jpg' // ✅ Ruta local
  }
];

const eventsData = [
  {
    name: 'Noche de Techno en Pacha',
    description: 'La mejor noche de techno en Barcelona con DJs internacionales',
    category: 'Techno',
    capacity: 500,
    price: 25,
    image: '/images/events/techno.jpg'
  },
  {
    name: 'Razz Night - Indie Rock',
    description: 'Concierto de indie rock con bandas emergentes',
    category: 'Rock',
    capacity: 800,
    price: 15,
    image: '/images/events/rock.jpg'
  },
  {
    name: 'Opium Beach Party',
    description: 'Fiesta en la playa con los mejores DJs de house',
    category: 'House',
    capacity: 600,
    price: 20,
    image: '/images/events/beach.jpg'
  },
  {
    name: 'Shôko Reggaeton Night',
    description: 'La mejor música latina y reggaeton',
    category: 'Reggaeton',
    capacity: 400,
    price: 18,
    image: '/images/events/reggaeton.jpg'
  },
  {
    name: 'Sutton VIP Experience',
    description: 'Noche exclusiva con champagne y música comercial',
    category: 'Pop',
    capacity: 300,
    price: 30,
    image: '/images/events/vip.jpg'
  },
  {
    name: 'Jazz Live at Jamboree',
    description: 'Concierto de jazz en vivo con artistas reconocidos',
    category: 'Loofy',
    capacity: 200,
    price: 22,
    image: '/images/events/jazz.jpg'
  },
  {
    name: 'City Hall 90s Party',
    description: 'Fiesta temática de los 90s con los mejores hits',
    category: 'Pop',
    capacity: 700,
    price: 12,
    image: '/images/events/90s.jpg'
  },
  {
    name: 'Eclipse Rooftop Sunset',
    description: 'Atardecer con cócteles y música chill en la azotea',
    category: 'Loofy',
    capacity: 150,
    price: 35,
    image: '/images/events/sunset.jpg'
  },
  {
    name: 'Nasty Mondays at Apolo',
    description: 'Los lunes más salvajes con música alternativa',
    category: 'Indie',
    capacity: 900,
    price: 10,
    image: '/images/events/alternative.jpg'
  },
  {
    name: 'Input Underground',
    description: 'Sesión de techno underground hasta el amanecer',
    category: 'Techno',
    capacity: 450,
    price: 20,
    image: '/images/events/underground.jpg'
  }
];

async function seedBusinessesWithEvents() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('✅ Conectado a MongoDB');

    // Limpiar colecciones
    await Business.deleteMany({});
    await Event.deleteMany({});
    console.log('🗑️  Colecciones limpiadas');

    // Crear eventos y negocios
    const createdBusinesses = [];

    for (let i = 0; i < businessesData.length; i++) {
      const businessData = businessesData[i];
      const eventData = eventsData[i];

      // Crear evento
      const eventDate = new Date();
      eventDate.setDate(eventDate.getDate() + Math.floor(Math.random() * 30) + 1);

      const event = new Event({
        name: eventData.name,
        schedule: eventDate,
        location: {
          type: 'Point',
          coordinates: businessData.coordinates
        },
        description: eventData.description,
        category: eventData.category,
        capacity: eventData.capacity,
        price: eventData.price,
        participants: [],
        likes: Math.floor(Math.random() * 100),
        likedBy: [],
        active: true,
        image: eventData.image
      });

      await event.save();
      console.log(`✅ Evento creado: ${event.name}`);

      // Crear negocio con el evento
      const business = new Business({
        name: businessData.name,
        address: businessData.address,
        phone: businessData.phone,
        email: businessData.email,
        location: {
          type: 'Point',
          coordinates: businessData.coordinates
        },
        events: [event._id],
        managers: [],
        active: true,
        avatar: businessData.avatar
      });

      await business.save();
      createdBusinesses.push(business);
      console.log(`✅ Negocio creado: ${business.name} con evento ${event.name}`);
    }

    console.log('\n🎉 Seed completado exitosamente!');
    console.log(`📊 Total de negocios creados: ${createdBusinesses.length}`);
    console.log(`📊 Total de eventos creados: ${createdBusinesses.length}`);

    // Mostrar algunos datos de ejemplo
    console.log('\n📍 Ejemplo de negocio creado:');
    const example = await Business.findOne().populate('events');
    console.log(JSON.stringify(example, null, 2));

    process.exit(0);
  } catch (error) {
    console.error('❌ Error en el seed:', error);
    process.exit(1);
  }
}

// Ejecutar seed
seedBusinessesWithEvents();