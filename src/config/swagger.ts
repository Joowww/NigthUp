import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Application } from 'express';
import path from 'path';

const options: swaggerJSDoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'NightUp API',
            version: '1.0.0',
            description: 'API documentation for NightUp',
        },
        servers: [
            {
                url: process.env.API_URL || 'http://localhost:3000',
                description: 'Server'
            }
        ],
    },
    apis: [
        './src/routes/userRoutes.ts',
        './src/routes/eventRoutes.ts',
        './src/routes/businessRoutes.ts',
        './src/routes/ratingRoutes.ts',
        './src/routes/tagRoutes.ts',
        './src/routes/userInterestRoutes.ts',
        './src/routes/userTrustRoutes.ts',
        './src/routes/friendshipRoutes.ts',
        './src/routes/userStatusRoutes.ts',
        './src/routes/mapRoutes.ts',
        './src/routes/panicButtonRoutes.ts',
        './src/routes/calendarEventRoutes.ts',
        './src/routes/pollRoutes.ts',
        './src/routes/eventTinderRoutes.ts',
        './src/routes/chatRoutes.ts',
        './src/routes/postRoutes.ts',
        './src/routes/aiRoutes.ts'
    ],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;

export function setupSwagger(app: Application): void {

    app.get("/api-docs.json", (_req, res) => {
        res.setHeader("Content-Type", "application/json");
        res.send(swaggerSpec);
    });

    app.use("/api-docs",
        swaggerUi.serve,
        swaggerUi.setup(swaggerSpec, {
            swaggerOptions: {
                url: "/api-docs.json",
                persistAuthorization: true,
            }
        })
    );
}