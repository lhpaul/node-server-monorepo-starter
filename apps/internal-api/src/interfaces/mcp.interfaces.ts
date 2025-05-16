import { ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ServerNotification } from '@modelcontextprotocol/sdk/types.js';
import { RequestHandlerExtra } from '@modelcontextprotocol/sdk/shared/protocol.js';
import { Variables } from '@modelcontextprotocol/sdk/shared/uriTemplate.js';
import { ReadResourceResult, ServerRequest } from '@modelcontextprotocol/sdk/types.js';

export interface McpResourceConfig {
  name: string;
  template: ResourceTemplate;
  handler: (uri: URL, variables: Variables, extra: RequestHandlerExtra<ServerRequest, ServerNotification>) => ReadResourceResult | Promise<ReadResourceResult>
}