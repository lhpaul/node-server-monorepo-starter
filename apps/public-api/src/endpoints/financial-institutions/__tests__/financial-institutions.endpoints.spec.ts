import { FastifyInstance } from 'fastify';

import { createEndpoint, HTTP_METHODS_MAP } from '@repo/fastify';

import { financialInstitutionsEndpointsBuilder } from '../financial-institutions.endpoints';
import {
  LIST_FINANCIAL_INSTITUTIONS_QUERY_JSON_SCHEMA,
  URL_V1,
} from '../financial-institutions.endpoints.constants';
import { listFinancialInstitutionsHandler } from '../handlers';

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
    expect(createEndpoint).toHaveBeenCalledTimes(1);
    expect(financialInstitutionsEndpoints).toHaveLength(1);
  });

  it('should create LIST financial institutions endpoint with correct configuration', () => {
    expect(createEndpoint).toHaveBeenCalledWith(mockServer, {
      method: [HTTP_METHODS_MAP.LIST],
      url: URL_V1,
      handler: listFinancialInstitutionsHandler,
      schema: {
        querystring: LIST_FINANCIAL_INSTITUTIONS_QUERY_JSON_SCHEMA,
      },
    });
  });
}); 