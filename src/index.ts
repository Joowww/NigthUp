import express from 'express';
import mongoose from "mongoose";
import cors from 'cors'; 
import userRoutes from './routes/userRoutes'; 
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';
import eventRoutes from './routes/eventRoutes';
import businessRoutes from './routes/businessRoutes';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

mongoose.connect('mongodb://localhost:27017/DB')
    .then(() => {
        console.log('SUCCESSFUL CONNECTION TO MONGODB DATABASE'); 
        
        app.listen(PORT, () => {
            console.log(`SERVER URL http://localhost:${PORT}`);
            console.log(`Swagger docs at http://localhost:${PORT}/api-docs`);
        });
    })
    .catch(err => {
        console.error('THERE WAS A CONNECTION ERROR', err);
    });

app.use('/api/user', userRoutes);
app.use('/api/event', eventRoutes);
app.use('/api/business', businessRoutes);