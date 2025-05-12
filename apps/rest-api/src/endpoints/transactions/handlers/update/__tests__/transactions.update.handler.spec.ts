import { FastifyReply, FastifyRequest } from 'fastify';
import {
  TransactionsRepository,
  UpdateTransactionError,
  UpdateTransactionErrorCode,
} from '@repo/shared/repositories';

import { BAD_REQUEST_ERROR_RESPONSES } from '../../../transactions.endpoints.constants';
import { STEPS } from '../transactions.update.constants';
import { updateTransactionHandler } from '../transactions.update.handler';

jest.mock('@repo/shared/repositories', () => ({
  TransactionsRepository: {
    getInstance: jest.fn(),
  },
  UpdateTransactionError: jest.fn(),
  UpdateTransactionErrorCode: jest.requireActual('@repo/shared/repositories')
    .UpdateTransactionErrorCode,
}));

describe(updateTransactionHandler.name, () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockRepository: jest.Mocked<TransactionsRepository>;
  let mockLogger: any;

  beforeEach(() => {
    mockLogger = {
      child: jest.fn().mockReturnThis(),
      startStep: jest.fn(),
      endStep: jest.fn(),
    };

    mockRequest = {
      log: mockLogger,
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
      updateTransaction: jest.fn(),
    } as any;

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

    expect(mockLogger.startStep).toHaveBeenCalledWith(
      STEPS.UPDATE_TRANSACTION.id,
      STEPS.UPDATE_TRANSACTION.obfuscatedId,
    );
    expect(mockRepository.updateTransaction).toHaveBeenCalledWith(
      '123',
      mockRequest.body,
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(
      STEPS.UPDATE_TRANSACTION.id,
    );
    expect(mockReply.code).toHaveBeenCalledWith(204);
    expect(mockReply.send).toHaveBeenCalled();
  });

  it('should handle transaction not found error', async () => {
    mockRepository.updateTransaction.mockRejectedValue(
      new UpdateTransactionError({
        code: UpdateTransactionErrorCode.DOCUMENT_NOT_FOUND,
        message: 'Transaction not found',
      }),
    );

    await updateTransactionHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(
      STEPS.UPDATE_TRANSACTION.id,
      STEPS.UPDATE_TRANSACTION.obfuscatedId,
    );
    expect(mockRepository.updateTransaction).toHaveBeenCalledWith(
      '123',
      mockRequest.body,
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(
      STEPS.UPDATE_TRANSACTION.id,
    );
    expect(mockReply.code).toHaveBeenCalledWith(404);
    expect(mockReply.send).toHaveBeenCalledWith(
      BAD_REQUEST_ERROR_RESPONSES.TRANSACTION_NOT_FOUND,
    );
  });

  it('should throw unexpected errors', async () => {
    const unexpectedError = new Error('Unexpected error');
    mockRepository.updateTransaction.mockRejectedValue(unexpectedError);

    await expect(
      updateTransactionHandler(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      ),
    ).rejects.toThrow(unexpectedError);

    expect(mockLogger.startStep).toHaveBeenCalledWith(
      STEPS.UPDATE_TRANSACTION.id,
      STEPS.UPDATE_TRANSACTION.obfuscatedId,
    );
    expect(mockRepository.updateTransaction).toHaveBeenCalledWith(
      '123',
      mockRequest.body,
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(
      STEPS.UPDATE_TRANSACTION.id,
    );
    expect(mockReply.code).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });
});
