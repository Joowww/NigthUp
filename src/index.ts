import express from 'express';
import mongoose from "mongoose";
import cors from 'cors'; 
import usuarioRoutes from './routes/usuarioRoutes'; 
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';
import eventoRoutes from './routes/eventoRoutes';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.json() as express.RequestHandler); 
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

mongoose.connect('mongodb://localhost:27017/BBDD')
    .then(() => {
        console.log('CONEXION EXITOSA A LA BASE DE DATOS DE MONGODB'); 
        
        app.listen(PORT, () => {
            console.log(`URL DEL SERVIDOR http://localhost:${PORT}`);
            console.log(`Swagger docs en http://localhost:${PORT}/api-docs`);
        });
    })
    .catch(err => {
        console.error('HAY ALGUN ERROR CON LA CONEXION', err);
    });

app.use('/api/user', usuarioRoutes);
app.use('/api/event', eventoRoutes);