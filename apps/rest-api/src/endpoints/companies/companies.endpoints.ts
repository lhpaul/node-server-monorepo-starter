import {
  buildSchemaForQueryParamsProperty,
  createEndpoint,
} from '@repo/fastify';
import {
  CREATE_COMPANY_BODY_JSON_SCHEMA,
  COMPANY_ENDPOINTS_PARAMS_JSON_SCHEMA,
  UPDATE_COMPANY_BODY_JSON_SCHEMA,
  URL,
  URL_WITH_ID,
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

export function companiesEndpointsBuilder() {
  return [
    createEndpoint({
      method: ['POST'],
      url: URL,
      handler: createCompanyHandler,
      schema: {
        body: CREATE_COMPANY_BODY_JSON_SCHEMA,
      },
    }),
    createEndpoint({
      method: ['GET'],
      url: URL,
      handler: listCompaniesHandler,
      schema: {
        querystring: QUERY_STRING_JSON_SCHEMA,
      },
    }),
    createEndpoint({
      method: ['GET'],
      url: URL_WITH_ID,
      handler: getCompanyHandler,
      schema: {
        params: COMPANY_ENDPOINTS_PARAMS_JSON_SCHEMA,
      },
    }),
    createEndpoint({
      method: ['PATCH'],
      url: URL_WITH_ID,
      handler: updateCompanyHandler,
      schema: {
        body: UPDATE_COMPANY_BODY_JSON_SCHEMA,
        params: COMPANY_ENDPOINTS_PARAMS_JSON_SCHEMA,
      },
    }),
    createEndpoint({
      method: ['DELETE'],
      url: URL_WITH_ID,
      handler: deleteCompanyHandler,
      schema: {
        params: COMPANY_ENDPOINTS_PARAMS_JSON_SCHEMA,
      },
    }),
  ];
}
