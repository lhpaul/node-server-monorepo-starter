import {
  McpServer,
  ResourceTemplate,
} from '@modelcontextprotocol/sdk/server/mcp.js';
import { ReadResourceResult } from '@modelcontextprotocol/sdk/types.js';

import { MCP_SERVER_CONFIG } from '../../constants/server.constants';

export function createMCPServer(): McpServer {
  const server = new McpServer(MCP_SERVER_CONFIG, {
    capabilities: {
      resources: {}, // Enable resources
    },
  });
  // List available resources when clients request them
  server.resource(
    'Company Transactions',
    new ResourceTemplate('transactions://{companyId}', { list: undefined }),
    async (uri, { companyId }) => {
      const response: ReadResourceResult = {
        contents: [
          {
            uri: uri.href,
            text: JSON.stringify({ companyId }),
            mimeType: 'text/json',
          },
        ],
      };
      return Promise.resolve(response);
    },
  );

  return server;
}
