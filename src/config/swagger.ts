import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Application } from 'express';

const options: swaggerJSDoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'NightUp API with Node, Express, TypeScript and MongoDB',
            version: '1.0.0',
            description: 'API documentation for NightUp - Event and User management',
        },
        servers: [
            {
                url: 'http://localhost:3000',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [{
            bearerAuth: []
        }],
        tags: [
            {
                name: 'Users - Public',
                description: 'Public user endpoints (no auth required)'
            },
            {
                name: 'Users - Authenticated',
                description: 'User endpoints for authenticated users'
            },
            {
                name: 'Users - Admin',
                description: 'User management endpoints (admin only)'
            },
            {
                name: 'Authentication',
                description: 'Authentication and token management'
            },
            {
                name: 'Events - Public',
                description: 'Public event endpoints (no auth required)'
            },
            {
                name: 'Events - Authenticated',
                description: 'Event endpoints for authenticated users'
            },
            {
                name: 'Events - Admin/Manager',
                description: 'Event management endpoints (admin or manager required)'
            },
            {
                name: 'Events - Admin Only',
                description: 'Event administration endpoints (admin only)'
            },
            {
                name: 'Business - Public',
                description: 'Public business endpoints (no auth required)'
            },
            {
                name: 'Business - Admin/Manager',
                description: 'Business management endpoints (admin or manager required)'
            },
            {
                name: 'Business - Admin Only',
                description: 'Business administration endpoints (admin only)'
            },
            {
                name: 'Ratings - Public',
                description: 'Public rating endpoints (no auth required)'
            },
            {
                name: 'Tags',
                description: 'Tag endpoints'
            },
            {
                name: 'User Interests',
                description: 'User interest endpoints'
            },
            {
                name: 'User Trust',
                description: 'User trust endpoints'
            },
            {
                name: 'Friendship',
                description: 'Friend request and friendship management endpoints'
            },
            {
                name: 'User Status',
                description: 'User online status and presence endpoints'
            },
            {
                name: 'Map',
                description: 'Map and location-based endpoints'
            },
            {
                name: 'Panic Button',
                description: 'Emergency panic button endpoints'
            },
            {
                name: 'Calendar Events',
                description: 'Calendar event management endpoints'
            },
            {
                name: 'Polls',
                description: 'Poll creation and voting endpoints'
            },
            {
                name: 'Event Tinder',
                description: 'Event-based matching system endpoints'
            },
            {
                name: 'Chat',
                description: 'Chat and messaging endpoints'
            },
            {
                name: 'Posts',
                description: 'Social posts, feed and interactions endpoints'
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
        './src/routes/postRoutes.ts'
    ],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;

export function setupSwagger(app: Application): void {
    console.log('Setting up Swagger');
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
        swaggerOptions: {
            persistAuthorization: true,
        },
    }));
}