import express from 'express';
import mongoose from "mongoose";
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

import swaggerSpec from './config/swagger';
import { setupSwagger } from './config/swagger';

import http from 'http';
import { Server } from 'socket.io';
import { initializeSocket } from './socket/socketHandler';

// Importación de rutas
import userRoutes from './routes/userRoutes';
import eventRoutes from './routes/eventRoutes';
import businessRoutes from './routes/businessRoutes';
import ratingRoutes from './routes/ratingRoutes';
import tagRoutes from './routes/tagRoutes';
import userInterestRoutes from './routes/userInterestRoutes';
import userTrustRoutes from './routes/userTrustRoutes';
import friendshipRoutes from './routes/friendshipRoutes';
import mapRoutes from './routes/mapRoutes';
import panicButtonRoutes from './routes/panicButtonRoutes';
import calendarEventRoutes from './routes/calendarEventRoutes';
import pollRoutes from './routes/pollRoutes';
import eventTinderRoutes from './routes/eventTinderRoutes';
import postRoutes from './routes/postRoutes';
import initialInterestRoutes from './routes/initialInterestRoutes';
import groupRoutes from './routes/groupRoutes';
import userStatusRoutes from './routes/userStatusRoutes';
import chatRoutes from './routes/chatRoutes';

import User from './models/user';

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
setupSwagger(app);


// Servir archivos estáticos
app.use('/uploads', express.static('uploads'));
app.use('/public', express.static('public'));

// --- CONFIGURACIÓN CORS ---
app.use(cors({
    origin: process.env.FRONTEND_URL?.split(',') || [
      'http://localhost:4200',
      'http://localhost:8080',
      'http://localhost:5173',
      'https://ea1.upc.edu',
      'https://ea1-api.upc.edu'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
}));

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL?.split(',') || [
        'http://localhost:4200',
        'http://localhost:8080',
        'http://localhost:5173',
        'https://ea1.upc.edu',
        'https://ea1-api.upc.edu'
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
    }
});
initializeSocket(io);

// URI de Mongo (Prioridad: Variable de Entorno > Localhost)
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/NIGHTUP_BBDD';

// CONEXION A MONGODB
mongoose.connect(MONGO_URI)
.then(async () => {
    console.log('SUCCESSFUL CONNECTION TO MONGODB DATABASE');
    console.log(`Using Mongo URI: ${MONGO_URI}`); // Log útil para debug en prod

    // Crear admins si no existen
    const initialAdmins = [
    {
        username: 'DavidSanchez',
        email: 'david@nightup.com',
        password: 'DavidSanchez',
        birthday: new Date('2000-08-06'),
        phoneNumber: '+34 612 345 679',
        securityQuestion: 'security.question.birth_city',
        securityAnswer: 'Madrid'
    },
    {
        username: 'BryanGarcia',
        email: 'bryan@nightup.com',
        password: 'BryanGarcia',
        birthday: new Date('2000-08-06'),
        phoneNumber: '+34 612 345 680',
        securityQuestion: 'security.question.favorite_food',
        securityAnswer: 'Pizza'
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
                phoneNumber: adminData.phoneNumber,
                securityQuestion: adminData.securityQuestion,
                securityAnswer: adminData.securityAnswer,
                role: 'admin',
                active: true
            });
            await adminUser.save();
            console.log(`Admin user ${adminData.username} created successfully`);
        }
    }

    // REGISTRAR RUTAS
    app.use('/api/user', userRoutes);
    app.use('/api/event', eventRoutes);
    app.use('/api/business', businessRoutes);
    app.use('/api/rating', ratingRoutes);
    app.use('/api/tag', tagRoutes);
    app.use('/api/user-interest', userInterestRoutes);
    app.use('/api/user-trust', userTrustRoutes);
    app.use('/api/friendship', friendshipRoutes);
    app.use('/api/map', mapRoutes);
    app.use('/api/panic', panicButtonRoutes);
    app.use('/api/calendar', calendarEventRoutes);
    app.use('/api/poll', pollRoutes);
    app.use('/api/event-tinder', eventTinderRoutes);
    app.use('/api/post', postRoutes);
    app.use('/api/initial-interest', initialInterestRoutes);
    app.use('/api/group', groupRoutes);
    app.use('/api/user-status', userStatusRoutes);
    console.log('[APP] /api/group routes mounted');
    app.use('/api/chat', chatRoutes);
    console.log('[APP] /api/post routes mounted');

    console.log('All routes registered including new features');

    // Rutas de prueba
    app.get('/api/rating/test', (req, res) => {
        res.json({ message: 'Ratings API is working!', timestamp: new Date() });
    });
    
    app.get('/api/test', (req, res) => {
        res.json({ message: 'API is working!', allRoutes: ['/api/user', '/api/event'] });
    });

    // Iniciar servidor
    httpServer.listen(PORT, () => { 
        console.log(`SERVER URL http://localhost:${PORT}`);
        console.log(`Swagger docs at ${process.env.API_URL || `http://localhost:${PORT}`}/api-docs`);
        console.log('Server is running!');
    });
})
.catch(err => {
    console.error('DATABASE CONNECTION ERROR', err);
});