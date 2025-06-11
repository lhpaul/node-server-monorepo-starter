import { createEndpoint, HTTP_METHODS_MAP } from '@repo/fastify';
import { FastifyInstance } from 'fastify';
import {
  COMPANY_SUBSCRIPTION_ENDPOINTS_PARAMS_JSON_SCHEMA,
  COMPANY_SUBSCRIPTIONS_ENDPOINTS_PARAMS_JSON_SCHEMA,
  URL_V1,
  URL_WITH_ID_V1,
} from '../subscriptions.endpoints.constants';
import { getSubscriptionHandler } from '../handlers/get/subscriptions.get.handler';
import { listSubscriptionsHandler } from '../handlers/list/subscriptions.list.handler';
import { subscriptionsEndpointsBuilder } from '../subscriptions.endpoints';

jest.mock('@repo/fastify', () => ({
  ...jest.requireActual('@repo/fastify'),
  createEndpoint: jest.fn(),
}));

describe('subscriptionsEndpointsBuilder', () => {
  let subscriptionsEndpoints: ReturnType<typeof subscriptionsEndpointsBuilder>;
  let mockServer: FastifyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    mockServer = {
      authenticate: jest.fn(),
    } as unknown as FastifyInstance;
    subscriptionsEndpoints = subscriptionsEndpointsBuilder(mockServer);
  });

  it('should create all endpoints with correct configuration', () => {
    expect(createEndpoint).toHaveBeenCalledTimes(2);
    expect(subscriptionsEndpoints).toHaveLength(2);
  });

  it('should create GET subscriptions list endpoint with correct configuration', () => {
    expect(createEndpoint).toHaveBeenNthCalledWith(1, mockServer, {
      method: [HTTP_METHODS_MAP.LIST],
      url: URL_V1,
      handler: listSubscriptionsHandler,
      schema: {
        params: COMPANY_SUBSCRIPTIONS_ENDPOINTS_PARAMS_JSON_SCHEMA,
        querystring: {
          type: 'object',
          properties: {
            startsAt: { type: 'string' },
            'startsAt[ge]': { type: 'string' },
            'startsAt[gt]': { type: 'string' },
            'startsAt[le]': { type: 'string' },
            'startsAt[lt]': { type: 'string' },
            endDate: { type: 'string' },
            'endDate[ge]': { type: 'string' },
            'endDate[gt]': { type: 'string' },
            'endDate[le]': { type: 'string' },
            'endDate[lt]': { type: 'string' },
          },
        },
      },
    });
  });

  it('should create GET single subscription endpoint with correct configuration', () => {
    expect(createEndpoint).toHaveBeenNthCalledWith(2, mockServer, {
      method: [HTTP_METHODS_MAP.GET],
      url: URL_WITH_ID_V1,
      handler: getSubscriptionHandler,
      schema: {
        params: COMPANY_SUBSCRIPTION_ENDPOINTS_PARAMS_JSON_SCHEMA,
      },
    });
  });
}); 