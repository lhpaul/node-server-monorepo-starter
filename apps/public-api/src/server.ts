import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { 
  SERVER_LOGGER_CONFIG,
  setServerErrorHandlers,
  setServerHooks,
  setServerProcessErrorHandlers,
} from '@repo/fastify';
import fastify, { FastifyInstance } from 'fastify';

import packageJson from '../package.json';

import {
  COR_CONFIG,
  SERVER_START_VALUES,
} from './constants/server.constants';
import { routes } from './routes';

export let server: FastifyInstance;

export const init = async function (): Promise<FastifyInstance> {
  server = fastify({
    logger: SERVER_LOGGER_CONFIG,
  });

  await server.register(cors, COR_CONFIG);

  // Help secure the api by setting HTTP response headers
  server.register(helmet, { global: true });

  // Load routes
  server.route({
    method: 'GET',
    url: '/',
    handler: (_request, reply) => {
      return reply.send({
        name: packageJson.name,
        version: packageJson.version,
        now: new Date().toISOString(),
      });
    },
  });
  routes.forEach((route) => {
    server.route(route);
  });

  setServerErrorHandlers(server);
  setServerHooks(server);
  setServerProcessErrorHandlers(server);
  return server;
};

export const start = async function (): Promise<void> {
  const address = await server.listen({
    port: SERVER_START_VALUES.port,
    host: SERVER_START_VALUES.host,
  });

  server.log.info(
    {
      logId: SERVER_START_VALUES.logId,
      address,
    },
    SERVER_START_VALUES.logMessage({ address }),
  );
};
