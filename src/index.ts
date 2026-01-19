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
import postRoutes from './routes/postRoutes';
import initialInterestRoutes from './routes/initialInterestRoutes';
import groupRoutes from './routes/groupRoutes';
import userStatusRoutes from './routes/userStatusRoutes';
import chatRoutes from './routes/chatRoutes';
import aiRoutes from './routes/aiRoutes';
import musicRoutes from './routes/musicRoutes';
import fileRoutes from './routes/fileRoutes';
import notificationRoutes from './routes/notificationRoutes';

import User from './models/user';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());


app.use('/uploads', express.static('uploads'));
app.use(express.static('public'));
app.use('/public', express.static('public')); // Keep for backward compatibility

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:4200" || "http://localhost:5000" || "http://localhost:3000" || "http://localhost:5173",
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    }
});
initializeSocket(io);


mongoose.connect('mongodb://localhost:27017/NIGHTUP_BBDD')
    .then(async () => {
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
        app.use('/api/post', postRoutes);
        app.use('/api/initial-interest', initialInterestRoutes);
        app.use('/api/group', groupRoutes);
        app.use('/api/user-status', userStatusRoutes);
        app.use('/api/chat', chatRoutes);
        app.use('/api/ai', aiRoutes);
        app.use('/api/music', musicRoutes);
        app.use('/api/files', fileRoutes);
        app.use('/api/notifications', notificationRoutes);

        setupSwagger(app);


        app.get('/api/rating/test', (req, res) => {
            res.json({ message: 'Ratings API is working!', timestamp: new Date() });
        });

        app.get('/api/test', (req, res) => {
            res.json({ message: 'API is working!', allRoutes: ['/api/user', '/api/event', '/api/business', '/api/rating', '/api/post'] });
        });

        httpServer.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch(err => {
        throw err;
    });