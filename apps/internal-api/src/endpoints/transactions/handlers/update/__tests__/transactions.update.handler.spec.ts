import { STATUS_CODES } from '@repo/fastify';
import { TransactionsRepository } from '@repo/shared/repositories';
import { RepositoryError, RepositoryErrorCode } from '@repo/shared/utils';
import { FastifyBaseLogger, FastifyReply, FastifyRequest } from 'fastify';

import { ERROR_RESPONSES } from '../../../transactions.endpoints.constants';
import { STEPS } from '../transactions.update.constants';
import { updateTransactionHandler } from '../transactions.update.handler';

jest.mock('@repo/shared/repositories');
jest.mock('@repo/shared/utils', () => ({
  ...jest.requireActual('@repo/shared/utils'),
  RepositoryError: jest.fn(),
  RepositoryErrorCode: jest.fn(),
}));

describe(updateTransactionHandler.name, () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockRepository: Partial<TransactionsRepository>;
  let mockLogger: Partial<FastifyBaseLogger>;

  beforeEach(() => {
    mockLogger = {
      child: jest.fn().mockReturnThis(),
      startStep: jest.fn(),
      endStep: jest.fn(),
    };

    mockRequest = {
      log: mockLogger as FastifyBaseLogger,
      params: { id: '123' },
      body: {
        amount: 100,
        date: '2024-03-20',
        type: 'credit',
      },
    };

    mockReply = {
      code: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    mockRepository = {
      updateDocument: jest.fn(),
    };

    (TransactionsRepository.getInstance as jest.Mock).mockReturnValue(
      mockRepository,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully update a transaction', async () => {
    await updateTransactionHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.UPDATE_TRANSACTION.id);
    expect(mockRepository.updateDocument).toHaveBeenCalledWith(
      '123',
      mockRequest.body,
      mockLogger,
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(
      STEPS.UPDATE_TRANSACTION.id,
    );
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.NO_CONTENT);
    expect(mockReply.send).toHaveBeenCalled();
  });

  it('should handle transaction not found error', async () => {
    jest.spyOn(mockRepository, 'updateDocument').mockRejectedValue(
      new RepositoryError({
        code: RepositoryErrorCode.DOCUMENT_NOT_FOUND,
        message: 'Transaction not found',
      }),
    );

    await updateTransactionHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.UPDATE_TRANSACTION.id);
    expect(mockRepository.updateDocument).toHaveBeenCalledWith(
      '123',
      mockRequest.body,
      mockLogger,
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(
      STEPS.UPDATE_TRANSACTION.id,
    );
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.NOT_FOUND);
    expect(mockReply.send).toHaveBeenCalledWith(
      ERROR_RESPONSES.TRANSACTION_NOT_FOUND,
    );
  });

  it('should throw unexpected errors', async () => {
    const unexpectedError = new Error('Unexpected error');
    jest.spyOn(mockRepository, 'updateDocument').mockRejectedValue(unexpectedError);

    await expect(
      updateTransactionHandler(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      ),
    ).rejects.toThrow(unexpectedError);

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.UPDATE_TRANSACTION.id);
    expect(mockRepository.updateDocument).toHaveBeenCalledWith(
      '123',
      mockRequest.body,
      mockLogger,
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(
      STEPS.UPDATE_TRANSACTION.id,
    );
    expect(mockReply.code).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });
});
