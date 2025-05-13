import {
  McpServer,
  ResourceTemplate,
} from '@modelcontextprotocol/sdk/server/mcp.js';
import { createMCPServer } from '../mcp.utils';
import { MCP_SERVER_CONFIG } from '../../../constants/server.constants';

jest.mock('@modelcontextprotocol/sdk/server/mcp.js', () => ({
  ...jest.requireActual('@modelcontextprotocol/sdk/server/mcp.js'),
  McpServer: jest.fn().mockImplementation(() => ({
    resource: jest.fn(),
  })),
}));

describe('MCP Utils', () => {
  describe('createMCPServer', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should create an MCP server instance with correct configuration', () => {
      const mockMcpServerMock = {
        resource: jest.fn(),
      };
      jest.mocked(McpServer).mockImplementation(() => mockMcpServerMock as any);
      const server = createMCPServer();

      expect(McpServer).toHaveBeenCalledWith(MCP_SERVER_CONFIG, {
        capabilities: {
          resources: {},
        },
      });
      expect(server).toBe(mockMcpServerMock);
    });

    it('should register company transactions resource', () => {
      const server = createMCPServer();

      expect(server.resource).toHaveBeenCalledWith(
        'Company Transactions',
        new ResourceTemplate('transactions://{companyId}', { list: undefined }),
        expect.any(Function),
      );
    });
  });
});
