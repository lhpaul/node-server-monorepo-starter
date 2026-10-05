/**
 * Health check endpoints - Basic infrastructure endpoints
 * 
 * These are minimal endpoints for monitoring and basic functionality.
 * Add your actual business endpoints here.
 */

import { FastifyInstance } from 'fastify';

export async function healthEndpoints(fastify: FastifyInstance): Promise<void> {
  // Health check endpoint
  fastify.get('/health', async (request, reply) => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'internal-api'
    };
  });

  // Basic info endpoint
  fastify.get('/info', async (request, reply) => {
    return {
      name: 'Node Server Monorepo Starter - Internal API',
      version: '0.0.1',
      description: 'Internal API for server-to-server communication'
    };
  });
}
