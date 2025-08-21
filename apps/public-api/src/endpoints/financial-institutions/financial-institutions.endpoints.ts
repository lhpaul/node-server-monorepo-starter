import { createEndpoint, HTTP_METHODS_MAP } from '@repo/fastify';
import { FastifyInstance, RouteOptions } from 'fastify';

import { listFinancialInstitutionsHandler } from './handlers';
import {
  LIST_FINANCIAL_INSTITUTIONS_QUERY_JSON_SCHEMA,
  URL_V1,
} from './financial-institutions.endpoints.constants';

export function financialInstitutionsEndpointsBuilder(server: FastifyInstance): RouteOptions[] {
  return [
    createEndpoint(server, {
      method: [HTTP_METHODS_MAP.LIST],
      url: URL_V1,
      handler: listFinancialInstitutionsHandler,
      schema: {
        querystring: LIST_FINANCIAL_INSTITUTIONS_QUERY_JSON_SCHEMA,
      },
    }),
  ];
} 