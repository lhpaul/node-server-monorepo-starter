import cors from '@fastify/cors';
import fastifyEnv from '@fastify/env';
import helmet from '@fastify/helmet';
import fastifyJwt from '@fastify/jwt';
import {
  AUTHENTICATE_DECORATOR_NAME,
  AUTHENTICATE_ERROR_CODES,
  SERVER_LOGGER_CONFIG,
  setServerErrorHandlers,
  setServerHooks,
  setServerProcessErrorHandlers,
} from '@repo/fastify';
import fastify, { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

import packageJson from '../package.json';

import {
  COR_CONFIG,
  FASTIFY_ENV_CONFIG,
  JWT_OPTIONS,
  SERVER_START_VALUES,
} from './constants/server.constants';
import { routesBuilder } from './routes';

export let server: FastifyInstance;

export const init = async function (): Promise<FastifyInstance> {
  server = fastify({
    logger: SERVER_LOGGER_CONFIG,
  });

  // Load environment variables so they can be accessed through the server and the request instance
  await server.register(fastifyEnv, FASTIFY_ENV_CONFIG);

  // Enable CORS
  await server.register(cors, COR_CONFIG);

  // Help secure the api by setting HTTP response headers
  server.register(helmet, { global: true });

  // Enable JWT authentication
  await server.register(fastifyJwt, {
    secret: server.config.JWT_SECRET,
    ...JWT_OPTIONS,
  });

  // Add decorator to authenticate requests. To avoid authentication in an route, you can pass the `skipAuth` option when building the route.
  server.decorate(AUTHENTICATE_DECORATOR_NAME, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
    } catch (err: any) {
      if (err.statusCode && err.message) {
        const code = AUTHENTICATE_ERROR_CODES[err.statusCode as keyof typeof AUTHENTICATE_ERROR_CODES] ?? err.code;
        reply.code(err.statusCode).send({ code, message: err.message });
        return;
      }
      reply.send(err);
    }
  });

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
  
  routesBuilder(server).forEach((route) => {
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
