import {
  buildSchemaForQueryParamsProperty,
  createEndpoint,
} from '@repo/fastify';
import {
  CREATE_TRANSACTION_BODY_JSON_SCHEMA,
  TRANSACTION_ENDPOINTS_PARAMS_JSON_SCHEMA,
  UPDATE_TRANSACTION_BODY_JSON_SCHEMA,
  URL,
  URL_WITH_ID,
} from './transactions.endpoints.constants';
import {
  createTransactionHandler,
  deleteTransactionHandler,
  getTransactionHandler,
  listTransactionsHandler,
  updateTransactionHandler,
} from './handlers';
import { TransactionType } from '@repo/shared/domain';

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

export function transactionsEndpointsBuilder() {
  return [
    createEndpoint({
      method: ['POST'],
      url: URL,
      handler: createTransactionHandler,
      schema: {
        body: CREATE_TRANSACTION_BODY_JSON_SCHEMA,
      },
    }),
    createEndpoint({
      method: ['GET'],
      url: URL,
      handler: listTransactionsHandler,
      schema: {
        querystring: QUERY_STRING_JSON_SCHEMA,
      },
    }),
    createEndpoint({
      method: ['GET'],
      url: URL_WITH_ID,
      handler: getTransactionHandler,
      schema: {
        params: TRANSACTION_ENDPOINTS_PARAMS_JSON_SCHEMA,
      },
    }),
    createEndpoint({
      method: ['PATCH'],
      url: URL_WITH_ID,
      handler: updateTransactionHandler,
      schema: {
        body: UPDATE_TRANSACTION_BODY_JSON_SCHEMA,
        params: TRANSACTION_ENDPOINTS_PARAMS_JSON_SCHEMA,
      },
    }),
    createEndpoint({
      method: ['DELETE'],
      url: URL_WITH_ID,
      handler: deleteTransactionHandler,
      schema: {
        params: TRANSACTION_ENDPOINTS_PARAMS_JSON_SCHEMA,
      },
    }),
  ];
}
