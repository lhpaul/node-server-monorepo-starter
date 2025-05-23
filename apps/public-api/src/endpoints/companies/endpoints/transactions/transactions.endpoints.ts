import {
  buildSchemaForQueryParamsProperty,
  createEndpoint,
} from '@repo/fastify';
import { TransactionType } from '@repo/shared/domain';
import { FastifyInstance, RouteOptions } from 'fastify';
import {
  CREATE_COMPANY_TRANSACTION_BODY_JSON_SCHEMA,
  COMPANY_TRANSACTION_ENDPOINTS_PARAMS_JSON_SCHEMA,
  UPDATE_COMPANY_TRANSACTION_BODY_JSON_SCHEMA,
  URL_V1,
  URL_WITH_ID_V1,
  COMPANY_TRANSACTIONS_ENDPOINTS_PARAMS_JSON_SCHEMA,
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
    createEndpoint(server, {
      method: ['POST'],
      url: URL_V1,
      handler: createTransactionHandler,
      schema: {
        body: CREATE_COMPANY_TRANSACTION_BODY_JSON_SCHEMA,
        params: COMPANY_TRANSACTIONS_ENDPOINTS_PARAMS_JSON_SCHEMA,
      },
    }),
    createEndpoint(server, {
      method: ['GET'],
      url: URL_V1,
      handler: listTransactionsHandler,
      schema: {
        querystring: QUERY_STRING_JSON_SCHEMA,
        params: COMPANY_TRANSACTIONS_ENDPOINTS_PARAMS_JSON_SCHEMA,
      },
    }),
    createEndpoint(server, {
      method: ['GET'],
      url: URL_WITH_ID_V1,
      handler: getTransactionHandler,
      schema: {
        params: COMPANY_TRANSACTION_ENDPOINTS_PARAMS_JSON_SCHEMA,
      },
    }),
    createEndpoint(server, {
      method: ['PATCH'],
      url: URL_WITH_ID_V1,
      handler: updateTransactionHandler,
      schema: {
        body: UPDATE_COMPANY_TRANSACTION_BODY_JSON_SCHEMA,
        params: COMPANY_TRANSACTION_ENDPOINTS_PARAMS_JSON_SCHEMA,
      },
    }),
    createEndpoint(server, {
      method: ['DELETE'],
      url: URL_WITH_ID_V1,
      handler: deleteTransactionHandler,
      schema: {
        params: COMPANY_TRANSACTION_ENDPOINTS_PARAMS_JSON_SCHEMA,
      },
    }),
  ];
}
