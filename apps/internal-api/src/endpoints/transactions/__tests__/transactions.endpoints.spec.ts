import { createEndpoint, HTTP_METHODS_MAP } from '@repo/fastify';
import { TransactionType } from '@repo/shared/domain';
import { FastifyInstance } from 'fastify';
import {
  CREATE_TRANSACTION_BODY_JSON_SCHEMA,
  TRANSACTION_ENDPOINTS_PARAMS_JSON_SCHEMA,
  UPDATE_TRANSACTION_BODY_JSON_SCHEMA,
  URL_V1,
  URL_WITH_ID_V1,
} from '../transactions.endpoints.constants';
import {
  createTransactionHandler,
  deleteTransactionHandler,
  getTransactionHandler,
  listTransactionsHandler,
  updateTransactionHandler,
} from '../handlers';
import { transactionsEndpointsBuilder } from '../transactions.endpoints';

jest.mock('@repo/fastify', () => ({
  ...jest.requireActual('@repo/fastify'),
  createEndpoint: jest.fn(),
}));

describe('transactionsEndpointsBuilder', () => {
  let transactionsEndpoints: ReturnType<typeof transactionsEndpointsBuilder>;
  let mockServer: FastifyInstance;
  beforeEach(() => {
    jest.clearAllMocks();
    mockServer = {
      authenticate: jest.fn(),
    } as unknown as FastifyInstance;
    transactionsEndpoints = transactionsEndpointsBuilder(mockServer);
  });

  it('should create all endpoints with correct configuration', () => {
    expect(createEndpoint).toHaveBeenCalledTimes(5);
    expect(transactionsEndpoints).toHaveLength(5);
  });

  it('should create POST transaction endpoint with correct configuration', () => {
    expect(createEndpoint).toHaveBeenNthCalledWith(1, mockServer, {
      method: [HTTP_METHODS_MAP.CREATE],
      url: URL_V1,
      handler: createTransactionHandler,
      schema: {
        body: CREATE_TRANSACTION_BODY_JSON_SCHEMA,
      },
    });
  });

  it('should create GET transactions list endpoint with correct configuration', () => {
    expect(createEndpoint).toHaveBeenNthCalledWith(2, mockServer, {
      method: [HTTP_METHODS_MAP.LIST],
      url: URL_V1,
      handler: listTransactionsHandler,
      schema: {
        querystring: {
          type: 'object',
          properties: {
            amount: { type: 'number' },
            'amount[ge]': { type: 'number' },
            'amount[gt]': { type: 'number' },
            'amount[le]': { type: 'number' },
            'amount[lt]': { type: 'number' },
            companyId: { type: 'string' },
            date: { type: 'string' },
            'date[ge]': { type: 'string' },
            'date[gt]': { type: 'string' },
            'date[le]': { type: 'string' },
            'date[lt]': { type: 'string' },
            type: { enum: Object.values(TransactionType) },
          },
        },
      },
    });
  });

  it('should create GET single transaction endpoint with correct configuration', () => {
    expect(createEndpoint).toHaveBeenNthCalledWith(3, mockServer, {
      method: [HTTP_METHODS_MAP.GET],
      url: URL_WITH_ID_V1,
      handler: getTransactionHandler,
      schema: {
        params: TRANSACTION_ENDPOINTS_PARAMS_JSON_SCHEMA,
      },
    });
  });

  it('should create PATCH transaction endpoint with correct configuration', () => {
    expect(createEndpoint).toHaveBeenNthCalledWith(4, mockServer, {
      method: [HTTP_METHODS_MAP.UPDATE],
      url: URL_WITH_ID_V1,
      handler: updateTransactionHandler,
      schema: {
        body: UPDATE_TRANSACTION_BODY_JSON_SCHEMA,
        params: TRANSACTION_ENDPOINTS_PARAMS_JSON_SCHEMA,
      },
    });
  });

  it('should create DELETE transaction endpoint with correct configuration', () => {
    expect(createEndpoint).toHaveBeenNthCalledWith(5, mockServer, {
      method: [HTTP_METHODS_MAP.DELETE],
      url: URL_WITH_ID_V1,
      handler: deleteTransactionHandler,
      schema: {
        params: TRANSACTION_ENDPOINTS_PARAMS_JSON_SCHEMA,
      },
    });
  });
});
