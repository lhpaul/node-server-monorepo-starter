import { createEndpoint, HTTP_METHODS_MAP } from '@repo/fastify';
import { FastifyInstance } from 'fastify';

import {
  CREATE_COMPANY_BODY_JSON_SCHEMA,
  COMPANY_ENDPOINTS_PARAMS_JSON_SCHEMA,
  UPDATE_COMPANY_BODY_JSON_SCHEMA,
  URL_V1,
  URL_WITH_ID_V1,
} from '../companies.endpoints.constants';
import {
  createCompanyHandler,
  deleteCompanyHandler,
  getCompanyHandler,
  listCompaniesHandler,
  updateCompanyHandler,
} from '../handlers';
import { companiesEndpointsBuilder } from '../companies.endpoints';

jest.mock('@repo/fastify', () => ({
  ...jest.requireActual('@repo/fastify'),
  createEndpoint: jest.fn(),
}));

describe(companiesEndpointsBuilder.name, () => {
  let companiesEndpoints: ReturnType<typeof companiesEndpointsBuilder>;
  let mockServer: FastifyInstance;
  beforeEach(() => {
    jest.clearAllMocks();
    mockServer = {
      authenticate: jest.fn(),
    } as unknown as FastifyInstance;
    companiesEndpoints = companiesEndpointsBuilder(mockServer);
  });

  it('should create all endpoints with correct configuration', () => {
    expect(createEndpoint).toHaveBeenCalledTimes(5);
    expect(companiesEndpoints).toHaveLength(5);
  });

  it('should create POST company endpoint with correct configuration', () => {
    expect(createEndpoint).toHaveBeenNthCalledWith(1, mockServer, {
      method: [HTTP_METHODS_MAP.CREATE],
      url: URL_V1,
      handler: createCompanyHandler,
      schema: {
        body: CREATE_COMPANY_BODY_JSON_SCHEMA,
      },
    });
  });

  it('should create GET companies list endpoint with correct configuration', () => {
    expect(createEndpoint).toHaveBeenNthCalledWith(2, mockServer, {
      method: [HTTP_METHODS_MAP.LIST],
      url: URL_V1,
      handler: listCompaniesHandler,
      schema: {
        querystring: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            'name[ge]': { type: 'string' },
            'name[gt]': { type: 'string' },
            'name[le]': { type: 'string' },
            'name[lt]': { type: 'string' },
            countryCode: { type: 'string' },
            'countryCode[in]': { type: 'string' },
            'countryCode[not-in]': { type: 'string' },
          },
        },
      },
    });
  });

  it('should create GET single company endpoint with correct configuration', () => {
    expect(createEndpoint).toHaveBeenNthCalledWith(3, mockServer, {
      method: [HTTP_METHODS_MAP.GET],
      url: URL_WITH_ID_V1,
      handler: getCompanyHandler,
      schema: {
        params: COMPANY_ENDPOINTS_PARAMS_JSON_SCHEMA,
      },
    });
  });

  it('should create PATCH company endpoint with correct configuration', () => {
    expect(createEndpoint).toHaveBeenNthCalledWith(4, mockServer, {
      method: [HTTP_METHODS_MAP.UPDATE],
      url: URL_WITH_ID_V1,
      handler: updateCompanyHandler,
      schema: {
        body: UPDATE_COMPANY_BODY_JSON_SCHEMA,
        params: COMPANY_ENDPOINTS_PARAMS_JSON_SCHEMA,
      },
    });
  });

  it('should create DELETE company endpoint with correct configuration', () => {
    expect(createEndpoint).toHaveBeenNthCalledWith(5, mockServer, {
      method: [HTTP_METHODS_MAP.DELETE],
      url: URL_WITH_ID_V1,
      handler: deleteCompanyHandler,
      schema: {
        params: COMPANY_ENDPOINTS_PARAMS_JSON_SCHEMA,
      },
    });
  });
});
