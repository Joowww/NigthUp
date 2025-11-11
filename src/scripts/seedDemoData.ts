import mongoose from 'mongoose';
import UserTrust from '../models/userTrust';
import User from '../models/user';

async function seedDemoUserTrust() {
  await mongoose.connect('mongodb://localhost:27017/NIGHTUP_BBDD');
  console.log('Connected to MongoDB');

  // Get two users for trust ratings
  const users = await User.find().limit(2);
  if (users.length < 2) {
    console.error('Not enough users in DB for UserTrust seeding');
    await mongoose.disconnect();
    return;
  }
  const raterId = users[0]._id;
  const ratedId = users[1]._id;

  // Seed 15 UserTrust
  const userTrusts = [];
  for (let i = 1; i <= 15; i++) {
    userTrusts.push({
      context: `Context ${i}`,
      score: Math.floor(Math.random() * 5) + 1,
      rated: ratedId,
      rater: raterId,
      comment: `Trust comment ${i}`,
      active: true
    });
  }
  await UserTrust.insertMany(userTrusts);
  console.log('15 user trust ratings inserted');

  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
}

seedDemoUserTrust().catch(console.error);


//* Si necesitamos añadir algo a la BBDD usamos este script *//