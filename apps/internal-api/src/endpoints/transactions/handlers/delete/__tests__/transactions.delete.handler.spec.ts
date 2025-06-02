import { TransactionsRepository } from '@repo/shared/repositories';
import { FastifyReply, FastifyRequest } from 'fastify';

import { STEPS } from '../transactions.delete.constants';
import { deleteTransactionHandler } from '../transactions.delete.handler';

jest.mock('@repo/shared/repositories');

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
      deleteDocument: jest.fn(),
    } as any;

    (TransactionsRepository.getInstance as jest.Mock).mockReturnValue(
      mockRepository,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully delete a transaction', async () => {
    mockRepository.deleteDocument.mockResolvedValueOnce(undefined as never);

    await deleteTransactionHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(
      STEPS.DELETE_TRANSACTION.id,
      STEPS.DELETE_TRANSACTION.obfuscatedId,
    );
    expect(mockRepository.deleteDocument).toHaveBeenCalledWith(
      mockParams.id,
      mockLogger,
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(
      STEPS.DELETE_TRANSACTION.id,
    );
    expect(mockReply.code).toHaveBeenCalledWith(204);
    expect(mockReply.send).toHaveBeenCalled();
  });
});
