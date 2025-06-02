import { STATUS_CODES } from '@repo/fastify';
import { TransactionsRepository } from '@repo/shared/repositories';
import { RepositoryError, RepositoryErrorCode } from '@repo/shared/utils';
import { FastifyReply, FastifyRequest } from 'fastify';

import { ERROR_RESPONSES, STEPS } from '../transactions.update.constants';
import { updateTransactionHandler } from '../transactions.update.handler';


jest.mock('@repo/shared/repositories', () => ({
  TransactionsRepository: {
    getInstance: jest.fn(),
  },
}));
// jest.mock('@repo/shared/utils', () => ({
//   RepositoryError: jest.requireActual('@repo/shared/utils').RepositoryError,
//   RepositoryErrorCode: jest.requireActual('@repo/shared/utils').RepositoryErrorCode,
// }));

describe(updateTransactionHandler.name, () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockRepository: { updateDocument: jest.Mock };
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
      updateDocument: jest.fn().mockImplementation(() => Promise.resolve()),
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
    mockRepository.updateDocument.mockRejectedValue(new RepositoryError({
      code: RepositoryErrorCode.DOCUMENT_NOT_FOUND,
      message: 'Document not found',
    }));

    await updateTransactionHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(
      STEPS.UPDATE_TRANSACTION.id,
      STEPS.UPDATE_TRANSACTION.obfuscatedId,
    );
    expect(mockRepository.updateDocument).toHaveBeenCalledWith(
      '123',
      mockRequest.body,
      mockLogger,
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(
      STEPS.UPDATE_TRANSACTION.id,
    );
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.NOT_FOUND);
    expect(mockReply.send).toHaveBeenCalledWith(ERROR_RESPONSES.TRANSACTION_NOT_FOUND);
  });

  it('should throw unexpected errors', async () => {
    const unexpectedError = new Error('Unexpected error');
    mockRepository.updateDocument.mockRejectedValue(unexpectedError);

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
