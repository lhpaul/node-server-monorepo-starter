import { STATUS_CODES } from '@repo/fastify';
import { TransactionType } from '@repo/shared/domain';
import { TransactionsService } from '@repo/shared/services';
import { FastifyBaseLogger, FastifyReply, FastifyRequest } from 'fastify';

import { ERROR_RESPONSES } from '../../../transactions.endpoints.constants';
import { STEPS } from '../transactions.get.handler.constants';
import { getTransactionHandler } from '../transactions.get.handler';

jest.mock('@repo/shared/services');

describe(getTransactionHandler.name, () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockLogger: {
    startStep: jest.Mock;
    endStep: jest.Mock;
  } & Partial<FastifyBaseLogger>;
  let mockService: Partial<TransactionsService>;

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

    mockService = {
      getResource: jest.fn(),
    };

    (TransactionsService.getInstance as jest.Mock).mockReturnValue(
      mockService,
    );
  });

  it('should successfully retrieve a transaction', async () => {
    const mockTransaction = {
      id: mockParams.id,
      amount: 100,
      date: '2024-01-01',
      type: TransactionType.CREDIT,
      companyId: '123',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    jest.spyOn(mockService, 'getResource').mockResolvedValue(mockTransaction);

    await getTransactionHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_TRANSACTION.id);
    expect(mockService.getResource).toHaveBeenCalledWith(
      mockParams.id,
      mockLogger,
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_TRANSACTION.id);
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.OK);
    expect(mockReply.send).toHaveBeenCalledWith(mockTransaction);
  });

  it('should handle transaction not found', async () => {
    jest.spyOn(mockService, 'getResource').mockResolvedValue(null);

    await getTransactionHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_TRANSACTION.id);
    expect(mockService.getResource).toHaveBeenCalledWith(
      mockParams.id,
      mockLogger,
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_TRANSACTION.id);
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.NOT_FOUND);
    expect(mockReply.send).toHaveBeenCalledWith(
      ERROR_RESPONSES.TRANSACTION_NOT_FOUND,
    );
  });

  it('should handle service errors', async () => {
    const error = new Error('Service error');
    jest.spyOn(mockService, 'getResource').mockRejectedValue(error);

    await expect(
      getTransactionHandler(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      ),
    ).rejects.toThrow(error);

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_TRANSACTION.id);
    expect(mockService.getResource).toHaveBeenCalledWith(
      mockParams.id,
      mockLogger,
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_TRANSACTION.id);
    expect(mockReply.code).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });
});
