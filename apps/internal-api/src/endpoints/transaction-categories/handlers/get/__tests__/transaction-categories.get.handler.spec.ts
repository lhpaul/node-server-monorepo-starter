import { STATUS_CODES } from '@repo/fastify';
import { TransactionCategoryType } from '@repo/shared/domain';
import { TransactionCategoriesService } from '@repo/shared/services';
import { FastifyBaseLogger, FastifyReply, FastifyRequest } from 'fastify';

import { ERROR_RESPONSES } from '../../../transaction-categories.endpoints.constants';
import { STEPS } from '../transaction-categories.get.handler.constants';
import { getTransactionCategoryHandler } from '../transaction-categories.get.handler';

jest.mock('@repo/shared/services');

describe(getTransactionCategoryHandler.name, () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockLogger: {
    startStep: jest.Mock;
    endStep: jest.Mock;
  } & Partial<FastifyBaseLogger>;
  let mockService: Partial<TransactionCategoriesService>;

  const mockParams = { id: 'transaction-category-123' };
  const logGroup = getTransactionCategoryHandler.name;

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

    (TransactionCategoriesService.getInstance as jest.Mock).mockReturnValue(mockService);
  });

  it('should successfully retrieve a transaction category', async () => {
    const mockCategory = {
      id: mockParams.id,
      name: 'Groceries',
      type: TransactionCategoryType.EXPENSE,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    jest.spyOn(mockService, 'getResource').mockResolvedValue(mockCategory);

    await getTransactionCategoryHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_TRANSACTION_CATEGORY.id, logGroup);
    expect(mockService.getResource).toHaveBeenCalledWith(mockParams.id, mockLogger);
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_TRANSACTION_CATEGORY.id);
    expect(mockReply.send).toHaveBeenCalledWith(mockCategory);
  });

  it('should handle transaction category not found', async () => {
    jest.spyOn(mockService, 'getResource').mockResolvedValue(null);

    await getTransactionCategoryHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_TRANSACTION_CATEGORY.id, logGroup);
    expect(mockService.getResource).toHaveBeenCalledWith(mockParams.id, mockLogger);
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_TRANSACTION_CATEGORY.id);
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.NOT_FOUND);
    expect(mockReply.send).toHaveBeenCalledWith(
      ERROR_RESPONSES.TRANSACTION_CATEGORY_NOT_FOUND,
    );
  });

  it('should handle service errors', async () => {
    const error = new Error('Service error');
    jest.spyOn(mockService, 'getResource').mockRejectedValue(error);

    await expect(
      getTransactionCategoryHandler(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      ),
    ).rejects.toThrow(error);

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_TRANSACTION_CATEGORY.id, logGroup);
    expect(mockService.getResource).toHaveBeenCalledWith(mockParams.id, mockLogger);
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_TRANSACTION_CATEGORY.id);
    expect(mockReply.code).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });
}); 