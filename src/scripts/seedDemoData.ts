import mongoose from 'mongoose';
import Business from '../models/business';

async function seedDemoBusinesses() {
  await mongoose.connect('mongodb://localhost:27017/NIGHTUP_BBDD');
  console.log('Connected to MongoDB');

  const businesses = [];
  const businessTypes = ['Bar', 'Club', 'Restaurant', 'Cafe', 'Pub'];
  const cities = ['Barcelona', 'Madrid', 'Valencia', 'Sevilla', 'Bilbao'];
  
  for (let i = 1; i <= 15; i++) {
    businesses.push({
      name: `Business ${i}`,
      description: `Description for business ${i}`,
      address: `Street ${i}, ${cities[i % cities.length]}`,
      phone: `+34 ${600000000 + i}`,
      email: `business${i}@nightup.com`,
      website: `https://business${i}.com`,
      type: businessTypes[i % businessTypes.length],
      openingHours: {
        monday: '18:00-02:00',
        tuesday: '18:00-02:00',
        wednesday: '18:00-02:00',
        thursday: '18:00-03:00',
        friday: '18:00-04:00',
        saturday: '18:00-04:00',
        sunday: 'Closed'
      },
      capacity: Math.floor(Math.random() * 200) + 50,
      priceRange: Math.floor(Math.random() * 4) + 1,
      location: {
        latitude: 41.3851 + (Math.random() - 0.5) * 0.1,
        longitude: 2.1734 + (Math.random() - 0.5) * 0.1
      },
      active: true
    });
  }
  await Business.insertMany(businesses);
  console.log('15 businesses inserted');

  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
}

seedDemoBusinesses().catch(console.error);

//* Si necesitamos añadir algo a la BBDD usamos este script *//