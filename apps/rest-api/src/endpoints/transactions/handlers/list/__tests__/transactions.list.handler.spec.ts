import { FastifyReply, FastifyRequest } from 'fastify';
import { TransactionType } from '@repo/shared/domain';
import { TransactionsRepository } from '@repo/shared/repositories';

import { listTransactionsHandler } from '../transactions.list.handler';
import { STEPS } from '../transactions.list.constants';

jest.mock('@repo/shared/repositories', () => ({
  TransactionsRepository: {
    getInstance: jest.fn().mockImplementation(() => ({
      getTransactions: jest.fn(),
    })),
  },
}));

describe(listTransactionsHandler.name, () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockRepository: jest.Mocked<TransactionsRepository>;
  let mockLogger: any;
  const mockTransactions = [
    {
      id: '1',
      date: '2024-01-01',
      amount: 100,
      type: TransactionType.CREDIT,
    },
    {
      id: '2',
      date: '2024-01-02',
      amount: 200,
      type: TransactionType.DEBIT,
    },
    {
      id: '3',
      date: '2024-01-03',
      amount: 300,
      type: TransactionType.CREDIT,
    },
  ];

  beforeEach(() => {
    mockLogger = {
      child: jest.fn().mockReturnThis(),
      startStep: jest.fn(),
      endStep: jest.fn(),
    };

    mockRequest = {
      log: mockLogger,
      query: {},
    };

    mockReply = {
      code: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    mockRepository = {
      getTransactions: jest.fn(),
    } as any;

    (TransactionsRepository.getInstance as jest.Mock).mockReturnValue(
      mockRepository,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return all transactions when no query parameters are provided', async () => {
    mockRepository.getTransactions.mockResolvedValue(mockTransactions);

    await listTransactionsHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(
      STEPS.GET_TRANSACTIONS.id,
      STEPS.GET_TRANSACTIONS.obfuscatedId,
    );
    expect(mockRepository.getTransactions).toHaveBeenCalledWith(
      {},
      { logger: mockLogger },
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_TRANSACTIONS.id);
    expect(mockReply.code).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith(mockTransactions);
  });

  it('should filter transactions based on query parameters', async () => {
    const queryParams = {
      amount: 100,
      'date[gt]': '2024-01-01',
    };
    mockRequest.query = queryParams;
    const filteredTransactions = [mockTransactions[0]];
    mockRepository.getTransactions.mockResolvedValue(filteredTransactions);

    await listTransactionsHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(
      STEPS.GET_TRANSACTIONS.id,
      STEPS.GET_TRANSACTIONS.obfuscatedId,
    );
    expect(mockRepository.getTransactions).toHaveBeenCalledWith(
      {
        amount: [{ operator: '==', value: 100 }],
        date: [{ operator: '>', value: '2024-01-01' }],
      },
      { logger: mockLogger },
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_TRANSACTIONS.id);
    expect(mockReply.code).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith(filteredTransactions);
  });

  it('should handle empty result set', async () => {
    mockRepository.getTransactions.mockResolvedValue([]);

    await listTransactionsHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(
      STEPS.GET_TRANSACTIONS.id,
      STEPS.GET_TRANSACTIONS.obfuscatedId,
    );
    expect(mockRepository.getTransactions).toHaveBeenCalledWith(
      {},
      { logger: mockLogger },
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_TRANSACTIONS.id);
    expect(mockReply.code).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith([]);
  });

  it('should handle repository errors', async () => {
    const error = new Error('Repository error');
    mockRepository.getTransactions.mockRejectedValue(error);

    await expect(
      listTransactionsHandler(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      ),
    ).rejects.toThrow(error);

    expect(mockLogger.startStep).toHaveBeenCalledWith(
      STEPS.GET_TRANSACTIONS.id,
      STEPS.GET_TRANSACTIONS.obfuscatedId,
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_TRANSACTIONS.id);
    expect(mockReply.code).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });
});
