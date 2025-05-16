import { FastifyBaseLogger } from 'fastify';

import { McpResourceConfig } from '../../interfaces/mcp.interfaces';
import { transactionsResourceBuilder } from '../../mcp/resources/transactions/transactions.resource';
export function getMcpResources(logger: FastifyBaseLogger): McpResourceConfig[] {
  return [
    transactionsResourceBuilder(logger),
  ];
}

