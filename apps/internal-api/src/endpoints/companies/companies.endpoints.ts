import {
  buildSchemaForQueryParamsProperty,
  createEndpoint,
  HTTP_METHODS_MAP,
} from '@repo/fastify';
import { FastifyInstance, RouteOptions } from 'fastify';
import {
  CREATE_COMPANY_BODY_JSON_SCHEMA,
  COMPANY_ENDPOINTS_PARAMS_JSON_SCHEMA,
  UPDATE_COMPANY_BODY_JSON_SCHEMA,
  URL_V1,
  URL_WITH_ID_V1,
} from './companies.endpoints.constants';
import {
  createCompanyHandler,
  deleteCompanyHandler,
  getCompanyHandler,
  listCompaniesHandler,
  updateCompanyHandler,
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

export function companiesEndpointsBuilder(server: FastifyInstance): RouteOptions[] {
  return [
    createEndpoint(server,{
      method: [HTTP_METHODS_MAP.CREATE],
      url: URL_V1,
      handler: createCompanyHandler,
      schema: {
        body: CREATE_COMPANY_BODY_JSON_SCHEMA,
      },
    }),
    createEndpoint(server, {
      method: [HTTP_METHODS_MAP.LIST],
      url: URL_V1,
      handler: listCompaniesHandler,
      schema: {
        querystring: QUERY_STRING_JSON_SCHEMA,
      },
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
    createEndpoint(server, {
      method: [HTTP_METHODS_MAP.DELETE],
      url: URL_WITH_ID_V1,
      handler: deleteCompanyHandler,
      schema: {
        params: COMPANY_ENDPOINTS_PARAMS_JSON_SCHEMA,
      },
    }),
  ];
}
