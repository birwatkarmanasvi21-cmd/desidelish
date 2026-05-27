export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'DesiDelish API',
    version: '1.0.0',
    description: 'Production-ready API for Online Food Ordering System',
  },
  servers: [
    {
      url: 'http://localhost:5000/api',
      description: 'Local server',
    },
  ],
  paths: {
    '/auth/signup': {
      post: {
        tags: ['Authentication'],
        summary: 'Register a new user',
        responses: {
          201: { description: 'User created' },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Login user',
        responses: {
          200: { description: 'Login successful' },
        },
      },
    },
    '/restaurants': {
      get: {
        tags: ['Restaurants'],
        summary: 'Get all restaurants',
        parameters: [
          { name: 'city', in: 'query', schema: { type: 'string' } },
          { name: 'latitude', in: 'query', schema: { type: 'number' } },
          { name: 'longitude', in: 'query', schema: { type: 'number' } },
        ],
        responses: {
          200: { description: 'List of restaurants' },
        },
      },
    },
    '/orders/checkout': {
      post: {
        tags: ['Orders'],
        summary: 'Place a new order',
        security: [{ BearerAuth: [] }],
        responses: {
          201: { description: 'Order placed' },
        },
      },
    },
    '/deals/active': {
      get: {
        tags: ['Deals'],
        summary: 'Get all active leftover deals',
        responses: {
          200: { description: 'Active deals list' },
        },
      },
    },
    '/budget/combinations': {
      get: {
        tags: ['Budget Mode'],
        summary: 'Get meal combinations within budget',
        parameters: [
          { name: 'budget', in: 'query', schema: { type: 'number' } },
          { name: 'lat', in: 'query', schema: { type: 'number' } },
          { name: 'lng', in: 'query', schema: { type: 'number' } },
        ],
        responses: {
          200: { description: 'Budget combinations' },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
};
