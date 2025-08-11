import { createEndpoint, HTTP_METHODS_MAP } from '@repo/fastify';
import { FastifyInstance } from 'fastify';

import { financialInstitutionsEndpointsBuilder } from '../financial-institutions.endpoints';
import {
  COMPANY_FINANCIAL_INSTITUTIONS_ENDPOINTS_PARAMS_JSON_SCHEMA,
  SYNC_TRANSACTIONS_BODY_JSON_SCHEMA,
  SYNC_TRANSACTIONS_PARAMS_JSON_SCHEMA,
  URL_SYNC_TRANSACTIONS_V1,
  URL_V1,
} from '../financial-institutions.endpoints.constants';
import {
  listCompanyFinancialInstitutionsHandler,
  syncTransactionsHandler,
} from '../handlers';

jest.mock('@repo/fastify', () => ({
  ...jest.requireActual('@repo/fastify'),
  createEndpoint: jest.fn(),
}));

describe(financialInstitutionsEndpointsBuilder.name, () => {
  let financialInstitutionsEndpoints: ReturnType<typeof financialInstitutionsEndpointsBuilder>;
  let mockServer: FastifyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    mockServer = {
      authenticate: jest.fn(),
    } as unknown as FastifyInstance;
    financialInstitutionsEndpoints = financialInstitutionsEndpointsBuilder(mockServer);
  });

  it('should create all endpoints with correct configuration', () => {
    expect(createEndpoint).toHaveBeenCalledTimes(2);
    expect(financialInstitutionsEndpoints).toHaveLength(2);
  });

  it('should create GET company financial institutions endpoint with correct configuration', () => {
    expect(createEndpoint).toHaveBeenNthCalledWith(1, mockServer, {
      method: [HTTP_METHODS_MAP.LIST],
      url: URL_V1,
      handler: listCompanyFinancialInstitutionsHandler,
      schema: {
        params: COMPANY_FINANCIAL_INSTITUTIONS_ENDPOINTS_PARAMS_JSON_SCHEMA,
      },
    });
  });

  it('should create POST sync transactions endpoint with correct configuration', () => {
    expect(createEndpoint).toHaveBeenNthCalledWith(2, mockServer, {
      method: [HTTP_METHODS_MAP.CREATE],
      url: URL_SYNC_TRANSACTIONS_V1,
      handler: syncTransactionsHandler,
      schema: {
        body: SYNC_TRANSACTIONS_BODY_JSON_SCHEMA,
        params: SYNC_TRANSACTIONS_PARAMS_JSON_SCHEMA,
      },
    });
  });

  it('should return an array of route options', () => {
    expect(Array.isArray(financialInstitutionsEndpoints)).toBe(true);
    expect(financialInstitutionsEndpoints).toHaveLength(2);
  });

  it('should call createEndpoint with the correct server instance', () => {
    expect(createEndpoint).toHaveBeenCalledWith(mockServer, expect.any(Object));
  });
}); 