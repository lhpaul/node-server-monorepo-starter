import { ACCEPT_LANGUAGE_HEADER_NAME, STATUS_CODES, transformQueryParams } from '@repo/fastify';
import { TransactionCategoriesService } from '@repo/shared/services';
import { FastifyReply, FastifyRequest } from 'fastify';

import { STEPS } from '../transaction-categories.list.handler.constants';
import { ListTransactionCategoriesQuery } from '../transaction-categories.list.handler.interfaces';
import { listTransactionCategoriesHandler } from '../transaction-categories.list.handler';
import { parseTransactionCategoryToResponseResource } from '../../../transaction-categories.endpoint.utils';
import { TransactionCategory, TransactionCategoryType } from '@repo/shared/domain';
import { LanguageCode } from '@repo/shared/constants';
import { FilterInput } from '@repo/shared/definitions';

// Mock dependencies
jest.mock('@repo/fastify', () => ({
  ...jest.requireActual('@repo/fastify'),
  transformQueryParams: jest.fn(),
}));

jest.mock('@repo/shared/services', () => ({
  TransactionCategoriesService: {
    getInstance: jest.fn(),
  },
}));

jest.mock('../../../transaction-categories.endpoint.utils', () => ({
  parseTransactionCategoryToResponseResource: jest.fn(),
}));

describe(listTransactionCategoriesHandler.name, () => {
  let mockRequest: FastifyRequest;
  let mockReply: FastifyReply;
  let mockLogger: any;
  let mockService: any;
  let mockTransformQueryParams: jest.MockedFunction<typeof transformQueryParams>;
  let mockParseTransactionCategoryToResponseResource: jest.MockedFunction<typeof parseTransactionCategoryToResponseResource>;

  const mockTransactionCategories = [
    new TransactionCategory({
      id: 'category-1',
      name: {
        en: 'Food & Dining',
        es: 'Comida y Restaurantes',
      },
      type: TransactionCategoryType.EXPENSE,
      createdAt: new Date('2023-01-01T00:00:00Z'),
      updatedAt: new Date('2023-01-01T00:00:00Z'),
    }),
    new TransactionCategory({
      id: 'category-2',
      name: {
        en: 'Salary',
        es: 'Salario',
      },
      type: TransactionCategoryType.INCOME,
      createdAt: new Date('2023-01-02T00:00:00Z'),
      updatedAt: new Date('2023-01-02T00:00:00Z'),
    }),
  ];

  const mockTransformedCategories = [
    {
      id: 'category-1',
      name: 'Food & Dining',
      type: TransactionCategoryType.EXPENSE,
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z',
    },
    {
      id: 'category-2',
      name: 'Salary',
      type: TransactionCategoryType.INCOME,
      createdAt: '2023-01-02T00:00:00.000Z',
      updatedAt: '2023-01-02T00:00:00.000Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock logger
    mockLogger = {
      child: jest.fn().mockReturnThis(),
      startStep: jest.fn(),
      endStep: jest.fn(),
    };

    // Mock service
    mockService = {
      getResourcesList: jest.fn(),
    };

    // Mock request
    mockRequest = {
      log: mockLogger,
      query: {},
      headers: {},
    } as unknown as FastifyRequest;

    // Mock reply
    mockReply = {
      code: jest.fn().mockReturnThis(),
      send: jest.fn(),
    } as unknown as FastifyReply;

    // Setup mocks
    mockTransformQueryParams = transformQueryParams as jest.MockedFunction<typeof transformQueryParams>;
    mockParseTransactionCategoryToResponseResource = parseTransactionCategoryToResponseResource as jest.MockedFunction<typeof parseTransactionCategoryToResponseResource>;

    (TransactionCategoriesService.getInstance as jest.Mock).mockReturnValue(mockService);
    mockTransformQueryParams.mockReturnValue({} as FilterInput);
    mockService.getResourcesList.mockResolvedValue(mockTransactionCategories);
    mockParseTransactionCategoryToResponseResource
      .mockReturnValueOnce(mockTransformedCategories[0])
      .mockReturnValueOnce(mockTransformedCategories[1]);
  });

  it('should list transaction categories successfully', async () => {
    const query: ListTransactionCategoriesQuery = { type: 'expense' };
    mockRequest.query = query;
    mockRequest.headers[ACCEPT_LANGUAGE_HEADER_NAME] = 'en';

    await listTransactionCategoriesHandler(mockRequest, mockReply);

    // Verify logger setup
    expect(mockLogger.child).toHaveBeenCalledWith({ handler: listTransactionCategoriesHandler.name });

    // Verify step logging
    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.LIST_TRANSACTION_CATEGORIES.id, listTransactionCategoriesHandler.name);
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.LIST_TRANSACTION_CATEGORIES.id);

    // Verify service interaction
    expect(TransactionCategoriesService.getInstance).toHaveBeenCalled();
    expect(mockTransformQueryParams).toHaveBeenCalledWith(query);
    expect(mockService.getResourcesList).toHaveBeenCalledWith({}, mockLogger);

    // Verify response transformation
    expect(mockParseTransactionCategoryToResponseResource).toHaveBeenCalledTimes(2);
    expect(mockParseTransactionCategoryToResponseResource).toHaveBeenNthCalledWith(1, mockTransactionCategories[0], 'en');
    expect(mockParseTransactionCategoryToResponseResource).toHaveBeenNthCalledWith(2, mockTransactionCategories[1], 'en');

    // Verify response
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.OK);
    expect(mockReply.send).toHaveBeenCalledWith(mockTransformedCategories);
  });

  it('should handle empty result list', async () => {
    mockService.getResourcesList.mockResolvedValue([]);

    await listTransactionCategoriesHandler(mockRequest, mockReply);

    expect(mockParseTransactionCategoryToResponseResource).not.toHaveBeenCalled();
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.OK);
    expect(mockReply.send).toHaveBeenCalledWith([]);
  });

  it('should handle missing Accept-Language header', async () => {
    const query: ListTransactionCategoriesQuery = { type: 'income' };
    mockRequest.query = query;
    // No Accept-Language header set

    await listTransactionCategoriesHandler(mockRequest, mockReply);

    expect(mockParseTransactionCategoryToResponseResource).toHaveBeenCalledTimes(2);
    expect(mockParseTransactionCategoryToResponseResource).toHaveBeenNthCalledWith(1, mockTransactionCategories[0], undefined);
    expect(mockParseTransactionCategoryToResponseResource).toHaveBeenNthCalledWith(2, mockTransactionCategories[1], undefined);
  });

  it('should handle service error', async () => {
    const error = new Error('Service error');
    mockService.getResourcesList.mockRejectedValue(error);

    await expect(listTransactionCategoriesHandler(mockRequest, mockReply)).rejects.toThrow('Service error');

    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.LIST_TRANSACTION_CATEGORIES.id);
  });

  it('should handle different query parameters', async () => {
    const query: ListTransactionCategoriesQuery = { type: 'income' };
    mockRequest.query = query;
    mockTransformQueryParams.mockReturnValue({ type: [{ value: 'income', operator: '==' }] } as FilterInput);

    await listTransactionCategoriesHandler(mockRequest, mockReply);

    expect(mockTransformQueryParams).toHaveBeenCalledWith(query);
    expect(mockService.getResourcesList).toHaveBeenCalledWith({ type: [{ value: 'income', operator: '==' }] }, mockLogger);
  });

  it('should handle empty query parameters', async () => {
    const query: ListTransactionCategoriesQuery = {};
    mockRequest.query = query;

    await listTransactionCategoriesHandler(mockRequest, mockReply);

    expect(mockTransformQueryParams).toHaveBeenCalledWith(query);
    expect(mockService.getResourcesList).toHaveBeenCalledWith({}, mockLogger);
  });

  it('should handle different Accept-Language values', async () => {
    mockRequest.headers[ACCEPT_LANGUAGE_HEADER_NAME] = 'es';

    await listTransactionCategoriesHandler(mockRequest, mockReply);

    expect(mockParseTransactionCategoryToResponseResource).toHaveBeenCalledTimes(2);
    expect(mockParseTransactionCategoryToResponseResource).toHaveBeenNthCalledWith(1, mockTransactionCategories[0], 'es');
    expect(mockParseTransactionCategoryToResponseResource).toHaveBeenNthCalledWith(2, mockTransactionCategories[1], 'es');
  });
}); 