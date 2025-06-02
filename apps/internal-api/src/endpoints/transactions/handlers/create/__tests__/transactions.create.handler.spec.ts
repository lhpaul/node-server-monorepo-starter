import { STATUS_CODES } from '@repo/fastify';
import { TransactionType } from '@repo/shared/domain';
import { TransactionsRepository } from '@repo/shared/repositories';
import { RepositoryError, RepositoryErrorCode } from '@repo/shared/utils';
import { FastifyReply, FastifyRequest } from 'fastify';

import { createTransactionHandler } from '../transactions.create.handler';
import { ERROR_RESPONSES, STEPS } from '../transactions.create.constants';

jest.mock('@repo/shared/repositories');

describe(createTransactionHandler.name, () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockLogger: any;
  let mockRepository: jest.Mocked<TransactionsRepository>;

  beforeEach(() => {
    mockLogger = {
      child: jest.fn().mockReturnThis(),
      startStep: jest.fn(),
      endStep: jest.fn(),
    };

    mockRequest = {
      log: mockLogger,
      body: {
        amount: 100,
        date: '2024-03-20',
        type: TransactionType.CREDIT,
      },
    };

    mockReply = {
      code: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    mockRepository = {
      createDocument: jest.fn(),
    } as any;

    (TransactionsRepository.getInstance as jest.Mock).mockReturnValue(
      mockRepository,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a transaction successfully', async () => {
    const mockTransactionId = '123';
    mockRepository.createDocument.mockResolvedValue(mockTransactionId);

    await createTransactionHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.child).toHaveBeenCalledWith({
      handler: createTransactionHandler.name,
    });
    expect(mockLogger.startStep).toHaveBeenCalledWith(
      STEPS.CREATE_TRANSACTION.id,
      STEPS.CREATE_TRANSACTION.obfuscatedId,
    );
    expect(mockRepository.createDocument).toHaveBeenCalledWith(
      mockRequest.body,
      mockLogger,
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(
      STEPS.CREATE_TRANSACTION.id,
    );
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.CREATED);
    expect(mockReply.send).toHaveBeenCalledWith({ id: mockTransactionId });
  });

  it('should handle repository known errors', async () => {
    const mockError = new RepositoryError({
      code: RepositoryErrorCode.RELATED_DOCUMENT_NOT_FOUND,
      message: 'Related document not found',
    });
    mockRepository.createDocument.mockRejectedValue(mockError);

    await createTransactionHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.BAD_REQUEST);
    expect(mockReply.send).toHaveBeenCalledWith(ERROR_RESPONSES.COMPANY_NOT_FOUND);
  });

  it('should handle repository unknown errors', async () => {
    const mockError = new Error('Repository error');
    mockRepository.createDocument.mockRejectedValue(mockError);

    await expect(
      createTransactionHandler(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      ),
    ).rejects.toThrow(mockError);

    expect(mockLogger.startStep).toHaveBeenCalledWith(
      STEPS.CREATE_TRANSACTION.id,
      STEPS.CREATE_TRANSACTION.obfuscatedId,
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(
      STEPS.CREATE_TRANSACTION.id,
    );
    expect(mockReply.code).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });
});
