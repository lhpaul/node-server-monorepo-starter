import { createEndpoint, HTTP_METHODS_MAP } from '@repo/fastify';
import { FastifyInstance } from 'fastify';
import {
  CREATE_SUBSCRIPTION_BODY_JSON_SCHEMA,
  SUBSCRIPTION_ENDPOINTS_PARAMS_JSON_SCHEMA,
  UPDATE_SUBSCRIPTION_BODY_JSON_SCHEMA,
  URL_V1,
  URL_WITH_ID_V1,
} from '../subscriptions.endpoints.constants';
import {
  createSubscriptionHandler,
  deleteSubscriptionHandler,
  getSubscriptionHandler,
  listSubscriptionsHandler,
  updateSubscriptionHandler,
} from '../handlers';
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
    expect(createEndpoint).toHaveBeenCalledTimes(5);
    expect(subscriptionsEndpoints).toHaveLength(5);
  });

  it('should create POST subscription endpoint with correct configuration', () => {
    expect(createEndpoint).toHaveBeenNthCalledWith(1, mockServer, {
      method: [HTTP_METHODS_MAP.CREATE],
      url: URL_V1,
      handler: createSubscriptionHandler,
      schema: {
        body: CREATE_SUBSCRIPTION_BODY_JSON_SCHEMA,
      },
    });
  });

  it('should create GET subscriptions list endpoint with correct configuration', () => {
    expect(createEndpoint).toHaveBeenNthCalledWith(2, mockServer, {
      method: [HTTP_METHODS_MAP.LIST],
      url: URL_V1,
      handler: listSubscriptionsHandler,
      schema: {
        querystring: {
          type: 'object',
          properties: {
            companyId: { type: 'string' },
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
    expect(createEndpoint).toHaveBeenNthCalledWith(3, mockServer, {
      method: [HTTP_METHODS_MAP.GET],
      url: URL_WITH_ID_V1,
      handler: getSubscriptionHandler,
      schema: {
        params: SUBSCRIPTION_ENDPOINTS_PARAMS_JSON_SCHEMA,
      },
    });
  });

  it('should create PATCH subscription endpoint with correct configuration', () => {
    expect(createEndpoint).toHaveBeenNthCalledWith(4, mockServer, {
      method: [HTTP_METHODS_MAP.UPDATE],
      url: URL_WITH_ID_V1,
      handler: updateSubscriptionHandler,
      schema: {
        body: UPDATE_SUBSCRIPTION_BODY_JSON_SCHEMA,
        params: SUBSCRIPTION_ENDPOINTS_PARAMS_JSON_SCHEMA,
      },
    });
  });

  it('should create DELETE subscription endpoint with correct configuration', () => {
    expect(createEndpoint).toHaveBeenNthCalledWith(5, mockServer, {
      method: [HTTP_METHODS_MAP.DELETE],
      url: URL_WITH_ID_V1,
      handler: deleteSubscriptionHandler,
      schema: {
        params: SUBSCRIPTION_ENDPOINTS_PARAMS_JSON_SCHEMA,
      },
    });
  });
}); 