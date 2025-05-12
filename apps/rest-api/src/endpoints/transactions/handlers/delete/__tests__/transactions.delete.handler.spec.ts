import { FastifyReply, FastifyRequest } from 'fastify';
import {
  DeleteTransactionError,
  DeleteTransactionErrorCode,
  TransactionsRepository,
} from '@repo/shared/repositories';

import { BAD_REQUEST_ERROR_RESPONSES } from '../../../transactions.endpoints.constants';
import { STEPS } from '../transactions.delete.constants';
import { deleteTransactionHandler } from '../transactions.delete.handler';

jest.mock('@repo/shared/repositories', () => ({
  DeleteTransactionError: jest.requireActual('@repo/shared/repositories')
    .DeleteTransactionError,
  DeleteTransactionErrorCode: jest.requireActual('@repo/shared/repositories')
    .DeleteTransactionErrorCode,
  TransactionsRepository: {
    getInstance: jest.fn().mockReturnValue({
      deleteTransaction: jest.fn(),
    }),
  },
}));

describe(deleteTransactionHandler.name, () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockRepository: jest.Mocked<TransactionsRepository>;
  let mockLogger: any;

  const mockParams = { id: 'test-id' };

  beforeEach(() => {
    mockLogger = {
      child: jest.fn().mockReturnThis(),
      startStep: jest.fn(),
      endStep: jest.fn(),
    };

    mockRequest = {
      log: mockLogger,
      params: mockParams,
    };

    mockReply = {
      code: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    mockRepository = {
      deleteTransaction: jest.fn(),
    } as any;

    (TransactionsRepository.getInstance as jest.Mock).mockReturnValue(
      mockRepository,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully delete a transaction', async () => {
    mockRepository.deleteTransaction.mockResolvedValue();

    await deleteTransactionHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(
      STEPS.DELETE_TRANSACTION.id,
      STEPS.DELETE_TRANSACTION.obfuscatedId,
    );
    expect(mockRepository.deleteTransaction).toHaveBeenCalledWith(
      mockParams.id,
      { logger: mockLogger },
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(
      STEPS.DELETE_TRANSACTION.id,
    );
    expect(mockReply.code).toHaveBeenCalledWith(204);
    expect(mockReply.send).toHaveBeenCalled();
  });

  it('should handle non-existent transaction', async () => {
    mockRepository.deleteTransaction.mockRejectedValue(
      new DeleteTransactionError({
        code: DeleteTransactionErrorCode.DOCUMENT_NOT_FOUND,
        message: 'Transaction not found',
      }),
    );

    await deleteTransactionHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(
      STEPS.DELETE_TRANSACTION.id,
      STEPS.DELETE_TRANSACTION.obfuscatedId,
    );
    expect(mockRepository.deleteTransaction).toHaveBeenCalledWith(
      mockParams.id,
      { logger: mockLogger },
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(
      STEPS.DELETE_TRANSACTION.id,
    );
    expect(mockReply.code).toHaveBeenCalledWith(404);
    expect(mockReply.send).toHaveBeenCalledWith(
      BAD_REQUEST_ERROR_RESPONSES.TRANSACTION_NOT_FOUND,
    );
  });

  it('should rethrow non-DeleteTransactionError errors', async () => {
    const error = new Error('Unexpected error');
    mockRepository.deleteTransaction.mockRejectedValue(error);

    await expect(
      deleteTransactionHandler(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      ),
    ).rejects.toThrow(error);

    expect(mockLogger.startStep).toHaveBeenCalledWith(
      STEPS.DELETE_TRANSACTION.id,
      STEPS.DELETE_TRANSACTION.obfuscatedId,
    );
    expect(mockRepository.deleteTransaction).toHaveBeenCalledWith(
      mockParams.id,
      { logger: mockLogger },
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(
      STEPS.DELETE_TRANSACTION.id,
    );
    expect(mockReply.code).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });
});
