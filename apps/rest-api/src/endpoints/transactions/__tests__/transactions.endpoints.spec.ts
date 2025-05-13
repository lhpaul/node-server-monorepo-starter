import { createEndpoint } from '@repo/fastify';
import {
  CREATE_TRANSACTION_BODY_JSON_SCHEMA,
  TRANSACTION_ENDPOINTS_PARAMS_JSON_SCHEMA,
  UPDATE_TRANSACTION_BODY_JSON_SCHEMA,
  URL,
  URL_WITH_ID,
} from '../transactions.endpoints.constants';
import {
  createTransactionHandler,
  deleteTransactionHandler,
  getTransactionHandler,
  listTransactionsHandler,
  updateTransactionHandler,
} from '../handlers';
import { transactionsEndpointsBuilder } from '../transactions.endpoints';
import { TransactionType } from '@repo/shared/domain';

jest.mock('@repo/fastify', () => ({
  createEndpoint: jest.fn(),
  buildSchemaForQueryParamsProperty:
    jest.requireActual('@repo/fastify').buildSchemaForQueryParamsProperty,
}));

describe('transactionsEndpointsBuilder', () => {
  let transactionsEndpoints: ReturnType<typeof transactionsEndpointsBuilder>;

  beforeEach(() => {
    jest.clearAllMocks();
    transactionsEndpoints = transactionsEndpointsBuilder();
  });

  it('should create all endpoints with correct configuration', () => {
    expect(createEndpoint).toHaveBeenCalledTimes(5);
    expect(transactionsEndpoints).toHaveLength(5);
  });

  it('should create POST transaction endpoint with correct configuration', () => {
    expect(createEndpoint).toHaveBeenNthCalledWith(1, {
      method: ['POST'],
      url: URL,
      handler: createTransactionHandler,
      schema: {
        body: CREATE_TRANSACTION_BODY_JSON_SCHEMA,
      },
    });
  });

  it('should create GET transactions list endpoint with correct configuration', () => {
    expect(createEndpoint).toHaveBeenNthCalledWith(2, {
      method: ['GET'],
      url: URL,
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
    expect(createEndpoint).toHaveBeenNthCalledWith(3, {
      method: ['GET'],
      url: URL_WITH_ID,
      handler: getTransactionHandler,
      schema: {
        params: TRANSACTION_ENDPOINTS_PARAMS_JSON_SCHEMA,
      },
    });
  });

  it('should create PATCH transaction endpoint with correct configuration', () => {
    expect(createEndpoint).toHaveBeenNthCalledWith(4, {
      method: ['PATCH'],
      url: URL_WITH_ID,
      handler: updateTransactionHandler,
      schema: {
        body: UPDATE_TRANSACTION_BODY_JSON_SCHEMA,
        params: TRANSACTION_ENDPOINTS_PARAMS_JSON_SCHEMA,
      },
    });
  });

  it('should create DELETE transaction endpoint with correct configuration', () => {
    expect(createEndpoint).toHaveBeenNthCalledWith(5, {
      method: ['DELETE'],
      url: URL_WITH_ID,
      handler: deleteTransactionHandler,
      schema: {
        params: TRANSACTION_ENDPOINTS_PARAMS_JSON_SCHEMA,
      },
    });
  });
});
