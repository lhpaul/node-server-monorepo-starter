import { createEndpoint, HTTP_METHODS_MAP } from '@repo/fastify';
import { FastifyInstance, RouteOptions } from 'fastify';
import {
  COMPANY_ENDPOINTS_PARAMS_JSON_SCHEMA,
  UPDATE_COMPANY_BODY_JSON_SCHEMA,
  URL_V1,
  URL_WITH_ID_V1,
} from './companies.endpoints.constants';
import { transactionsEndpointsBuilder } from './endpoints/transactions/transactions.endpoints';
import { subscriptionsEndpointsBuilder } from './endpoints/subscriptions/subscriptions.endpoints';
import {
  getCompanyHandler,
  updateCompanyHandler,
} from './handlers';
import { listCompaniesHandler } from './handlers/list/companies.list.handler';


export function companiesEndpointsBuilder(server: FastifyInstance): RouteOptions[] {
  return [
    createEndpoint(server, {
      method: [HTTP_METHODS_MAP.LIST],
      url: URL_V1,
      handler: listCompaniesHandler,
    }),
    createEndpoint(server, {
      method: [HTTP_METHODS_MAP.GET],
      url: URL_WITH_ID_V1,
      handler: getCompanyHandler,
      schema: {
        params: COMPANY_ENDPOINTS_PARAMS_JSON_SCHEMA,
      },
    }),
    createEndpoint(server, {
      method: [HTTP_METHODS_MAP.UPDATE],
      url: URL_WITH_ID_V1,
      handler: updateCompanyHandler,
      schema: {
        body: UPDATE_COMPANY_BODY_JSON_SCHEMA,
        params: COMPANY_ENDPOINTS_PARAMS_JSON_SCHEMA,
      },
    }),
    ...transactionsEndpointsBuilder(server),
    ...subscriptionsEndpointsBuilder(server),
  ];
}
