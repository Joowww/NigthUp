import express from 'express';
import mongoose from "mongoose";
import cors from 'cors';
import dotenv from 'dotenv';

import swaggerSpec from './config/swagger';
import { setupSwagger } from './config/swagger';

import userRoutes from './routes/userRoutes';
import eventRoutes from './routes/eventRoutes';
import businessRoutes from './routes/businessRoutes';
import ratingRoutes from './routes/ratingRoutes';
import tagRoutes from './routes/tagRoutes';
import userInterestRoutes from './routes/userInterestRoutes';
import userTrustRoutes from './routes/userTrustRoutes';

// Importar nuevas rutas
import friendshipRoutes from './routes/friendshipRoutes';
import mapRoutes from './routes/mapRoutes';
import panicButtonRoutes from './routes/panicButtonRoutes';
import calendarEventRoutes from './routes/calendarEventRoutes';
import pollRoutes from './routes/pollRoutes';
import eventTinderRoutes from './routes/eventTinderRoutes';

import User from './models/user';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// CONEXION A MONGODB
mongoose.connect('mongodb://localhost:27017/NIGHTUP_BBDD')
.then(async () => {
    console.log('SUCCESSFUL CONNECTION TO MONGODB DATABASE');

    // Crear admins si no existen
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

    // REGISTRAR RUTAS ANTES DE INICIAR EL SERVIDOR
    app.use('/api/user', userRoutes);
    app.use('/api/event', eventRoutes);
    console.log('[APP] /api/event routes mounted');
    app.use('/api/business', businessRoutes);
    app.use('/api/rating', ratingRoutes);
    app.use('/api/tag', tagRoutes);
    app.use('/api/user-interest', userInterestRoutes);
    app.use('/api/user-trust', userTrustRoutes);

    // Nuevas rutas
    app.use('/api/friendship', friendshipRoutes);
    app.use('/api/map', mapRoutes);
    app.use('/api/panic', panicButtonRoutes);
    app.use('/api/calendar', calendarEventRoutes);
    app.use('/api/poll', pollRoutes);
    app.use('/api/event-tinder', eventTinderRoutes);

    console.log('All routes registered including new features');

    // Configurar Swagger
    setupSwagger(app);
    console.log('Swagger configured');

    // Rutas de prueba
    app.get('/api/rating/test', (req, res) => {
        res.json({ message: 'Ratings API is working!', timestamp: new Date() });
    });
    
    app.get('/api/test', (req, res) => {
        res.json({ message: 'API is working!', allRoutes: ['/api/user', '/api/event', '/api/business', '/api/rating'] });
    });

    app.listen(PORT, () => {
        console.log(`SERVER URL http://localhost:${PORT}`);
        console.log(`Swagger docs at http://localhost:${PORT}/api-docs`);
        console.log('Server is running!');
    });
})
.catch(err => {
    console.error('DATABASE CONNECTION ERROR', err);
});