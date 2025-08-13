import { createEndpoint, HTTP_METHODS_MAP } from '@repo/fastify';
import { FastifyInstance, RouteOptions } from 'fastify';

import {
  LIST_TRANSACTION_CATEGORIES_QUERY_JSON_SCHEMA,
  URL_V1,
} from './transaction-categories.endpoints.constants';
import { listTransactionCategoriesHandler } from './handlers';

export function transactionCategoriesEndpointsBuilder(server: FastifyInstance): RouteOptions[] {
  return [
    createEndpoint(server, {
      method: [HTTP_METHODS_MAP.LIST],
      url: URL_V1,
      handler: listTransactionCategoriesHandler,
      schema: {
        querystring: LIST_TRANSACTION_CATEGORIES_QUERY_JSON_SCHEMA,
      },
    }),
  ];
} 