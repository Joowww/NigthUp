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
import aiRoutes from './routes/aiRoutes';

import User from './models/user';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Servir archivos estáticos (imágenes subidas)
app.use('/uploads', express.static('uploads'));
app.use('/public', express.static('public'));

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:4200",
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    }
});
initializeSocket(io);

// CONEXION A MONGODB
mongoose.connect('mongodb://localhost:27017/NIGHTUP_BBDD')
    .then(async () => {
        console.log('SUCCESSFUL CONNECTION TO MONGODB DATABASE');

        // Crear admins si no existen
        const initialAdmins = [
            // {
            //     username: 'JoelMoreno',
            //     email: 'joel@nightup.com',
            //     password: 'JoelMoreno',
            //     birthday: new Date('2000-08-06'),
            //     phoneNumber: '+34 612 345 678',
            //     securityQuestion: 'security.question.pet_name',
            //     securityAnswer: 'Fluffy'
            // },
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
        app.use('/api/ai', aiRoutes);
        console.log('[APP] /api/post routes mounted');

        console.log('All routes registered including new features');

        // Configurar Swagger
        setupSwagger(app);
        console.log('Swagger configured');

        // Rutas de prueba
        app.get('/api/rating/test', (req, res) => {
            res.json({ message: 'Ratings API is working!', timestamp: new Date() });
        });

        app.get('/api/test', (req, res) => {
            res.json({ message: 'API is working!', allRoutes: ['/api/user', '/api/event', '/api/business', '/api/rating', '/api/post'] });
        });

        /*app.listen(PORT, () => {
             console.log(`SERVER URL http://localhost:${PORT}`);
             console.log(`Swagger docs at http://localhost:${PORT}/api-docs`);
             console.log('Server is running!');
         });*/

        httpServer.listen(PORT, () => {
            console.log(`SERVER URL http://localhost:${PORT}`);
            console.log(`Static files served at http://localhost:${PORT}/uploads`);
            console.log(`Swagger docs at http://localhost:${PORT}/api-docs`);
            console.log('Server is running!');
        });
    })
    .catch(err => {
        console.error('DATABASE CONNECTION ERROR', err);
    });