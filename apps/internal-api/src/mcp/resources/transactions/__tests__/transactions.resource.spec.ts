import { ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { RequestLogger } from '@repo/fastify';
import { Transaction, TransactionType } from '@repo/shared/domain';
import { TransactionsRepository } from '@repo/shared/repositories';
import { FastifyBaseLogger } from 'fastify';

import { transactionsResourceBuilder } from '../transactions.resource';
import { RESOURCE_NAME, RESOURCE_PATH, STEPS } from '../transactions.resource.constants';

jest.mock('@repo/shared/repositories', () => ({
  TransactionsRepository: {
    getInstance: jest.fn().mockReturnValue({
      getDocumentsList: jest.fn(),
    }),
  },
}));

describe(transactionsResourceBuilder.name, () => {
  let mockServerLogger: jest.Mocked<FastifyBaseLogger>;
  let mockRequestLogger: jest.Mocked<RequestLogger>;
  let mockTransactionsRepo: Partial<TransactionsRepository>;

  beforeEach(() => {
    mockServerLogger = {
      child: jest.fn(),
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      trace: jest.fn(),
      fatal: jest.fn(),
    } as unknown as jest.Mocked<FastifyBaseLogger>;

    mockRequestLogger = {
      child: jest.fn().mockReturnThis(),
      startStep: jest.fn(),
      endStep: jest.fn(),
    } as any;

    jest.spyOn(RequestLogger.prototype, 'child').mockReturnValue(mockRequestLogger);
    mockTransactionsRepo = TransactionsRepository.getInstance() as jest.Mocked<TransactionsRepository>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create resource with correct configuration', () => {
    const resource = transactionsResourceBuilder(mockServerLogger);

    expect(resource.name).toBe(RESOURCE_NAME);
    expect(resource.template).toBeInstanceOf(ResourceTemplate);
    expect(resource.template.uriTemplate.toString()).toBe(RESOURCE_PATH);
  });

  it('should handle request with all date filters', async () => {
    const resource = transactionsResourceBuilder(mockServerLogger);
    const mockTransactions: Transaction[] = [{
      id: '1',
      amount: 100,
      companyId: 'company123',
      date: '2024-01-15',
      type: TransactionType.CREDIT,
      createdAt: new Date(),
      updatedAt: new Date(),
    }];
    jest.spyOn(mockTransactionsRepo, 'getDocumentsList').mockResolvedValue(mockTransactions);

    const variables = {
      companyId: 'company123',
      dateFrom: '2024-01-01',
      dateTo: '2024-01-31',
    };
    const uri = new URL(`transactions://${variables.companyId}/${variables.dateFrom}/${variables.dateTo}`);
    const extra = {
      requestId: 'test-request-id',
      signal: new AbortController().signal,
      sendNotification: jest.fn(),
      sendRequest: jest.fn(),
    };

    const result = await resource.handler(uri, variables, extra);

    expect(mockRequestLogger.startStep).toHaveBeenCalledWith(STEPS.GET_TRANSACTIONS.id);
    expect(mockTransactionsRepo.getDocumentsList).toHaveBeenCalledWith(
      {
        companyId: [{ value: variables.companyId, operator: '==' }],
        date: [
          { value: variables.dateFrom, operator: '>=' },
          { value: variables.dateTo, operator: '<=' },
        ],
      },
      mockRequestLogger
    );
    expect(mockRequestLogger.endStep).toHaveBeenCalledWith(STEPS.GET_TRANSACTIONS.id);
    expect(result.contents[0]).toEqual({
      uri: uri.href,
      text: JSON.stringify(mockTransactions),
      mimeType: 'application/json',
    });
  });

  it('should handle request with only companyId', async () => {
    const resource = transactionsResourceBuilder(mockServerLogger);
    const mockTransactions: Transaction[] = [{
      id: '1',
      amount: 100,
      companyId: 'company123',
      date: '2024-01-15',
      type: TransactionType.CREDIT,
      createdAt: new Date(),
      updatedAt: new Date(),
    }];
    jest.spyOn(mockTransactionsRepo, 'getDocumentsList').mockResolvedValue(mockTransactions);
    const variables = {
      companyId: mockTransactions[0].companyId,
    };
    const uri = new URL(`transactions://${variables.companyId}`);
    const extra = {
      requestId: 'test-request-id',
      signal: new AbortController().signal,
      sendNotification: jest.fn(),
      sendRequest: jest.fn(),
    };

    const result = await resource.handler(uri, variables, extra);

    expect(mockTransactionsRepo.getDocumentsList).toHaveBeenCalledWith(
      {
        companyId: [{ value: variables.companyId, operator: '==' }],
        date: [],
      },
      mockRequestLogger
    );
    expect(result.contents[0].text).toBe(JSON.stringify(mockTransactions));
  });

  it('should handle request with only dateFrom', async () => {
    const resource = transactionsResourceBuilder(mockServerLogger);
    const mockTransactions: Transaction[] = [{
      id: '1',
      amount: 100,
      companyId: 'company123',
      date: '2024-01-15',
      type: TransactionType.CREDIT,
      createdAt: new Date(),
      updatedAt: new Date(),
    }];
    jest.spyOn(mockTransactionsRepo, 'getDocumentsList').mockResolvedValue(mockTransactions);

    const variables = {
      companyId: mockTransactions[0].companyId,
      dateFrom: mockTransactions[0].date,
    };
    const uri = new URL(`transactions://${variables.companyId}/${variables.dateFrom}`);
    const extra = {
      requestId: 'test-request-id',
      signal: new AbortController().signal,
      sendNotification: jest.fn(),
      sendRequest: jest.fn(),
    };

    const result = await resource.handler(uri, variables, extra);

    expect(mockTransactionsRepo.getDocumentsList).toHaveBeenCalledWith(
      {
        companyId: [{ value: variables.companyId, operator: '==' }],
        date: [{ value: variables.dateFrom, operator: '>=' }],
      },
      mockRequestLogger
    );
    expect(result.contents[0].text).toBe(JSON.stringify(mockTransactions));
  });

  it('should handle request with only dateTo', async () => {
    const resource = transactionsResourceBuilder(mockServerLogger);
    const mockTransactions: Transaction[] = [{
      id: '1',
      amount: 100,
      companyId: 'company123',
      date: '2024-01-15',
      type: TransactionType.CREDIT,
      createdAt: new Date(),
      updatedAt: new Date(),
    }];
    jest.spyOn(mockTransactionsRepo, 'getDocumentsList').mockResolvedValue(mockTransactions);

    const variables = {
      companyId: mockTransactions[0].companyId,
      dateTo: mockTransactions[0].date,
    };
    const uri = new URL(`transactions://${variables.companyId}/${variables.dateTo}`);
    const extra = {
      requestId: 'test-request-id',
      signal: new AbortController().signal,
      sendNotification: jest.fn(),
      sendRequest: jest.fn(),
    };

    const result = await resource.handler(uri, variables, extra);

    expect(mockTransactionsRepo.getDocumentsList).toHaveBeenCalledWith(
      {
        companyId: [{ value: variables.companyId, operator: '==' }],
        date: [{ value: variables.dateTo, operator: '<=' }],
      },
      mockRequestLogger
    );
    expect(result.contents[0].text).toBe(JSON.stringify(mockTransactions));
  });

  it('should handle repository errors gracefully', async () => {
    const resource = transactionsResourceBuilder(mockServerLogger);
    const error = new Error('Database error');
    jest.spyOn(mockTransactionsRepo, 'getDocumentsList').mockRejectedValue(error);

    const variables = {
      companyId: 'company123',
    };
    const uri = new URL(`transactions://${variables.companyId}`);
    const extra = {
      requestId: 'test-request-id',
      signal: new AbortController().signal,
      sendNotification: jest.fn(),
      sendRequest: jest.fn(),
    };

    await expect(resource.handler(uri, variables, extra)).rejects.toThrow('Database error');
    expect(mockRequestLogger.endStep).toHaveBeenCalledWith(STEPS.GET_TRANSACTIONS.id);
  });
});
