import {
  buildSchemaForQueryParamsProperty,
  createEndpoint,
  HTTP_METHODS_MAP,
} from '@repo/fastify';
import { FastifyInstance, RouteOptions } from 'fastify';
import {
  CREATE_SUBSCRIPTION_BODY_JSON_SCHEMA,
  SUBSCRIPTION_ENDPOINTS_PARAMS_JSON_SCHEMA,
  UPDATE_SUBSCRIPTION_BODY_JSON_SCHEMA,
  URL_V1,
  URL_WITH_ID_V1,
} from './subscriptions.endpoints.constants';
import {
  createSubscriptionHandler,
  deleteSubscriptionHandler,
  getSubscriptionHandler,
  listSubscriptionsHandler,
  updateSubscriptionHandler,
} from './handlers';

export const QUERY_STRING_JSON_SCHEMA = {
  type: 'object',
  properties: {
    companyId: { type: 'string' },
    ...buildSchemaForQueryParamsProperty('startsAt', 'string', [
      'eq',
      'ge',
      'gt',
      'le',
      'lt',
    ]),
    ...buildSchemaForQueryParamsProperty('endDate', 'string', [
      'eq',
      'ge',
      'gt',
      'le',
      'lt',
    ]),
  },
} as const;

export function subscriptionsEndpointsBuilder(server: FastifyInstance): RouteOptions[] {
  return [
    createEndpoint(server, {
      method: [HTTP_METHODS_MAP.CREATE],
      url: URL_V1,
      handler: createSubscriptionHandler,
      schema: {
        body: CREATE_SUBSCRIPTION_BODY_JSON_SCHEMA,
      },
    }),
    createEndpoint(server, {
      method: [HTTP_METHODS_MAP.LIST],
      url: URL_V1,
      handler: listSubscriptionsHandler,
      schema: {
        querystring: QUERY_STRING_JSON_SCHEMA,
      },
    }),
    createEndpoint(server, {
      method: [HTTP_METHODS_MAP.GET],
      url: URL_WITH_ID_V1,
      handler: getSubscriptionHandler,
      schema: {
        params: SUBSCRIPTION_ENDPOINTS_PARAMS_JSON_SCHEMA,
      },
    }),
    createEndpoint(server, {
      method: [HTTP_METHODS_MAP.UPDATE],
      url: URL_WITH_ID_V1,
      handler: updateSubscriptionHandler,
      schema: {
        body: UPDATE_SUBSCRIPTION_BODY_JSON_SCHEMA,
        params: SUBSCRIPTION_ENDPOINTS_PARAMS_JSON_SCHEMA,
      },
    }),
    createEndpoint(server, {
      method: [HTTP_METHODS_MAP.DELETE],
      url: URL_WITH_ID_V1,
      handler: deleteSubscriptionHandler,
      schema: {
        params: SUBSCRIPTION_ENDPOINTS_PARAMS_JSON_SCHEMA,
      },
    }),
  ];
} 