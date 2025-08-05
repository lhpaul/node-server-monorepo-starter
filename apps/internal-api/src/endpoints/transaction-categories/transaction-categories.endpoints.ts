import {
  buildSchemaForQueryParamsProperty,
  createEndpoint,
  HTTP_METHODS_MAP,
} from '@repo/fastify';
import { FastifyInstance, RouteOptions } from 'fastify';

import {
  CREATE_TRANSACTION_CATEGORY_BODY_JSON_SCHEMA,
  TRANSACTION_CATEGORY_ENDPOINTS_PARAMS_JSON_SCHEMA,
  UPDATE_TRANSACTION_CATEGORY_BODY_JSON_SCHEMA,
  URL_V1,
  URL_WITH_ID_V1,
} from './transaction-categories.endpoints.constants';
import {
  createTransactionCategoryHandler,
  deleteTransactionCategoryHandler,
  getTransactionCategoryHandler,
  listTransactionCategoriesHandler,
  updateTransactionCategoryHandler,
} from './handlers';

export const QUERY_STRING_JSON_SCHEMA = {
  type: 'object',
  properties: {
    // TODO: add name filtering
    ...buildSchemaForQueryParamsProperty('type', 'string', [
      'eq',
    ]),
  },
} as const;

export function transactionCategoriesEndpointsBuilder(server: FastifyInstance): RouteOptions[] {
  return [
    createEndpoint(server, {
      method: [HTTP_METHODS_MAP.CREATE],
      url: URL_V1,
      handler: createTransactionCategoryHandler,
      schema: {
        body: CREATE_TRANSACTION_CATEGORY_BODY_JSON_SCHEMA,
      },
    }),
    createEndpoint(server, {
      method: [HTTP_METHODS_MAP.LIST],
      url: URL_V1,
      handler: listTransactionCategoriesHandler,
      schema: {
        querystring: QUERY_STRING_JSON_SCHEMA,
      },
    }),
    createEndpoint(server, {
      method: [HTTP_METHODS_MAP.GET],
      url: URL_WITH_ID_V1,
      handler: getTransactionCategoryHandler,
      schema: {
        params: TRANSACTION_CATEGORY_ENDPOINTS_PARAMS_JSON_SCHEMA,
      },
    }),
    createEndpoint(server, {
      method: [HTTP_METHODS_MAP.UPDATE],
      url: URL_WITH_ID_V1,
      handler: updateTransactionCategoryHandler,
      schema: {
        body: UPDATE_TRANSACTION_CATEGORY_BODY_JSON_SCHEMA,
        params: TRANSACTION_CATEGORY_ENDPOINTS_PARAMS_JSON_SCHEMA,
      },
    }),
    createEndpoint(server, {
      method: [HTTP_METHODS_MAP.DELETE],
      url: URL_WITH_ID_V1,
      handler: deleteTransactionCategoryHandler,
      schema: {
        params: TRANSACTION_CATEGORY_ENDPOINTS_PARAMS_JSON_SCHEMA,
      },
    }),
  ];
} 