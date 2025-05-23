import { createEndpoint } from '@repo/fastify';
import { TransactionType } from '@repo/shared/domain';
import { FastifyInstance } from 'fastify';
import {
  CREATE_COMPANY_TRANSACTION_BODY_JSON_SCHEMA,
  COMPANY_TRANSACTION_ENDPOINTS_PARAMS_JSON_SCHEMA,
  UPDATE_COMPANY_TRANSACTION_BODY_JSON_SCHEMA,
  URL_V1,
  URL_WITH_ID_V1,
  COMPANY_TRANSACTIONS_ENDPOINTS_PARAMS_JSON_SCHEMA,
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
  createEndpoint: jest.fn(),
  buildSchemaForQueryParamsProperty:
    jest.requireActual('@repo/fastify').buildSchemaForQueryParamsProperty,
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
      method: ['POST'],
      url: URL_V1,
      handler: createTransactionHandler,
      schema: {
        body: CREATE_COMPANY_TRANSACTION_BODY_JSON_SCHEMA,
        params: COMPANY_TRANSACTIONS_ENDPOINTS_PARAMS_JSON_SCHEMA,
      },
    });
  });

  it('should create GET transactions list endpoint with correct configuration', () => {
    expect(createEndpoint).toHaveBeenNthCalledWith(2, mockServer, {
      method: ['GET'],
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
        params: COMPANY_TRANSACTIONS_ENDPOINTS_PARAMS_JSON_SCHEMA,
      },
    });
  });

  it('should create GET single transaction endpoint with correct configuration', () => {
    expect(createEndpoint).toHaveBeenNthCalledWith(3, mockServer, {
      method: ['GET'],
      url: URL_WITH_ID_V1,
      handler: getTransactionHandler,
      schema: {
        params: COMPANY_TRANSACTION_ENDPOINTS_PARAMS_JSON_SCHEMA,
      },
    });
  });

  it('should create PATCH transaction endpoint with correct configuration', () => {
    expect(createEndpoint).toHaveBeenNthCalledWith(4, mockServer, {
      method: ['PATCH'],
      url: URL_WITH_ID_V1,
      handler: updateTransactionHandler,
      schema: {
        body: UPDATE_COMPANY_TRANSACTION_BODY_JSON_SCHEMA,
        params: COMPANY_TRANSACTION_ENDPOINTS_PARAMS_JSON_SCHEMA,
      },
    });
  });

  it('should create DELETE transaction endpoint with correct configuration', () => {
    expect(createEndpoint).toHaveBeenNthCalledWith(5, mockServer, {
      method: ['DELETE'],
      url: URL_WITH_ID_V1,
      handler: deleteTransactionHandler,
      schema: {
        params: COMPANY_TRANSACTION_ENDPOINTS_PARAMS_JSON_SCHEMA,
      },
    });
  });
});
