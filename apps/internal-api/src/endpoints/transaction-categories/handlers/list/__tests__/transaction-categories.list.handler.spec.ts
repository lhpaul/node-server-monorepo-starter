import { STATUS_CODES } from '@repo/fastify';
import { TransactionCategory, TransactionCategoryType } from '@repo/shared/domain';
import { TransactionCategoriesService } from '@repo/shared/services';
import { FastifyReply, FastifyRequest } from 'fastify';

import { listTransactionCategoriesHandler } from '../transaction-categories.list.handler';
import { STEPS } from '../transaction-categories.list.handler.constants';

jest.mock('@repo/shared/services');

describe(listTransactionCategoriesHandler.name, () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockService: Partial<TransactionCategoriesService>;
  let mockLogger: any;
  const mockCategories = [
    { id: '1', name: 'Groceries', type: TransactionCategoryType.EXPENSE, createdAt: new Date(), updatedAt: new Date() },
    { id: '2', name: 'Salary', type: TransactionCategoryType.INCOME, createdAt: new Date(), updatedAt: new Date() },
  ];
  const logGroup = listTransactionCategoriesHandler.name;

  beforeEach(() => {
    jest.clearAllMocks();

    mockLogger = {
      child: jest.fn().mockReturnThis(),
      startStep: jest.fn(),
      endStep: jest.fn(),
    };

    mockRequest = {
      log: mockLogger,
      query: {},
    };

    mockReply = {
      code: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    mockService = {
      getResourcesList: jest.fn(),
    };

    (TransactionCategoriesService.getInstance as jest.Mock).mockReturnValue(mockService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return all transaction categories when no query parameters are provided', async () => {
    jest.spyOn(mockService, 'getResourcesList').mockResolvedValue(mockCategories);

    await listTransactionCategoriesHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.LIST_TRANSACTION_CATEGORIES.id, logGroup);
    expect(mockService.getResourcesList).toHaveBeenCalledWith(
      {},
      mockLogger,
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.LIST_TRANSACTION_CATEGORIES.id);
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.OK);
    expect(mockReply.send).toHaveBeenCalledWith(mockCategories);
  });

  it('should filter transaction categories based on query parameters', async () => {
    const queryParams = {
      name: 'Groceries',
      type: 'expense',
    };
    mockRequest.query = queryParams;
    const filteredCategories = [mockCategories[0]];
    jest.spyOn(mockService, 'getResourcesList').mockResolvedValue(filteredCategories);

    await listTransactionCategoriesHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.LIST_TRANSACTION_CATEGORIES.id, logGroup);
    expect(mockService.getResourcesList).toHaveBeenCalledWith(
      {
        name: [{ operator: '==', value: 'Groceries' }],
        type: [{ operator: '==', value: 'expense' }],
      },
      mockLogger,
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.LIST_TRANSACTION_CATEGORIES.id);
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.OK);
    expect(mockReply.send).toHaveBeenCalledWith(filteredCategories);
  });

  it('should handle empty result set', async () => {
    jest.spyOn(mockService, 'getResourcesList').mockResolvedValue([]);

    await listTransactionCategoriesHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.LIST_TRANSACTION_CATEGORIES.id, logGroup);
    expect(mockService.getResourcesList).toHaveBeenCalledWith(
      {},
      mockLogger,
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.LIST_TRANSACTION_CATEGORIES.id);
    expect(mockReply.code).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith([]);
  });

  it('should handle service errors', async () => {
    const error = new Error('Service error');
    jest.spyOn(mockService, 'getResourcesList').mockRejectedValue(error);

    await expect(
      listTransactionCategoriesHandler(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      ),
    ).rejects.toThrow(error);

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.LIST_TRANSACTION_CATEGORIES.id, logGroup);
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.LIST_TRANSACTION_CATEGORIES.id);
    expect(mockReply.code).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });
}); 