import { FastifyInstance } from 'fastify';
import { createEndpoint, HTTP_METHODS_MAP } from '@repo/fastify';

import {
  LIST_TRANSACTION_CATEGORIES_QUERY_JSON_SCHEMA,
  URL_V1,
} from '../transaction-categories.endpoints.constants';
import { transactionCategoriesEndpointsBuilder } from '../transaction-categories.endpoints';
import { listTransactionCategoriesHandler } from '../handlers';

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
    expect(createEndpoint).toHaveBeenCalledTimes(1);
    expect(transactionCategoriesEndpoints).toHaveLength(1);
  });

  it('should create LIST transaction categories endpoint with correct configuration', () => {
    expect(createEndpoint).toHaveBeenCalledWith(mockServer, {
      method: [HTTP_METHODS_MAP.LIST],
      url: URL_V1,
      handler: listTransactionCategoriesHandler,
      schema: {
        querystring: LIST_TRANSACTION_CATEGORIES_QUERY_JSON_SCHEMA,
      },
    });
  });
}); 