import swaggerJSDoc, { Options } from 'swagger-jsdoc';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'RESTful API with Node, Express, TypeScript and MongoDB',
      version: '1.0.0',
      description: 'API documentation for Users, Events and Admin management',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
    tags: [
      {
        name: 'Users',
        description: 'User management endpoints'
      },
      {
        name: 'Events',
        description: 'Event management endpoints'
      },
      {
        name: 'Authentication',
        description: 'Authentication and authorization endpoints'
      },
      {
        name: 'Administration',
        description: 'Admin-only management endpoints'
      }
    ],
  },
  apis: [
    './src/routes/userRoutes.ts',
    './src/routes/eventRoutes.ts'
  ],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;