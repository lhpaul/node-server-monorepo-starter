import cors from '@fastify/cors';
import fastifyEnv from '@fastify/env';
import helmet from '@fastify/helmet';
import {
  SERVER_LOGGER_CONFIG,
  setServerErrorHandlers,
  setServerFirebaseAuthenticationDecorator,
  setServerHooks,
  setServerProcessErrorHandlers,
} from '@repo/fastify';
import { getEnvVariable } from '@repo/shared/utils';
import fastify, { FastifyInstance } from 'fastify';
import * as admin from 'firebase-admin';

import packageJson from '../package.json';

import {
  COR_CONFIG,
  FASTIFY_ENV_CONFIG,
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

  // Initialize Firebase Admin SDK
  await admin.initializeApp({
    projectId: getEnvVariable('FIREBASE_PROJECT_ID'),
    credential: admin.credential.applicationDefault(),
    databaseURL: getEnvVariable('FIREBASE_DATABASE_URL'),
  });

  // Add decorator to authenticate requests. To avoid authentication in an route, you set the `authenticate` option to `false` when building the route.
  setServerFirebaseAuthenticationDecorator(server);

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
