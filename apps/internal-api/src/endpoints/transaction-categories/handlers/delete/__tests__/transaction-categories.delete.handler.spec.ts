import { TransactionCategoriesService } from '@repo/shared/services';
import { FastifyReply, FastifyRequest } from 'fastify';
import { deleteTransactionCategoryHandler } from '../transaction-categories.delete.handler';
import { DeleteTransactionCategoryParams } from '../transaction-categories.delete.handler.interfaces';

jest.mock('@repo/shared/services');

describe(deleteTransactionCategoryHandler.name, () => {
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
      params: {
        id: 'transaction-category-123',
      } as DeleteTransactionCategoryParams,
      log: mockLogger,
    } as any;

    mockReply = {
      send: jest.fn().mockReturnThis(),
    } as any;

    mockService = {
      deleteResource: jest.fn(),
    } as any;

    (TransactionCategoriesService.getInstance as jest.Mock).mockReturnValue(mockService);
  });

  it('should delete a transaction category successfully', async () => {
    mockService.deleteResource.mockResolvedValue(undefined);

    await deleteTransactionCategoryHandler(mockRequest, mockReply);

    expect(mockLogger.child).toHaveBeenCalledWith({ handler: deleteTransactionCategoryHandler.name });
    expect(mockLogger.startStep).toHaveBeenCalledWith('delete-transaction-category', deleteTransactionCategoryHandler.name);
    expect(mockService.deleteResource).toHaveBeenCalledWith('transaction-category-123', mockLogger);
    expect(mockLogger.endStep).toHaveBeenCalledWith('delete-transaction-category');
    expect(mockReply.send).toHaveBeenCalled();
  });

  it('should handle service errors properly', async () => {
    const error = new Error('Service error');
    mockService.deleteResource.mockRejectedValue(error);

    await expect(deleteTransactionCategoryHandler(mockRequest, mockReply)).rejects.toThrow('Service error');

    expect(mockLogger.startStep).toHaveBeenCalled();
    expect(mockLogger.endStep).toHaveBeenCalled();
  });

  it('should handle different category IDs', async () => {
    mockRequest.params = { id: 'different-category-id' } as DeleteTransactionCategoryParams;
    mockService.deleteResource.mockResolvedValue(undefined);

    await deleteTransactionCategoryHandler(mockRequest, mockReply);

    expect(mockService.deleteResource).toHaveBeenCalledWith('different-category-id', mockLogger);
  });

  it('should ensure logger.endStep is called even if service throws error', async () => {
    const error = new Error('Service error');
    mockService.deleteResource.mockRejectedValue(error);

    await expect(deleteTransactionCategoryHandler(mockRequest, mockReply)).rejects.toThrow('Service error');

    expect(mockLogger.endStep).toHaveBeenCalledWith('delete-transaction-category');
  });

  it('should handle resource not found errors from service', async () => {
    const error = new Error('Resource not found');
    mockService.deleteResource.mockRejectedValue(error);

    await expect(deleteTransactionCategoryHandler(mockRequest, mockReply)).rejects.toThrow('Resource not found');

    expect(mockService.deleteResource).toHaveBeenCalledWith('transaction-category-123', mockLogger);
  });

  it('should handle multiple delete operations', async () => {
    mockService.deleteResource.mockResolvedValue(undefined);

    // First delete
    await deleteTransactionCategoryHandler(mockRequest, mockReply);
    expect(mockService.deleteResource).toHaveBeenCalledWith('transaction-category-123', mockLogger);

    // Second delete with different ID
    mockRequest.params = { id: 'another-category-id' } as DeleteTransactionCategoryParams;
    await deleteTransactionCategoryHandler(mockRequest, mockReply);
    expect(mockService.deleteResource).toHaveBeenCalledWith('another-category-id', mockLogger);

    expect(mockService.deleteResource).toHaveBeenCalledTimes(2);
  });
}); 