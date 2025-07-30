import { STATUS_CODES, transformQueryParams } from '@repo/fastify';
import { TransactionCategoryType } from '@repo/shared/domain';
import { TransactionCategoriesService } from '@repo/shared/services';
import { FastifyBaseLogger, FastifyReply, FastifyRequest } from 'fastify';

import { STEPS } from '../transaction-categories.list.handler.constants';
import { ListTransactionCategoriesQuery } from '../transaction-categories.list.handler.interfaces';
import { listTransactionCategoriesHandler } from '../transaction-categories.list.handler';

jest.mock('@repo/fastify', () => ({
  STATUS_CODES: {
    OK: 200,
  },
  transformQueryParams: jest.fn(),
}));

jest.mock('@repo/shared/services');

describe(listTransactionCategoriesHandler.name, () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockLogger: Partial<FastifyBaseLogger>;
  let mockService: Partial<TransactionCategoriesService>;
  let mockQuery: ListTransactionCategoriesQuery;
  const logGroup = listTransactionCategoriesHandler.name;

  beforeEach(() => {
    mockLogger = {
      child: jest.fn().mockReturnThis(),
      startStep: jest.fn(),
      endStep: jest.fn(),
      error: jest.fn(),
    };

    mockReply = {
      code: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    mockQuery = {};
    mockRequest = {
      log: mockLogger as FastifyBaseLogger,
      query: mockQuery,
    };

    mockService = {
      getResourcesList: jest.fn(),
    };

    (TransactionCategoriesService.getInstance as jest.Mock).mockReturnValue(mockService);
    (transformQueryParams as jest.Mock).mockReturnValue({ filter: {}, limit: 1000 });
  });

  it('should return list of all transaction categories', async () => {
    const mockCategories = [
      { 
        id: 'category-1', 
        name: 'Salary', 
        type: TransactionCategoryType.INCOME,
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { 
        id: 'category-2', 
        name: 'Food', 
        type: TransactionCategoryType.EXPENSE,
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
    ];

    jest.spyOn(mockService, 'getResourcesList').mockResolvedValue(mockCategories);

    await listTransactionCategoriesHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.LIST_TRANSACTION_CATEGORIES.id, logGroup);
    expect(transformQueryParams).toHaveBeenCalledWith(mockQuery);
    expect(mockService.getResourcesList).toHaveBeenCalledWith(
      { filter: {}, limit: 1000 },
      mockLogger
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.LIST_TRANSACTION_CATEGORIES.id);
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.OK);
    expect(mockReply.send).toHaveBeenCalledWith(mockCategories);
  });

  it('should handle filtering by income type', async () => {
    mockQuery = { type: 'income' };
    mockRequest.query = mockQuery;

    const mockIncomeCategories = [
      { 
        id: 'category-1', 
        name: 'Salary', 
        type: TransactionCategoryType.INCOME,
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
    ];

    (transformQueryParams as jest.Mock).mockReturnValue({ 
      filter: { type: [{ operator: 'eq', value: 'income' }] }, 
      limit: 1000 
    });

    jest.spyOn(mockService, 'getResourcesList').mockResolvedValue(mockIncomeCategories);

    await listTransactionCategoriesHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(transformQueryParams).toHaveBeenCalledWith(mockQuery);
    expect(mockService.getResourcesList).toHaveBeenCalledWith(
      { filter: { type: [{ operator: 'eq', value: 'income' }] }, limit: 1000 },
      mockLogger
    );
    expect(mockReply.send).toHaveBeenCalledWith(mockIncomeCategories);
  });

  it('should handle filtering by expense type', async () => {
    mockQuery = { type: 'expense' };
    mockRequest.query = mockQuery;

    const mockExpenseCategories = [
      { 
        id: 'category-2', 
        name: 'Food', 
        type: TransactionCategoryType.EXPENSE,
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
    ];

    (transformQueryParams as jest.Mock).mockReturnValue({ 
      filter: { type: [{ operator: 'eq', value: 'expense' }] }, 
      limit: 1000 
    });

    jest.spyOn(mockService, 'getResourcesList').mockResolvedValue(mockExpenseCategories);

    await listTransactionCategoriesHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(transformQueryParams).toHaveBeenCalledWith(mockQuery);
    expect(mockService.getResourcesList).toHaveBeenCalledWith(
      { filter: { type: [{ operator: 'eq', value: 'expense' }] }, limit: 1000 },
      mockLogger
    );
    expect(mockReply.send).toHaveBeenCalledWith(mockExpenseCategories);
  });

  it('should handle empty result set', async () => {
    jest.spyOn(mockService, 'getResourcesList').mockResolvedValue([]);

    await listTransactionCategoriesHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.LIST_TRANSACTION_CATEGORIES.id, logGroup);
    expect(mockService.getResourcesList).toHaveBeenCalled();
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.LIST_TRANSACTION_CATEGORIES.id);
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.OK);
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
    expect(mockService.getResourcesList).toHaveBeenCalled();
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.LIST_TRANSACTION_CATEGORIES.id);
    expect(mockReply.code).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });

  it('should create logger with correct context', async () => {
    jest.spyOn(mockService, 'getResourcesList').mockResolvedValue([]);

    await listTransactionCategoriesHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.child).toHaveBeenCalledWith({ 
      handler: listTransactionCategoriesHandler.name 
    });
  });
}); 