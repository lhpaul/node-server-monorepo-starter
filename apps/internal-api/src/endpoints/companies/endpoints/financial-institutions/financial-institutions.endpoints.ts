import {
  createEndpoint,
  HTTP_METHODS_MAP,
} from '@repo/fastify';
import { FastifyInstance, RouteOptions } from 'fastify';
import {
  COMPANY_FINANCIAL_INSTITUTIONS_ENDPOINTS_PARAMS_JSON_SCHEMA,
  SYNC_TRANSACTIONS_BODY_JSON_SCHEMA,
  SYNC_TRANSACTIONS_PARAMS_JSON_SCHEMA,
  URL_SYNC_TRANSACTIONS_V1,
  URL_V1,
} from './financial-institutions.endpoints.constants';
import { listCompanyFinancialInstitutionsHandler, syncTransactionsHandler } from './handlers';

export function financialInstitutionsEndpointsBuilder(server: FastifyInstance): RouteOptions[] {
  return [
    createEndpoint(server, {
      method: [HTTP_METHODS_MAP.LIST],
      url: URL_V1,
      handler: listCompanyFinancialInstitutionsHandler,
      schema: {
        params: COMPANY_FINANCIAL_INSTITUTIONS_ENDPOINTS_PARAMS_JSON_SCHEMA,
      },
    }),
    createEndpoint(server, {
      method: [HTTP_METHODS_MAP.CREATE],
      url: URL_SYNC_TRANSACTIONS_V1,
      handler: syncTransactionsHandler,
      schema: {
        body: SYNC_TRANSACTIONS_BODY_JSON_SCHEMA,
        params: SYNC_TRANSACTIONS_PARAMS_JSON_SCHEMA,
      },
    }),
  ];
} 