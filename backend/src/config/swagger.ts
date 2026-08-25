import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Bharat Electronics Dashboard API',
      version: '1.0.0',
      description: 'Production-ready REST API for the BEL Dashboard application.',
      contact: { name: 'API Support', email: 'support@bel.com' },
    },
    servers: [{ url: '/api/v1', description: 'Development Server' }],
    components: {
      securitySchemes: {
        BearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
      schemas: {
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' },
            data: { type: 'object' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            errors: { type: 'array', items: { type: 'object' } },
          },
        },
      },
    },
    security: [{ BearerAuth: [] }],
    tags: [
      { name: 'Auth', description: 'Authentication & Tokens' },
      { name: 'Users', description: 'User management' },
      { name: 'Dashboard', description: 'Dashboard summary endpoints' },
      { name: 'Digital Assets', description: 'Crypto/digital asset management' },
      { name: 'Transactions', description: 'Transaction history & analytics' },
      { name: 'Wallets', description: 'Wallet management' },
      { name: 'Analytics', description: 'Portfolio & market analytics' },
      { name: 'Notifications', description: 'User notifications' },
    ],
  },
  apis: ['./src/modules/**/*.routes.ts', './src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
