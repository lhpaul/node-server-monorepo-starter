import { FastifyBaseLogger } from 'fastify';
import { ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ReadResourceResult } from '@modelcontextprotocol/sdk/types.js';

import { McpResourceConfig } from '../../../interfaces/mcp.interfaces';
import { getMcpResources } from '../mcp.utils';
import { transactionsResourceBuilder } from '../../../mcp/resources/transactions/transactions.resource';

// Mock the transactionsResourceBuilder
jest.mock('../../../mcp/resources/transactions/transactions.resource', () => ({
  transactionsResourceBuilder: jest.fn(),
}));

describe(getMcpResources.name, () => {
  let mockLogger: FastifyBaseLogger;
  let mockTransactionsResource: McpResourceConfig;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Setup mock logger
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      trace: jest.fn(),
      fatal: jest.fn(),
      child: jest.fn(),
    } as unknown as FastifyBaseLogger;

    // Setup mock transactions resource
    mockTransactionsResource = {
      name: 'transactions',
      template: {} as ResourceTemplate,
      handler: jest.fn().mockResolvedValue({} as ReadResourceResult),
    };

    // Setup mock implementation
    (transactionsResourceBuilder as jest.Mock).mockReturnValue(mockTransactionsResource);
  });

  it('should return an array containing the transactions resource', () => {
    const result = getMcpResources(mockLogger);

    expect(result).toEqual([mockTransactionsResource]);
    expect(transactionsResourceBuilder).toHaveBeenCalledWith(mockLogger);
    expect(transactionsResourceBuilder).toHaveBeenCalledTimes(1);
  });
});
