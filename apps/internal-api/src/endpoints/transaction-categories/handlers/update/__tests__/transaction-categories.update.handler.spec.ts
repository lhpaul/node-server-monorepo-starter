import { TransactionCategoriesService } from '@repo/shared/domain';
import { FastifyReply, FastifyRequest } from 'fastify';

import { updateTransactionCategoryHandler } from '../transaction-categories.update.handler';
import { 
  UpdateTransactionCategoryBody, 
  UpdateTransactionCategoryParams 
} from '../transaction-categories.update.handler.interfaces';

jest.mock('@repo/shared/domain');

describe(updateTransactionCategoryHandler.name, () => {
  let mockRequest: jest.Mocked<FastifyRequest>;
  let mockReply: jest.Mocked<FastifyReply>;
  let mockService: jest.Mocked<TransactionCategoriesService>;
  let mockLogger: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockLogger = {
      child: jest.fn().mockReturnThis(),
      startStep: jest.fn(),
      endStep: jest.fn(),
    };

    mockRequest = {
      body: {
        name: { en: 'Updated Groceries' },
        type: 'expense',
      } as UpdateTransactionCategoryBody,
      params: {
        id: 'transaction-category-123',
      } as UpdateTransactionCategoryParams,
      log: mockLogger,
    } as any;

    mockReply = {
      send: jest.fn().mockReturnThis(),
    } as any;

    mockService = {
      updateResource: jest.fn(),
    } as any;

    (TransactionCategoriesService.getInstance as jest.Mock).mockReturnValue(mockService);
  });

  it('should update a transaction category successfully', async () => {
    mockService.updateResource.mockResolvedValue(undefined);

    await updateTransactionCategoryHandler(mockRequest, mockReply);

    expect(mockLogger.child).toHaveBeenCalledWith({ handler: updateTransactionCategoryHandler.name });
    expect(mockLogger.startStep).toHaveBeenCalledWith('update-transaction-category', updateTransactionCategoryHandler.name);
    expect(mockService.updateResource).toHaveBeenCalledWith(
      'transaction-category-123',
      { name: { en: 'Updated Groceries' }, type: 'expense' },
      mockLogger
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith('update-transaction-category');
    expect(mockReply.send).toHaveBeenCalled();
  });

  it('should handle partial updates', async () => {
    mockRequest.body = { name: { en: 'Only Name Update' } } as UpdateTransactionCategoryBody;
    mockService.updateResource.mockResolvedValue(undefined);

    await updateTransactionCategoryHandler(mockRequest, mockReply);

    expect(mockService.updateResource).toHaveBeenCalledWith(
      'transaction-category-123',
      { name: { en: 'Only Name Update' } },
      mockLogger
    );
  });

  it('should handle type-only updates', async () => {
    mockRequest.body = { type: 'income' } as UpdateTransactionCategoryBody;
    mockService.updateResource.mockResolvedValue(undefined);

    await updateTransactionCategoryHandler(mockRequest, mockReply);

    expect(mockService.updateResource).toHaveBeenCalledWith(
      'transaction-category-123',
      { type: 'income' },
      mockLogger
    );
  });

  it('should handle service errors properly', async () => {
    const error = new Error('Service error');
    mockService.updateResource.mockRejectedValue(error);

    await expect(updateTransactionCategoryHandler(mockRequest, mockReply)).rejects.toThrow('Service error');

    expect(mockLogger.startStep).toHaveBeenCalled();
    expect(mockLogger.endStep).toHaveBeenCalled();
  });

  it('should handle different category IDs', async () => {
    mockRequest.params = { id: 'different-category-id' } as UpdateTransactionCategoryParams;
    mockService.updateResource.mockResolvedValue(undefined);

    await updateTransactionCategoryHandler(mockRequest, mockReply);

    expect(mockService.updateResource).toHaveBeenCalledWith(
      'different-category-id',
      { name: { en: 'Updated Groceries' }, type: 'expense' },
      mockLogger
    );
  });

  it('should ensure logger.endStep is called even if service throws error', async () => {
    const error = new Error('Service error');
    mockService.updateResource.mockRejectedValue(error);

    await expect(updateTransactionCategoryHandler(mockRequest, mockReply)).rejects.toThrow('Service error');

    expect(mockLogger.endStep).toHaveBeenCalledWith('update-transaction-category');
  });

  it('should handle empty body updates', async () => {
    mockRequest.body = {} as UpdateTransactionCategoryBody;
    mockService.updateResource.mockResolvedValue(undefined);

    await updateTransactionCategoryHandler(mockRequest, mockReply);

    expect(mockService.updateResource).toHaveBeenCalledWith(
      'transaction-category-123',
      {},
      mockLogger
    );
  });
}); 