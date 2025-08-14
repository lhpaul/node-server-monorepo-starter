import { STATUS_CODES } from '@repo/fastify';
import { TransactionsService } from '@repo/shared/domain';
import { DomainModelServiceError, DomainModelServiceErrorCode } from '@repo/shared/utils';
import { FastifyBaseLogger, FastifyReply, FastifyRequest } from 'fastify';

import { ERROR_RESPONSES } from '../../../transactions.endpoints.constants';
import { STEPS } from '../transactions.update.handler.constants';
import { updateTransactionHandler } from '../transactions.update.handler';

jest.mock('@repo/shared/domain');

describe(updateTransactionHandler.name, () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockService: Partial<TransactionsService>;
  let mockLogger: Partial<FastifyBaseLogger>;
  let id = '123';
  const logGroup = updateTransactionHandler.name;

  beforeEach(() => {
    jest.clearAllMocks();
    mockLogger = {
      child: jest.fn().mockReturnThis(),
      startStep: jest.fn(),
      endStep: jest.fn(),
    };

    mockRequest = {
      log: mockLogger as FastifyBaseLogger,
      params: { id },
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

    mockService = {
      updateResource: jest.fn(),
    };

    (TransactionsService.getInstance as jest.Mock).mockReturnValue(
      mockService,
    );
  });

  it('should successfully update a transaction', async () => {
    jest.spyOn(mockService, 'updateResource').mockResolvedValueOnce(undefined);
    await updateTransactionHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.UPDATE_TRANSACTION, logGroup);
    expect(mockService.updateResource).toHaveBeenCalledWith(
      id,
      mockRequest.body,
      mockLogger,
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(
      STEPS.UPDATE_TRANSACTION,
    );
    expect(mockReply.code).toHaveBeenCalledWith(204);
    expect(mockReply.send).toHaveBeenCalled();
  });

  it('should handle transaction not found error', async () => {
    jest.spyOn(mockService, 'updateResource').mockRejectedValue(
      new DomainModelServiceError({
        code: DomainModelServiceErrorCode.RESOURCE_NOT_FOUND,
        message: 'Transaction not found',
      }),
    );

    await updateTransactionHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.UPDATE_TRANSACTION, logGroup);
    expect(mockService.updateResource).toHaveBeenCalledWith(
      id,
      mockRequest.body,
      mockLogger,
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(
      STEPS.UPDATE_TRANSACTION,
    );
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.NOT_FOUND);
    expect(mockReply.send).toHaveBeenCalledWith(
      ERROR_RESPONSES.TRANSACTION_NOT_FOUND,
    );
  });

  it('should handle invalid input error', async () => {
    const errorMessage = 'Invalid input';
    const errorData = {
      date: {
        code: 'INVALID_DATE_FORMAT',
        message: 'Invalid date format',
      },
    };
    jest.spyOn(mockService, 'updateResource').mockRejectedValueOnce(
      new DomainModelServiceError({
        code: DomainModelServiceErrorCode.INVALID_INPUT,
        message: errorMessage,
        data: errorData,
      }),
    );

    await updateTransactionHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.UPDATE_TRANSACTION, logGroup);
    expect(mockService.updateResource).toHaveBeenCalledWith(
      id,
      mockRequest.body,
      mockLogger,
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(
      STEPS.UPDATE_TRANSACTION,
    );
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.BAD_REQUEST);
    expect(mockReply.send).toHaveBeenCalledWith({
      code: DomainModelServiceErrorCode.INVALID_INPUT,
      message: errorMessage,
      data: errorData,
    });
  });

  it('should throw unexpected errors', async () => {
    const unexpectedError = new Error('Unexpected error');
    jest.spyOn(mockService, 'updateResource').mockRejectedValue(unexpectedError);

    await expect(
      updateTransactionHandler(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      ),
    ).rejects.toThrow(unexpectedError);

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.UPDATE_TRANSACTION, logGroup);
    expect(mockService.updateResource).toHaveBeenCalledWith(
      id,
      mockRequest.body,
      mockLogger,
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(
      STEPS.UPDATE_TRANSACTION,
    );
    expect(mockReply.code).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });
});
