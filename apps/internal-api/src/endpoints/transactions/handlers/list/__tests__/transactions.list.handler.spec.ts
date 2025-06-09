import { STATUS_CODES } from '@repo/fastify';
import { TransactionType } from '@repo/shared/domain';
import { TransactionsRepository } from '@repo/shared/repositories';
import { FastifyBaseLogger, FastifyReply, FastifyRequest } from 'fastify';

import { listTransactionsHandler } from '../transactions.list.handler';
import { STEPS } from '../transactions.list.handler.constants';

jest.mock('@repo/shared/repositories');

describe(listTransactionsHandler.name, () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockRepository: Partial<TransactionsRepository>;
  let mockLogger: Partial<FastifyBaseLogger>;
  const mockTransactions = [
    {
      id: '1',
      companyId: '1',
      date: '2024-01-01',
      amount: 100,
      type: TransactionType.CREDIT,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      companyId: '2',
      date: '2024-01-02',
      amount: 200,
      type: TransactionType.DEBIT,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '3',
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

    mockRepository = {
      getDocumentsList: jest.fn(),
    };

    (TransactionsRepository.getInstance as jest.Mock).mockReturnValue(
      mockRepository,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return all transactions when no query parameters are provided', async () => {
    jest.spyOn(mockRepository, 'getDocumentsList').mockResolvedValue(mockTransactions);

    await listTransactionsHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_TRANSACTIONS.id);
    expect(mockRepository.getDocumentsList).toHaveBeenCalledWith(
      {},
      mockLogger,
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_TRANSACTIONS.id);
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
    jest.spyOn(mockRepository, 'getDocumentsList').mockResolvedValue(filteredTransactions);

    await listTransactionsHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_TRANSACTIONS.id);
    expect(mockRepository.getDocumentsList).toHaveBeenCalledWith(
      {
        amount: [{ operator: '==', value: 100 }],
        date: [{ operator: '>', value: '2024-01-01' }],
      },
      mockLogger,
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_TRANSACTIONS.id);
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.OK);
    expect(mockReply.send).toHaveBeenCalledWith(filteredTransactions);
  });

  it('should handle empty result set', async () => {
    jest.spyOn(mockRepository, 'getDocumentsList').mockResolvedValue([]);

    await listTransactionsHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_TRANSACTIONS.id);
    expect(mockRepository.getDocumentsList).toHaveBeenCalledWith(
      {},
      mockLogger,
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_TRANSACTIONS.id);
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.OK);
    expect(mockReply.send).toHaveBeenCalledWith([]);
  });

  it('should handle repository errors', async () => {
    const error = new Error('Repository error');
    jest.spyOn(mockRepository, 'getDocumentsList').mockRejectedValue(error);

    await expect(
      listTransactionsHandler(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      ),
    ).rejects.toThrow(error);

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_TRANSACTIONS.id);
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_TRANSACTIONS.id);
    expect(mockReply.code).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });
});
