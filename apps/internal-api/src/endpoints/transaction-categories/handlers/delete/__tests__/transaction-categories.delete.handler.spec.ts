import { STATUS_CODES } from '@repo/fastify';
import { TransactionCategoriesService } from '@repo/shared/domain';
import { DomainModelServiceError, DomainModelServiceErrorCode } from '@repo/shared/utils';
import { FastifyBaseLogger, FastifyReply, FastifyRequest } from 'fastify';

import { ERROR_RESPONSES } from '../../../transaction-categories.endpoints.constants';
import { STEPS } from '../transaction-categories.delete.handler.constants';
import { deleteTransactionCategoryHandler } from '../transaction-categories.delete.handler';

jest.mock('@repo/shared/domain');
jest.mock('@repo/shared/utils', () => ({
  ...jest.requireActual('@repo/shared/utils'),
  DomainModelServiceError: jest.fn(),
  DomainModelServiceErrorCode: jest.fn(),
}));

describe(deleteTransactionCategoryHandler.name, () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockService: Partial<TransactionCategoriesService>;
  let mockLogger: Partial<FastifyBaseLogger>;

  const mockParams = { id: 'test-id' };
  const logGroup = deleteTransactionCategoryHandler.name;

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
      deleteResource: jest.fn(),
    };

    (TransactionCategoriesService.getInstance as jest.Mock).mockReturnValue(
      mockService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully delete a transaction category', async () => {
    jest.spyOn(mockService, 'deleteResource').mockResolvedValue();

    await deleteTransactionCategoryHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.DELETE_TRANSACTION_CATEGORY, logGroup);
    expect(mockService.deleteResource).toHaveBeenCalledWith(
      mockParams.id,
      mockLogger,
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(
      STEPS.DELETE_TRANSACTION_CATEGORY,
    );
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.NO_CONTENT);
    expect(mockReply.send).toHaveBeenCalled();
  });

  it('should handle non-existent transaction category', async () => {
    jest.spyOn(mockService, 'deleteResource').mockRejectedValue(
      new DomainModelServiceError({
        code: DomainModelServiceErrorCode.RESOURCE_NOT_FOUND,
        message: 'Transaction category not found',
      }),
    );

    await deleteTransactionCategoryHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.DELETE_TRANSACTION_CATEGORY, logGroup);
    expect(mockService.deleteResource).toHaveBeenCalledWith(
      mockParams.id,
      mockLogger,
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(
      STEPS.DELETE_TRANSACTION_CATEGORY,
    );
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.NOT_FOUND);
    expect(mockReply.send).toHaveBeenCalledWith(
      ERROR_RESPONSES.TRANSACTION_CATEGORY_NOT_FOUND,
    );
  });

  it('should rethrow non-DomainModelServiceError errors', async () => {
    const error = new Error('Unexpected error');
    jest.spyOn(mockService, 'deleteResource').mockRejectedValue(error);

    await expect(
      deleteTransactionCategoryHandler(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      ),
    ).rejects.toThrow(error);

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.DELETE_TRANSACTION_CATEGORY, logGroup);
    expect(mockService.deleteResource).toHaveBeenCalledWith(
      mockParams.id,
      mockLogger,
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(
      STEPS.DELETE_TRANSACTION_CATEGORY,
    );
    expect(mockReply.code).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });


}); 