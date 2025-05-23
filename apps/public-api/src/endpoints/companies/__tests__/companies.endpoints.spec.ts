import { createEndpoint } from '@repo/fastify';
import { FastifyInstance } from 'fastify';
import {
  COMPANY_ENDPOINTS_PARAMS_JSON_SCHEMA,
  UPDATE_COMPANY_BODY_JSON_SCHEMA,
  URL_V1,
  URL_WITH_ID_V1,
} from '../companies.endpoints.constants';
import {
  getCompanyHandler,
  updateCompanyHandler,
} from '../handlers';
import { companiesEndpointsBuilder } from '../companies.endpoints';
import { transactionsEndpointsBuilder } from '../endpoints/transactions/transactions.endpoints';
import { listCompaniesHandler } from '../handlers/list/companies.list.handler';

jest.mock('@repo/fastify', () => ({
  createEndpoint: jest.fn(),
  buildSchemaForQueryParamsProperty:
    jest.requireActual('@repo/fastify').buildSchemaForQueryParamsProperty,
}));

jest.mock('../endpoints/transactions/transactions.endpoints', () => ({
  transactionsEndpointsBuilder: jest.fn(),
}));

describe(companiesEndpointsBuilder.name, () => {
  let companiesEndpoints: ReturnType<typeof companiesEndpointsBuilder>;
  let mockServer: FastifyInstance;
  const transactionsEndpointsMock = [
    {
      method: ['POST'],
      url: '/v1/companies/:companyId/transactions',
      handler: jest.fn(),
    },
  ];
  beforeEach(() => {
    jest.clearAllMocks();
    mockServer = {
      authenticate: jest.fn(),
    } as unknown as FastifyInstance;
    
    (transactionsEndpointsBuilder as jest.Mock).mockReturnValue(transactionsEndpointsMock);
    companiesEndpoints = companiesEndpointsBuilder(mockServer);
  });

  it('should create all endpoints with correct configuration', () => {
    expect(createEndpoint).toHaveBeenCalledTimes(3);
    expect(companiesEndpoints).toHaveLength(3 + transactionsEndpointsMock.length);
  });

  it('should create GET companies endpoint with correct configuration', () => {
    expect(createEndpoint).toHaveBeenNthCalledWith(1, mockServer, {
      method: ['GET'],
      url: URL_V1,
      handler: listCompaniesHandler,
    });
  });

  it('should create GET single company endpoint with correct configuration', () => {
    expect(createEndpoint).toHaveBeenNthCalledWith(2, mockServer, {
      method: ['GET'],
      url: URL_WITH_ID_V1,
      handler: getCompanyHandler,
      schema: {
        params: COMPANY_ENDPOINTS_PARAMS_JSON_SCHEMA,
      },
    });
  });

  it('should create PATCH company endpoint with correct configuration', () => {
    expect(createEndpoint).toHaveBeenNthCalledWith(3, mockServer, {
      method: ['PATCH'],
      url: URL_WITH_ID_V1,
      handler: updateCompanyHandler,
      schema: {
        body: UPDATE_COMPANY_BODY_JSON_SCHEMA,
        params: COMPANY_ENDPOINTS_PARAMS_JSON_SCHEMA,
      },
    });
  });
});
