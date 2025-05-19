import { FastifyBaseLogger, FastifyReply, FastifyRequest } from 'fastify';
import { TransactionsRepository } from '@repo/shared/repositories';

import { ERROR_RESPONSES } from '../../../transactions.endpoints.constants';
import { STEPS } from '../transactions.get.constants';
import { getTransactionHandler } from '../transactions.get.handler';

jest.mock('@repo/shared/repositories', () => ({
  TransactionsRepository: {
    getInstance: jest.fn().mockImplementation(() => ({
      getTransactionById: jest.fn(),
    })),
  },
}));

describe(getTransactionHandler.name, () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockLogger: {
    startStep: jest.Mock;
    endStep: jest.Mock;
  } & Partial<FastifyBaseLogger>;
  let mockRepository: { getTransactionById: jest.Mock };

  const mockParams = { id: '123' };

  beforeEach(() => {
    mockLogger = {
      child: jest.fn().mockReturnThis(),
      startStep: jest.fn(),
      endStep: jest.fn(),
    };

    mockRequest = {
      log: mockLogger as FastifyBaseLogger,
      params: mockParams,
    };

    mockReply = {
      code: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    mockRepository = {
      getTransactionById: jest.fn(),
    };

    (TransactionsRepository.getInstance as jest.Mock).mockReturnValue(
      mockRepository,
    );
  });

  it('should successfully retrieve a transaction', async () => {
    const mockTransaction = {
      id: mockParams.id,
      amount: 100,
      date: '2024-01-01',
      type: 'credit',
    };

    mockRepository.getTransactionById.mockResolvedValue(mockTransaction);

    await getTransactionHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(
      STEPS.GET_TRANSACTION.id,
      STEPS.GET_TRANSACTION.obfuscatedId,
    );
    expect(mockRepository.getTransactionById).toHaveBeenCalledWith(
      mockParams.id,
      { logger: mockLogger },
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_TRANSACTION.id);
    expect(mockReply.code).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith(mockTransaction);
  });

  it('should handle transaction not found', async () => {
    mockRepository.getTransactionById.mockResolvedValue(null);

    await getTransactionHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(
      STEPS.GET_TRANSACTION.id,
      STEPS.GET_TRANSACTION.obfuscatedId,
    );
    expect(mockRepository.getTransactionById).toHaveBeenCalledWith(
      mockParams.id,
      { logger: mockLogger },
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_TRANSACTION.id);
    expect(mockReply.code).toHaveBeenCalledWith(404);
    expect(mockReply.send).toHaveBeenCalledWith(
      ERROR_RESPONSES.TRANSACTION_NOT_FOUND,
    );
  });

  it('should handle repository errors', async () => {
    const error = new Error('Repository error');
    mockRepository.getTransactionById.mockRejectedValue(error);

    await expect(
      getTransactionHandler(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      ),
    ).rejects.toThrow(error);

    expect(mockLogger.startStep).toHaveBeenCalledWith(
      STEPS.GET_TRANSACTION.id,
      STEPS.GET_TRANSACTION.obfuscatedId,
    );
    expect(mockRepository.getTransactionById).toHaveBeenCalledWith(
      mockParams.id,
      { logger: mockLogger },
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_TRANSACTION.id);
    expect(mockReply.code).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });
});
