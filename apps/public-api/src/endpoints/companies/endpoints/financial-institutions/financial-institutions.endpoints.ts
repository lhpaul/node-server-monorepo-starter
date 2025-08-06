import { createEndpoint, HTTP_METHODS_MAP } from '@repo/fastify';
import { FastifyInstance, RouteOptions } from 'fastify';
import {
  COMPANY_FINANCIAL_INSTITUTION_ENDPOINTS_PARAMS_JSON_SCHEMA,
  COMPANY_FINANCIAL_INSTITUTIONS_ENDPOINTS_PARAMS_JSON_SCHEMA,
  COMPANY_FINANCIAL_INSTITUTION_SYNC_TRANSACTIONS_PARAMS_JSON_SCHEMA,
  CREATE_COMPANY_FINANCIAL_INSTITUTION_BODY_JSON_SCHEMA,
  CREDENTIALS_FIELDS_TO_MASK,
  SYNC_TRANSACTIONS_BODY_JSON_SCHEMA,
  UPDATE_COMPANY_FINANCIAL_INSTITUTION_BODY_JSON_SCHEMA,
  URL_V1,
  URL_SYNC_TRANSACTIONS_V1,
  URL_WITH_ID_V1,
} from './financial-institutions.endpoints.constants';
import {
  createFinancialInstitutionHandler,
  deleteFinancialInstitutionHandler,
  getFinancialInstitutionHandler,
  listFinancialInstitutionsHandler,
  syncTransactionsHandler,
  updateFinancialInstitutionHandler,
} from './handlers';

export function financialInstitutionsEndpointsBuilder(server: FastifyInstance): RouteOptions[] {
  return [
    createEndpoint(server, {
      method: [HTTP_METHODS_MAP.CREATE],
      url: URL_V1,
      handler: createFinancialInstitutionHandler,
      schema: {
        body: CREATE_COMPANY_FINANCIAL_INSTITUTION_BODY_JSON_SCHEMA,
        params: COMPANY_FINANCIAL_INSTITUTIONS_ENDPOINTS_PARAMS_JSON_SCHEMA,
      },
    }, {
      maskOptions: {
        requestPayloadFields: CREDENTIALS_FIELDS_TO_MASK,
      }
    }),
    createEndpoint(server, {
      method: [HTTP_METHODS_MAP.LIST],
      url: URL_V1,
      handler: listFinancialInstitutionsHandler,
      schema: {
        params: COMPANY_FINANCIAL_INSTITUTIONS_ENDPOINTS_PARAMS_JSON_SCHEMA,
      },
    }),
    createEndpoint(server, {
      method: [HTTP_METHODS_MAP.GET],
      url: URL_WITH_ID_V1,
      handler: getFinancialInstitutionHandler,
      schema: {
        params: COMPANY_FINANCIAL_INSTITUTION_ENDPOINTS_PARAMS_JSON_SCHEMA,
      },
    }),
    createEndpoint(server, {
      method: [HTTP_METHODS_MAP.UPDATE],
      url: URL_WITH_ID_V1,
      handler: updateFinancialInstitutionHandler,
      schema: {
        body: UPDATE_COMPANY_FINANCIAL_INSTITUTION_BODY_JSON_SCHEMA,
        params: COMPANY_FINANCIAL_INSTITUTION_ENDPOINTS_PARAMS_JSON_SCHEMA,
      },
    }, {
      maskOptions: {
        requestPayloadFields: CREDENTIALS_FIELDS_TO_MASK,
      }
    }),
    createEndpoint(server, {
      method: [HTTP_METHODS_MAP.DELETE],
      url: URL_WITH_ID_V1,
      handler: deleteFinancialInstitutionHandler,
      schema: {
        params: COMPANY_FINANCIAL_INSTITUTION_ENDPOINTS_PARAMS_JSON_SCHEMA,
      },
    }),
    createEndpoint(server, {
      method: [HTTP_METHODS_MAP.CREATE],
      url: URL_SYNC_TRANSACTIONS_V1,
      handler: syncTransactionsHandler,
      schema: {
        body: SYNC_TRANSACTIONS_BODY_JSON_SCHEMA,
        params: COMPANY_FINANCIAL_INSTITUTION_SYNC_TRANSACTIONS_PARAMS_JSON_SCHEMA,
      },
    }),
  ];
} 