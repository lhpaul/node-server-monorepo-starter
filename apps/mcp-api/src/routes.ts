import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
// import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js'
import { Request, Response, Router } from 'express';
import { RouteOptions } from 'fastify';
import { randomUUID } from 'node:crypto';
import { createMCPServer } from './utils/mcp/mcp.utils';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export const fastifyRoutes: RouteOptions[] = [];

const transports: { [sessionId: string]: StreamableHTTPServerTransport } = {};

let mcpServer: McpServer;

export function loadExpressRoutes(router: Router) {
  router.post('/mcp', async (request, response) => {
    const sessionId = _getSessionId(request);
    console.log('sessionId', sessionId);
    console.log('request.body', request.body);
    console.log('request.headers', request.headers);
    let transport: StreamableHTTPServerTransport;
    if (sessionId && transports[sessionId]) {
      console.log('Reached here 1');
      transport = transports[sessionId];
      // } else if (!sessionId && isInitializeRequest(request.body)) {
    } else if (!sessionId) {
      console.log('Reached here 2');
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (sessionId) => {
          console.log('onsessioninitialized', sessionId);
          // Store the transport by session ID
          transports[sessionId] = transport;
        },
      });
      // Clean up transport when closed
      transport.onclose = () => {
        console.log('transport.onclose', transport.sessionId);
        if (transport.sessionId) {
          delete transports[transport.sessionId];
        }
      };
      mcpServer = createMCPServer();
      console.log('connected to mcp server');
      await mcpServer.connect(transport);
    } else {
      console.log('Reached here 3');
      response.status(400).send({
        jsonrpc: '2.0',
        error: {
          code: -32000,
          message: 'Bad Request: No valid session ID provided',
        },
        id: null,
      });
      return;
    }
    // response.on('close', () => {
    //   console.log('response.onclose');
    //   transport.close();
    //   mcpServer.close();
    // });
    console.log('Reached here 4');
    await transport.handleRequest(request, response, request.body);
  });
  router.get('/mcp', _handleMCPRequest);
  router.delete('/mcp', _handleMCPRequest);
}

async function _handleMCPRequest(
  request: Request,
  response: Response,
): Promise<void> {
  console.log('_handleMCPRequest');
  console.log('request.body', request.body);
  console.log('request.headers', request.headers);
  const sessionId = _getSessionId(request);
  console.log('sessionId', sessionId);
  if (!sessionId) {
    response.status(400).send({ error: 'Session ID is required' });
    return;
  }
  if (!transports[sessionId]) {
    response.status(400).send({ error: 'Invalid session ID' });
    return;
  }
  const transport = transports[sessionId];
  await transport.handleRequest(request, response, request.body);
}

function _getSessionId(request: Request): string | null {
  return (
    (request.headers['x-session-id'] as string) ??
    (request.headers['mcp-session-id'] as string) ??
    null
  );
}
