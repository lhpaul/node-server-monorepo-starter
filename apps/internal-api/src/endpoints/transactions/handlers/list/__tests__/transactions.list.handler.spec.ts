import { STATUS_CODES } from '@repo/fastify';
import { Transaction, TransactionSourceType, TransactionType } from '@repo/shared/domain';
import { TransactionsService } from '@repo/shared/domain';
import { FastifyBaseLogger, FastifyReply, FastifyRequest } from 'fastify';

import { listTransactionsHandler } from '../transactions.list.handler';
import { STEPS } from '../transactions.list.handler.constants';

jest.mock('@repo/shared/domain');

describe(listTransactionsHandler.name, () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockService: Partial<TransactionsService>;
  let mockLogger: Partial<FastifyBaseLogger>;
  const logGroup = listTransactionsHandler.name;
  
  const mockTransactions: Transaction[] = [
    {
      id: '1',
      categoryId: '1',
      description: 'description1',
      sourceType: TransactionSourceType.FINANCIAL_INSTITUTION,
      sourceId: '1',
      sourceTransactionId: '1',
      companyId: '1',
      date: '2024-01-01',
      amount: 100,
      type: TransactionType.CREDIT,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      categoryId: '2',
      description: 'description2',
      sourceType: TransactionSourceType.FINANCIAL_INSTITUTION,
      sourceId: '2',
      sourceTransactionId: '2',
      companyId: '2',
      date: '2024-01-02',
      amount: 200,
      type: TransactionType.DEBIT,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '3',
      categoryId: '3',
      description: 'description3',
      sourceType: TransactionSourceType.FINANCIAL_INSTITUTION,
      sourceId: '3',
      sourceTransactionId: '3',
      companyId: '3',
      date: '2024-01-03',
      amount: 300,
      type: TransactionType.CREDIT,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(() => {
    mockLogger = {
      child: jest.fn().mockReturnThis(),
      startStep: jest.fn(),
      endStep: jest.fn(),
    };

    mockRequest = {
      log: mockLogger as FastifyBaseLogger,
      query: {},
    };

    mockReply = {
      code: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    mockService = {
      getResourcesList: jest.fn(),
    };

    (TransactionsService.getInstance as jest.Mock).mockReturnValue(
      mockService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return all transactions when no query parameters are provided', async () => {
    jest.spyOn(mockService, 'getResourcesList').mockResolvedValue(mockTransactions);

    await listTransactionsHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_TRANSACTIONS, logGroup);
    expect(mockService.getResourcesList).toHaveBeenCalledWith(
      {},
      mockLogger,
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_TRANSACTIONS);
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.OK);
    expect(mockReply.send).toHaveBeenCalledWith(mockTransactions);
  });

  it('should filter transactions based on query parameters', async () => {
    const queryParams = {
      amount: 100,
      'date[gt]': '2024-01-01',
    };
    mockRequest.query = queryParams;
    const filteredTransactions = [mockTransactions[0]];
    jest.spyOn(mockService, 'getResourcesList').mockResolvedValue(filteredTransactions);

    await listTransactionsHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_TRANSACTIONS, logGroup);
    expect(mockService.getResourcesList).toHaveBeenCalledWith(
      {
        amount: [{ operator: '==', value: 100 }],
        date: [{ operator: '>', value: '2024-01-01' }],
      },
      mockLogger,
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_TRANSACTIONS);
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.OK);
    expect(mockReply.send).toHaveBeenCalledWith(filteredTransactions);
  });

  it('should handle empty result set', async () => {
    jest.spyOn(mockService, 'getResourcesList').mockResolvedValue([]);

    await listTransactionsHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_TRANSACTIONS, logGroup);
    expect(mockService.getResourcesList).toHaveBeenCalledWith(
      {},
      mockLogger,
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_TRANSACTIONS);
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.OK);
    expect(mockReply.send).toHaveBeenCalledWith([]);
  });

  it('should handle service errors', async () => {
    const error = new Error('Service error');
    jest.spyOn(mockService, 'getResourcesList').mockRejectedValue(error);

    await expect(
      listTransactionsHandler(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      ),
    ).rejects.toThrow(error);

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_TRANSACTIONS, logGroup);
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_TRANSACTIONS);
    expect(mockReply.code).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });
});
