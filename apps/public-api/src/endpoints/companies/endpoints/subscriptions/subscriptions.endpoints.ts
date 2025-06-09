import { buildSchemaForQueryParamsProperty, createEndpoint, HTTP_METHODS_MAP } from '@repo/fastify';
import { FastifyInstance, RouteOptions } from 'fastify';
import {
  COMPANY_SUBSCRIPTION_ENDPOINTS_PARAMS_JSON_SCHEMA,
  COMPANY_SUBSCRIPTIONS_ENDPOINTS_PARAMS_JSON_SCHEMA,
  URL_V1,
  URL_WITH_ID_V1,
} from './subscriptions.endpoints.constants';
import { getSubscriptionHandler } from './handlers/get/subscriptions.get.handler';
import { listSubscriptionsHandler } from './handlers/list/subscriptions.list.handler';

export const QUERY_STRING_JSON_SCHEMA = {
  type: 'object',
  properties: {
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
      method: [HTTP_METHODS_MAP.LIST],
      url: URL_V1,
      handler: listSubscriptionsHandler,
      schema: {
        params: COMPANY_SUBSCRIPTIONS_ENDPOINTS_PARAMS_JSON_SCHEMA,
        querystring: QUERY_STRING_JSON_SCHEMA,
      },
    }),
    createEndpoint(server, {
      method: [HTTP_METHODS_MAP.GET],
      url: URL_WITH_ID_V1,
      handler: getSubscriptionHandler,
      schema: {
        params: COMPANY_SUBSCRIPTION_ENDPOINTS_PARAMS_JSON_SCHEMA,
      },
    }),
  ];
} 