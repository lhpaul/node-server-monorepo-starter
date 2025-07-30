import { createEndpoint, HTTP_METHODS_MAP } from '@repo/fastify';
import { FastifyInstance } from 'fastify';
import {
  CREATE_TRANSACTION_CATEGORY_BODY_JSON_SCHEMA,
  TRANSACTION_CATEGORY_ENDPOINTS_PARAMS_JSON_SCHEMA,
  UPDATE_TRANSACTION_CATEGORY_BODY_JSON_SCHEMA,
  URL_V1,
  URL_WITH_ID_V1,
} from '../transaction-categories.endpoints.constants';
import {
  createTransactionCategoryHandler,
  deleteTransactionCategoryHandler,
  getTransactionCategoryHandler,
  listTransactionCategoriesHandler,
  updateTransactionCategoryHandler,
} from '../handlers';
import { transactionCategoriesEndpointsBuilder } from '../transaction-categories.endpoints';

jest.mock('@repo/fastify', () => ({
  ...jest.requireActual('@repo/fastify'),
  createEndpoint: jest.fn(),
}));

describe(transactionCategoriesEndpointsBuilder.name, () => {
  let transactionCategoriesEndpoints: ReturnType<typeof transactionCategoriesEndpointsBuilder>;
  let mockServer: FastifyInstance;
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockServer = {
      authenticate: jest.fn(),
    } as unknown as FastifyInstance;
    transactionCategoriesEndpoints = transactionCategoriesEndpointsBuilder(mockServer);
  });

  it('should create all endpoints with correct configuration', () => {
    expect(createEndpoint).toHaveBeenCalledTimes(5);
    expect(transactionCategoriesEndpoints).toHaveLength(5);
  });

  it('should create POST transaction category endpoint with correct configuration', () => {
    expect(createEndpoint).toHaveBeenNthCalledWith(1, mockServer, {
      method: [HTTP_METHODS_MAP.CREATE],
      url: URL_V1,
      handler: createTransactionCategoryHandler,
      schema: {
        body: CREATE_TRANSACTION_CATEGORY_BODY_JSON_SCHEMA,
      },
    });
  });

  it('should create GET transaction categories list endpoint with correct configuration', () => {
    expect(createEndpoint).toHaveBeenNthCalledWith(2, mockServer, {
      method: [HTTP_METHODS_MAP.LIST],
      url: URL_V1,
      handler: listTransactionCategoriesHandler,
      schema: {
        querystring: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            'name[ge]': { type: 'string' },
            'name[gt]': { type: 'string' },
            'name[le]': { type: 'string' },
            'name[lt]': { type: 'string' },
            type: { type: 'string' },
          },
        },
      },
    });
  });

  it('should create GET single transaction category endpoint with correct configuration', () => {
    expect(createEndpoint).toHaveBeenNthCalledWith(3, mockServer, {
      method: [HTTP_METHODS_MAP.GET],
      url: URL_WITH_ID_V1,
      handler: getTransactionCategoryHandler,
      schema: {
        params: TRANSACTION_CATEGORY_ENDPOINTS_PARAMS_JSON_SCHEMA,
      },
    });
  });

  it('should create PATCH transaction category endpoint with correct configuration', () => {
    expect(createEndpoint).toHaveBeenNthCalledWith(4, mockServer, {
      method: [HTTP_METHODS_MAP.UPDATE],
      url: URL_WITH_ID_V1,
      handler: updateTransactionCategoryHandler,
      schema: {
        body: UPDATE_TRANSACTION_CATEGORY_BODY_JSON_SCHEMA,
        params: TRANSACTION_CATEGORY_ENDPOINTS_PARAMS_JSON_SCHEMA,
      },
    });
  });

  it('should create DELETE transaction category endpoint with correct configuration', () => {
    expect(createEndpoint).toHaveBeenNthCalledWith(5, mockServer, {
      method: [HTTP_METHODS_MAP.DELETE],
      url: URL_WITH_ID_V1,
      handler: deleteTransactionCategoryHandler,
      schema: {
        params: TRANSACTION_CATEGORY_ENDPOINTS_PARAMS_JSON_SCHEMA,
      },
    });
  });
}); 