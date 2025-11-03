import express from 'express';
import mongoose from "mongoose";
import cors from 'cors'; 
import userRoutes from './routes/userRoutes'; 
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';
import eventRoutes from './routes/eventRoutes';
import businessRoutes from './routes/businessRoutes';
import User from './models/user';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

mongoose.connect('mongodb://localhost:27017/NIGHTUP_BBDD')
  .then(async () => {
    console.log('SUCCESSFUL CONNECTION TO MONGODB DATABASE');

    const initialAdmins = [
      {
        username: 'JoelMoreno',
        email: 'joel@nightup.com',
        password: 'JoelMoreno',
        birthday: new Date('2000-08-06')
      },
      {
        username: 'DavidSanchez',
        email: 'david@nightup.com',
        password: 'DavidSanchez',
        birthday: new Date('2000-08-06')
      },
      {
        username: 'BryanGarcia',
        email: 'bryan@nightup.com',
        password: 'BryanGarcia',
        birthday: new Date('2000-08-06')
      }
    ];

    for (const adminData of initialAdmins) {
      const existingAdmin = await User.findOne({ username: adminData.username });
      
      if (!existingAdmin) {
        const adminUser = new User({
          username: adminData.username,
          email: adminData.email,
          password: adminData.password,
          birthday: adminData.birthday,
          role: 'admin',
          active: true
        });
        
        await adminUser.save();
        console.log(`Admin user ${adminData.username} created successfully`);
      } else {
        console.log(`Admin user ${adminData.username} already exists`);
      }
    }

    app.listen(PORT, () => {
      console.log(`SERVER URL http://localhost:${PORT}`);
      console.log(`Swagger docs at http://localhost:${PORT}/api-docs`);
    });
  })
  .catch(err => {
    console.error('DATABASE CONNECTION ERROR', err);
  });

app.use('/api/user', userRoutes);
app.use('/api/event', eventRoutes);
app.use('/api/business', businessRoutes);