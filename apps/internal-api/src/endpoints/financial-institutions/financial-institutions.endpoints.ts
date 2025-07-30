import {
  buildSchemaForQueryParamsProperty,
  createEndpoint,
  HTTP_METHODS_MAP,
} from '@repo/fastify';
import { FastifyInstance, RouteOptions } from 'fastify';
import {
  CREATE_FINANCIAL_INSTITUTION_BODY_JSON_SCHEMA,
  FINANCIAL_INSTITUTION_ENDPOINTS_PARAMS_JSON_SCHEMA,
  UPDATE_FINANCIAL_INSTITUTION_BODY_JSON_SCHEMA,
  URL_V1,
  URL_WITH_ID_V1,
} from './financial-institutions.endpoints.constants';
import {
  createFinancialInstitutionHandler,
  deleteFinancialInstitutionHandler,
  getFinancialInstitutionHandler,
  listFinancialInstitutionsHandler,
  updateFinancialInstitutionHandler,
} from './handlers';

export const QUERY_STRING_JSON_SCHEMA = {
  type: 'object',
  properties: {
    ...buildSchemaForQueryParamsProperty('name', 'string', [
      'eq',
      'ge',
      'gt',
      'le',
      'lt',
    ]),
  },
} as const;

export function financialInstitutionsEndpointsBuilder(server: FastifyInstance): RouteOptions[] {
  return [
    createEndpoint(server, {
      method: [HTTP_METHODS_MAP.CREATE],
      url: URL_V1,
      handler: createFinancialInstitutionHandler,
      schema: {
        body: CREATE_FINANCIAL_INSTITUTION_BODY_JSON_SCHEMA,
      },
    }),
    createEndpoint(server, {
      method: [HTTP_METHODS_MAP.LIST],
      url: URL_V1,
      handler: listFinancialInstitutionsHandler,
      schema: {
        querystring: QUERY_STRING_JSON_SCHEMA,
      },
    }),
    createEndpoint(server, {
      method: [HTTP_METHODS_MAP.GET],
      url: URL_WITH_ID_V1,
      handler: getFinancialInstitutionHandler,
      schema: {
        params: FINANCIAL_INSTITUTION_ENDPOINTS_PARAMS_JSON_SCHEMA,
      },
    }),
    createEndpoint(server, {
      method: [HTTP_METHODS_MAP.UPDATE],
      url: URL_WITH_ID_V1,
      handler: updateFinancialInstitutionHandler,
      schema: {
        body: UPDATE_FINANCIAL_INSTITUTION_BODY_JSON_SCHEMA,
        params: FINANCIAL_INSTITUTION_ENDPOINTS_PARAMS_JSON_SCHEMA,
      },
    }),
    createEndpoint(server, {
      method: [HTTP_METHODS_MAP.DELETE],
      url: URL_WITH_ID_V1,
      handler: deleteFinancialInstitutionHandler,
      schema: {
        params: FINANCIAL_INSTITUTION_ENDPOINTS_PARAMS_JSON_SCHEMA,
      },
    }),
  ];
} 