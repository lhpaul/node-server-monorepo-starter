import { FastifyInstance, RouteOptions } from 'fastify';

import { healthEndpoints } from './endpoints/health/health.endpoints';

export const routesBuilder = (server: FastifyInstance): RouteOptions[] => {
  return [
    // Register your actual endpoints here
    // Example: health check endpoints
    {
      url: '/',
      method: 'GET',
      handler: healthEndpoints
    }
  ];
};
