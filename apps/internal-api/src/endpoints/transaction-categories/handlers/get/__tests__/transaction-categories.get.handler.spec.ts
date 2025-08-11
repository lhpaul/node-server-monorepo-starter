import { STATUS_CODES } from '@repo/fastify';
import { TransactionCategory, TransactionCategoryType, TransactionCategoriesService } from '@repo/shared/domain';
import { FastifyReply, FastifyRequest } from 'fastify';

import { STEPS } from '../transaction-categories.get.handler.constants';
import { GetTransactionCategoryParams } from '../transaction-categories.get.handler.interfaces';
import { getTransactionCategoryHandler } from '../transaction-categories.get.handler';
import { parseTransactionCategoryToResource } from '../../../transaction-categories.endpoint.utils';

// Mock dependencies
jest.mock('@repo/shared/domain', () => ({
  ...jest.requireActual('@repo/shared/domain'),
  TransactionCategoriesService: {
    getInstance: jest.fn(),
  },
}));

jest.mock('../../../transaction-categories.endpoint.utils', () => ({
  parseTransactionCategoryToResource: jest.fn(),
}));

describe(getTransactionCategoryHandler.name, () => {
  let mockRequest: FastifyRequest;
  let mockReply: FastifyReply;
  let mockService: jest.Mocked<TransactionCategoriesService>;
  let mockLogger: any;
  let mockParams: GetTransactionCategoryParams;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock logger
    mockLogger = {
      child: jest.fn().mockReturnThis(),
      startStep: jest.fn(),
      endStep: jest.fn(),
    };

    // Mock request
    mockRequest = {
      log: mockLogger,
      params: { id: 'test-id' },
    } as unknown as FastifyRequest;

    // Mock reply
    mockReply = {
      code: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    } as unknown as FastifyReply;

    // Mock service
    mockService = {
      getResource: jest.fn(),
    } as unknown as jest.Mocked<TransactionCategoriesService>;

    (TransactionCategoriesService.getInstance as jest.Mock).mockReturnValue(mockService);

    // Mock params
    mockParams = { id: 'test-id' };
  });

  it('should successfully get a transaction category and return it', async () => {
    // Arrange
    const mockTransactionCategory = new TransactionCategory({
      id: 'test-id',
      name: { en: 'Test Category', es: 'Categoría de Prueba' },
      type: TransactionCategoryType.EXPENSE,
      createdAt: new Date('2023-01-01T00:00:00Z'),
      updatedAt: new Date('2023-01-01T00:00:00Z'),
    });

    const mockResource = {
      id: 'test-id',
      name: { en: 'Test Category', es: 'Categoría de Prueba' },
      type: 'expense' as const,
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z',
    };

    mockService.getResource.mockResolvedValue(mockTransactionCategory);
    (parseTransactionCategoryToResource as jest.Mock).mockReturnValue(mockResource);

    // Act
    await getTransactionCategoryHandler(mockRequest, mockReply);

    // Assert
    expect(mockLogger.child).toHaveBeenCalledWith({ handler: getTransactionCategoryHandler.name });
    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_TRANSACTION_CATEGORY.id, getTransactionCategoryHandler.name);
    expect(mockService.getResource).toHaveBeenCalledWith(mockParams.id, mockLogger);
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_TRANSACTION_CATEGORY.id);
    expect(parseTransactionCategoryToResource).toHaveBeenCalledWith(mockTransactionCategory);
    expect(mockReply.send).toHaveBeenCalledWith(mockResource);
    expect(mockReply.code).not.toHaveBeenCalled();
  });

  it('should return 404 when transaction category is not found', async () => {
    // Arrange
    mockService.getResource.mockResolvedValue(null);

    // Act
    await getTransactionCategoryHandler(mockRequest, mockReply);

    // Assert
    expect(mockLogger.child).toHaveBeenCalledWith({ handler: getTransactionCategoryHandler.name });
    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_TRANSACTION_CATEGORY.id, getTransactionCategoryHandler.name);
    expect(mockService.getResource).toHaveBeenCalledWith(mockParams.id, mockLogger);
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_TRANSACTION_CATEGORY.id);
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.NOT_FOUND);
    expect(mockReply.send).toHaveBeenCalledWith({
      code: 'transaction-category-not-found',
      message: 'Transaction category not found',
    });
    expect(parseTransactionCategoryToResource).not.toHaveBeenCalled();
  });

  it('should handle service errors and still end the step', async () => {
    // Arrange
    const mockError = new Error('Service error');
    mockService.getResource.mockRejectedValue(mockError);

    // Act & Assert
    await expect(getTransactionCategoryHandler(mockRequest, mockReply)).rejects.toThrow('Service error');
    
    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_TRANSACTION_CATEGORY.id, getTransactionCategoryHandler.name);
    expect(mockService.getResource).toHaveBeenCalledWith(mockParams.id, mockLogger);
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_TRANSACTION_CATEGORY.id);
  });

  it('should use correct params from request', async () => {
    // Arrange
    const customParams = { id: 'custom-id' };
    mockRequest.params = customParams as GetTransactionCategoryParams;
    mockService.getResource.mockResolvedValue(null);

    // Act
    await getTransactionCategoryHandler(mockRequest, mockReply);

    // Assert
    expect(mockService.getResource).toHaveBeenCalledWith(customParams.id, mockLogger);
  });

  it('should create logger child with correct handler name', async () => {
    // Arrange
    mockService.getResource.mockResolvedValue(null);

    // Act
    await getTransactionCategoryHandler(mockRequest, mockReply);

    // Assert
    expect(mockLogger.child).toHaveBeenCalledWith({ handler: getTransactionCategoryHandler.name });
  });

  it('should call startStep and endStep with correct step ID', async () => {
    // Arrange
    mockService.getResource.mockResolvedValue(null);

    // Act
    await getTransactionCategoryHandler(mockRequest, mockReply);

    // Assert
    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_TRANSACTION_CATEGORY.id, getTransactionCategoryHandler.name);
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_TRANSACTION_CATEGORY.id);
  });
}); 