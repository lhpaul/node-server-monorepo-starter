import { STATUS_CODES, transformQueryParams } from '@repo/fastify';
import { TransactionCategory, TransactionCategoryType, TransactionCategoriesService } from '@repo/shared/domain';
import { FastifyBaseLogger, FastifyReply, FastifyRequest } from 'fastify';

import { STEPS } from '../transaction-categories.list.handler.constants';
import { ListTransactionCategoriesQuery } from '../transaction-categories.list.handler.interfaces';
import { listTransactionCategoriesHandler } from '../transaction-categories.list.handler';
import { parseTransactionCategoryToResource } from '../../../transaction-categories.endpoint.utils';

jest.mock('@repo/fastify', () => ({
  STATUS_CODES: {
    OK: 200,
  },
  transformQueryParams: jest.fn(),
}));

jest.mock('@repo/shared/domain', () => ({
  ...jest.requireActual('@repo/shared/domain'),
  TransactionCategoriesService: {
    getInstance: jest.fn(),
  },
}));

jest.mock('../../../transaction-categories.endpoint.utils', () => ({
  parseTransactionCategoryToResource: jest.fn(),
}));

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

    mockQuery = {
      limit: 10,
      offset: 0,
      type: 'income',
    };

    mockRequest = {
      log: mockLogger as FastifyBaseLogger,
      query: mockQuery,
    };

    mockService = {
      getResourcesList: jest.fn(),
    };

    (TransactionCategoriesService.getInstance as jest.Mock).mockReturnValue(
      mockService,
    );

    (transformQueryParams as jest.Mock).mockReturnValue({
      limit: 10,
      offset: 0,
      type: 'income',
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return list of transaction categories successfully', async () => {
    const mockTransactionCategories = [
      new TransactionCategory({
        id: 'category-1',
        name: { en: 'Salary', es: 'Salario' },
        type: TransactionCategoryType.INCOME,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
      }),
      new TransactionCategory({
        id: 'category-2',
        name: { en: 'Groceries', es: 'Comestibles' },
        type: TransactionCategoryType.EXPENSE,
        createdAt: new Date('2023-01-02'),
        updatedAt: new Date('2023-01-02'),
      }),
    ];

    const mockTransformedCategories = [
      {
        id: 'category-1',
        name: { en: 'Salary', es: 'Salario' },
        type: TransactionCategoryType.INCOME,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
      },
      {
        id: 'category-2',
        name: { en: 'Groceries', es: 'Comestibles' },
        type: TransactionCategoryType.EXPENSE,
        createdAt: '2023-01-02T00:00:00.000Z',
        updatedAt: '2023-01-02T00:00:00.000Z',
      },
    ];

    jest.spyOn(mockService, 'getResourcesList').mockResolvedValue(mockTransactionCategories);
    (parseTransactionCategoryToResource as jest.Mock).mockImplementation((transactionCategory) => mockTransformedCategories.find((category) => category.id === transactionCategory.id));

    await listTransactionCategoriesHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.child).toHaveBeenCalledWith({ handler: listTransactionCategoriesHandler.name });
    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.LIST_TRANSACTION_CATEGORIES.id, logGroup);
    expect(transformQueryParams).toHaveBeenCalledWith(mockQuery);
    expect(mockService.getResourcesList).toHaveBeenCalledWith(
      { limit: 10, offset: 0, type: 'income' },
      mockLogger,
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.LIST_TRANSACTION_CATEGORIES.id);
    expect(parseTransactionCategoryToResource).toHaveBeenCalledTimes(2);
    expect(parseTransactionCategoryToResource).toHaveBeenCalledWith(mockTransactionCategories[0]);
    expect(parseTransactionCategoryToResource).toHaveBeenCalledWith(mockTransactionCategories[1]);
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.OK);
    expect(mockReply.send).toHaveBeenCalledWith(mockTransformedCategories);
  });

  it('should handle empty result from service', async () => {
    jest.spyOn(mockService, 'getResourcesList').mockResolvedValue([]);

    await listTransactionCategoriesHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.LIST_TRANSACTION_CATEGORIES.id, logGroup);
    expect(mockService.getResourcesList).toHaveBeenCalledWith(
      { limit: 10, offset: 0, type: 'income' },
      mockLogger,
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.LIST_TRANSACTION_CATEGORIES.id);
    expect(parseTransactionCategoryToResource).not.toHaveBeenCalled();
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
    expect(mockService.getResourcesList).toHaveBeenCalledWith(
      { limit: 10, offset: 0, type: 'income' },
      mockLogger,
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.LIST_TRANSACTION_CATEGORIES.id);
    expect(mockReply.code).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });

  it('should handle different query parameters', async () => {
    const customQuery = {
      limit: 5,
      offset: 10,
      type: 'expense',
    };

    mockRequest.query = customQuery;
    (transformQueryParams as jest.Mock).mockReturnValue({
      limit: 5,
      offset: 10,
      type: 'expense',
    });

    const mockTransactionCategories = [
      new TransactionCategory({
        id: 'category-3',
        name: { en: 'Transportation', es: 'Transporte' },
        type: TransactionCategoryType.EXPENSE,
        createdAt: new Date('2023-01-03'),
        updatedAt: new Date('2023-01-03'),
      }),
    ];

    jest.spyOn(mockService, 'getResourcesList').mockResolvedValue(mockTransactionCategories);

    await listTransactionCategoriesHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(transformQueryParams).toHaveBeenCalledWith(customQuery);
    expect(mockService.getResourcesList).toHaveBeenCalledWith(
      { limit: 5, offset: 10, type: 'expense' },
      mockLogger,
    );
  });

  it('should ensure logger.endStep is called even when service throws error', async () => {
    const error = new Error('Service error');
    jest.spyOn(mockService, 'getResourcesList').mockRejectedValue(error);

    try {
      await listTransactionCategoriesHandler(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      );
    } catch (e) {
      // Expected to throw
    }

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.LIST_TRANSACTION_CATEGORIES.id, logGroup);
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.LIST_TRANSACTION_CATEGORIES.id);
  });

  it('should handle single transaction category result', async () => {
    const mockTransactionCategory = new TransactionCategory({
      id: 'category-1',
      name: { en: 'Salary', es: 'Salario' },
      type: TransactionCategoryType.INCOME,
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
    });

    const mockTransformedCategory = {
      id: 'category-1',
      name: { en: 'Salary', es: 'Salario' },
      type: TransactionCategoryType.INCOME,
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z',
    };

    jest.spyOn(mockService, 'getResourcesList').mockResolvedValue([mockTransactionCategory]);
    (parseTransactionCategoryToResource as jest.Mock).mockImplementation((_transactionCategory) => mockTransformedCategory);

    await listTransactionCategoriesHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockService.getResourcesList).toHaveBeenCalledWith(
      { limit: 10, offset: 0, type: TransactionCategoryType.INCOME },
      mockLogger,
    );
    expect(parseTransactionCategoryToResource).toHaveBeenCalledTimes(1);
    expect(parseTransactionCategoryToResource).toHaveBeenCalledWith(mockTransactionCategory);
    expect(mockReply.send).toHaveBeenCalledWith([mockTransformedCategory]);
  });
}); 