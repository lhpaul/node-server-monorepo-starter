import {
  buildSchemaForQueryParamsProperty,
  createEndpoint,
  HTTP_METHODS_MAP,
} from '@repo/fastify';
import { TransactionType } from '@repo/shared/domain';
import { FastifyInstance, RouteOptions } from 'fastify';
import {
  CREATE_TRANSACTION_BODY_JSON_SCHEMA,
  TRANSACTION_ENDPOINTS_PARAMS_JSON_SCHEMA,
  UPDATE_TRANSACTION_BODY_JSON_SCHEMA,
  URL_V1,
  URL_WITH_ID_V1,
} from './transactions.endpoints.constants';
import {
  createTransactionHandler,
  deleteTransactionHandler,
  getTransactionHandler,
  listTransactionsHandler,
  updateTransactionHandler,
} from './handlers';

export const QUERY_STRING_JSON_SCHEMA = {
  type: 'object',
  properties: {
    ...buildSchemaForQueryParamsProperty('amount', 'number', [
      'eq',
      'ge',
      'gt',
      'le',
      'lt',
    ]),
    companyId: { type: 'string' },
    ...buildSchemaForQueryParamsProperty('date', 'string', [
      'eq',
      'ge',
      'gt',
      'le',
      'lt',
    ]),
    type: { enum: Object.values(TransactionType) },
  },
} as const;

export function transactionsEndpointsBuilder(server: FastifyInstance): RouteOptions[] {
  return [
    createEndpoint(server,{
      method: [HTTP_METHODS_MAP.CREATE],
      url: URL_V1,
      handler: createTransactionHandler,
      schema: {
        body: CREATE_TRANSACTION_BODY_JSON_SCHEMA,
      },
    }),
    createEndpoint(server,{
      method: [HTTP_METHODS_MAP.LIST],
      url: URL_V1,
      handler: listTransactionsHandler,
      schema: {
        querystring: QUERY_STRING_JSON_SCHEMA,
      },
    }),
    createEndpoint(server,{
      method: [HTTP_METHODS_MAP.GET],
      url: URL_WITH_ID_V1,
      handler: getTransactionHandler,
      schema: {
        params: TRANSACTION_ENDPOINTS_PARAMS_JSON_SCHEMA,
      },
    }),
    createEndpoint(server,{
      method: [HTTP_METHODS_MAP.UPDATE],
      url: URL_WITH_ID_V1,
      handler: updateTransactionHandler,
      schema: {
        body: UPDATE_TRANSACTION_BODY_JSON_SCHEMA,
        params: TRANSACTION_ENDPOINTS_PARAMS_JSON_SCHEMA,
      },
    }),
    createEndpoint(server,{
      method: [HTTP_METHODS_MAP.DELETE],
      url: URL_WITH_ID_V1,
      handler: deleteTransactionHandler,
      schema: {
        params: TRANSACTION_ENDPOINTS_PARAMS_JSON_SCHEMA,
      },
    }),
  ];
}
