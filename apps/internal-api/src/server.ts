import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { RequestLogger } from '@repo/fastify';
import fastify, { FastifyInstance } from 'fastify';
import { Sessions, streamableHttp } from 'fastify-mcp';

import packageJson from '../package.json';
import {
  COR_CONFIG,
  INTERNAL_ERROR_VALUES,
  MCP_SERVER_CONFIG,
  RESOURCE_NOT_FOUND_ERROR,
  SERVER_LOGGER_CONFIG,
  SERVER_START_VALUES,
  TIMEOUT_ERROR,
  UNCAUGHT_EXCEPTION_ERROR,
  UNHANDLED_REJECTION_ERROR,
} from './constants/server.constants';
import { fastifyRoutes } from './routes';
import { getMcpResources } from './utils/mcp/mcp.utils';

export let server: FastifyInstance;

export const init = async function (): Promise<FastifyInstance> {
  server = fastify({
    logger: SERVER_LOGGER_CONFIG,
  });

  await server.register(cors, COR_CONFIG);

  // Help secure the api by setting HTTP response headers
  server.register(helmet, { global: true });

  // Enable MCP server
  server.register(streamableHttp, {
    stateful: true,
    mcpEndpoint: '/mcp',
    sessions: new Sessions<StreamableHTTPServerTransport>(),
    createServer: () => {
      const mcpServer = new McpServer(MCP_SERVER_CONFIG, {
        capabilities: {
          resources: {}, // Enable resources
        },
        
      });
      const resources = getMcpResources(server.log);
      resources.forEach((resource) => {
        mcpServer.resource(resource.name, resource.template, resource.handler);
      });
      return mcpServer.server;
    },
  });

  // Load fastify routes
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

  fastifyRoutes.forEach((route) => {
    server.route(route);
  });

  // Handle 404 errors
  server.setNotFoundHandler((request, reply) => {
    request.log.warn(
      {
        logId: RESOURCE_NOT_FOUND_ERROR.logId,
        requestId: request.id,
        url: request.url,
      },
      RESOURCE_NOT_FOUND_ERROR.logMessage,
    );
    reply.status(404).send({
      code: RESOURCE_NOT_FOUND_ERROR.responseCode,
      message: RESOURCE_NOT_FOUND_ERROR.responseMessage,
    });
  });

  // Handle 500 errors
  server.setErrorHandler((error, request, reply) => {
    const lastStep = request.log.lastStep;
    const errorCode = lastStep?.obfuscatedId ?? '-1';
    request.log.error(
      {
        logId: INTERNAL_ERROR_VALUES.logId,
        errorCode,
        error,
        step: lastStep ?? null,
      },
      INTERNAL_ERROR_VALUES.logMessage({ error, step: lastStep?.id ?? null }),
    );
    return reply.code(500).send({
      code: errorCode,
      message: INTERNAL_ERROR_VALUES.responseMessage,
    });
  });

  // Wrap request logger
  server.addHook('onRequest', (request, _reply, done) => {
    request.log = new RequestLogger({
      logger: request.log,
    });
    done();
  });

  server.addHook('onSend', (request, _reply, payload, done) => {
    console.log('onSend', request.id);
    console.log('payload', payload);
    done();
  });

  // Add hook for timeout
  server.addHook('onTimeout', (request, reply) => {
    request.log.error(
      {
        logId: TIMEOUT_ERROR.logId,
        requestId: request.id,
        elapsedTime: reply.elapsedTime,
      },
      TIMEOUT_ERROR.logMessage({ reply }),
    );
  });
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

process.on('unhandledRejection', (err: Error) => {
  server.log.error(
    {
      logId: UNHANDLED_REJECTION_ERROR.logId,
      error: err,
    },
    UNHANDLED_REJECTION_ERROR.logMessage({ err }),
  );
  console.error('unhandledRejection', err);
  process.exit(1);
});

process.on('uncaughtException', (err: Error) => {
  server.log.error(
    {
      logId: UNCAUGHT_EXCEPTION_ERROR.logId,
      error: err,
    },
    UNCAUGHT_EXCEPTION_ERROR.logMessage({ err }),
  );
  console.error('uncaughtException', err);
  process.exit(1);
});
