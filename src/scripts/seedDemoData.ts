import mongoose from 'mongoose';
import Tag from '../models/tag';

async function seedOnboardingTags() {
  await mongoose.connect('mongodb://localhost:27017/NIGHTUP_BBDD');
  console.log('✅ Connected to MongoDB');

  // Limpiar tags existentes (opcional - solo si quieres empezar fresco)
  // await Tag.deleteMany({});
  // console.log('🗑️  Existing tags cleared');

  const onboardingTags = [
    // 🎵 PASO 1: TIPO DE MÚSICA
    {
      name: "Techno",
      type: "MusicType",
      description: "Música techno y electrónica underground",
      color: "#ef4444",
      active: true
    },
    {
      name: "House",
      type: "MusicType", 
      description: "Música house y deep house",
      color: "#f59e0b",
      active: true
    },
    {
      name: "EDM",
      type: "MusicType",
      description: "Electronic Dance Music comercial",
      color: "#10b981",
      active: true
    },
    {
      name: "Hip Hop",
      type: "MusicType",
      description: "Hip Hop, Rap y Urban music",
      color: "#3b82f6",
      active: true
    },
    {
      name: "Reggaeton",
      type: "MusicType",
      description: "Reggaeton y música latina",
      color: "#8b5cf6",
      active: true
    },
    {
      name: "Pop",
      type: "MusicType",
      description: "Música pop y mainstream",
      color: "#ec4899",
      active: true
    },
    {
      name: "R&B",
      type: "MusicType",
      description: "Rhythm and Blues",
      color: "#06b6d4",
      active: true
    },
    {
      name: "Indie",
      type: "MusicType",
      description: "Música independiente y alternativa",
      color: "#84cc16",
      active: true
    },

    // 🎤 PASO 2: MÚSICO FAVORITO
    {
      name: "DJ Snake",
      type: "Musician",
      description: "Productor y DJ francés",
      color: "#dc2626",
      active: true
    },
    {
      name: "Marshmello",
      type: "Musician",
      description: "DJ y productor electrónico",
      color: "#fbbf24",
      active: true
    },
    {
      name: "Bad Bunny",
      type: "Musician", 
      description: "Artista de reggaeton",
      color: "#65a30d",
      active: true
    },
    {
      name: "David Guetta",
      type: "Musician",
      description: "DJ y productor francés",
      color: "#2563eb",
      active: true
    },
    {
      name: "Calvin Harris",
      type: "Musician",
      description: "DJ y productor escocés",
      color: "#7c3aed",
      active: true
    },
    {
      name: "The Weeknd",
      type: "Musician",
      description: "Cantante y compositor",
      color: "#db2777",
      active: true
    },
    {
      name: "Dua Lipa",
      type: "Musician",
      description: "Cantante y compositora",
      color: "#0891b2",
      active: true
    },
    {
      name: "Armin van Buuren",
      type: "Musician",
      description: "DJ de trance neerlandés",
      color: "#4d7c0f",
      active: true
    },

    // 🎉 PASO 3: TIPO DE EVENTO
    {
      name: "Late Night",
      type: "EventType",
      description: "Eventos nocturnos hasta tarde",
      color: "#1e40af",
      active: true
    },
    {
      name: "Festival",
      type: "EventType",
      description: "Festivales multitudinarios",
      color: "#7e22ce",
      active: true
    },
    {
      name: "Pool Party",
      type: "EventType",
      description: "Fiestas en piscina",
      color: "#be185d",
      active: true
    },
    {
      name: "Rooftop",
      type: "EventType",
      description: "Eventos en azoteas",
      color: "#0f766e",
      active: true
    },
    {
      name: "Afterwork",
      type: "EventType",
      description: "Eventos después del trabajo",
      color: "#ea580c",
      active: true
    },
    {
      name: "Boat Party",
      type: "EventType",
      description: "Fiestas en barcos",
      color: "#ca8a04",
      active: true
    },
    {
      name: "Underground",
      type: "EventType",
      description: "Eventos underground y alternativos",
      color: "#57534e",
      active: true
    },
    {
      name: "Concert",
      type: "EventType",
      description: "Conciertos en vivo",
      color: "#991b1b",
      active: true
    },

    // 👑 PASO 4: ÍDOLO DE LA INFANCIA
    {
      name: "Superhero",
      type: "ChildhoodIdol",
      description: "Superhéroes de cómics y películas",
      color: "#dc2626",
      active: true
    },
    {
      name: "Music Star",
      type: "ChildhoodIdol",
      description: "Estrellas de la música",
      color: "#ca8a04",
      active: true
    },
    {
      name: "Movie Character",
      type: "ChildhoodIdol",
      description: "Personajes de películas",
      color: "#16a34a",
      active: true
    },
    {
      name: "Athlete",
      type: "ChildhoodIdol",
      description: "Deportistas profesionales",
      color: "#2563eb",
      active: true
    },
    {
      name: "Cartoon",
      type: "ChildhoodIdol",
      description: "Personajes de dibujos animados",
      color: "#7c3aed",
      active: true
    },
    {
      name: "Video Game Hero",
      type: "ChildhoodIdol",
      description: "Héroes de videojuegos",
      color: "#db2777",
      active: true
    },
    {
      name: "Scientist",
      type: "ChildhoodIdol",
      description: "Científicos e inventores",
      color: "#0f766e",
      active: true
    },
    {
      name: "Explorer",
      type: "ChildhoodIdol",
      description: "Exploradores y aventureros",
      color: "#4338ca",
      active: true
    }
  ];

  try {
    // Insertar tags
    await Tag.insertMany(onboardingTags);
    console.log(`✅ ${onboardingTags.length} onboarding tags inserted successfully!`);
    
    // Mostrar resumen por tipo
    const musicTags = onboardingTags.filter(tag => tag.type === 'MusicType');
    const musicianTags = onboardingTags.filter(tag => tag.type === 'Musician');
    const eventTags = onboardingTags.filter(tag => tag.type === 'EventType');
    const idolTags = onboardingTags.filter(tag => tag.type === 'ChildhoodIdol');
    
    console.log('\n📊 Summary:');
    console.log(`🎵 Music Types: ${musicTags.length} tags`);
    console.log(`🎤 Musicians: ${musicianTags.length} tags`);
    console.log(`🎉 Event Types: ${eventTags.length} tags`);
    console.log(`👑 Childhood Idols: ${idolTags.length} tags`);
    console.log(`📝 Total: ${onboardingTags.length} tags`);

  } catch (error) {
    console.error('❌ Error inserting tags:', error);
  }

  await mongoose.disconnect();
  console.log('🔌 Disconnected from MongoDB');
}

seedOnboardingTags().catch(console.error);

