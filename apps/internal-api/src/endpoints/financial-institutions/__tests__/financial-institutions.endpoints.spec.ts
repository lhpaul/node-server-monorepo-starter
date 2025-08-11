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
} from '../financial-institutions.endpoints.constants';
import { financialInstitutionsEndpointsBuilder, QUERY_STRING_JSON_SCHEMA } from '../financial-institutions.endpoints';
import {
  createFinancialInstitutionHandler,
  deleteFinancialInstitutionHandler,
  getFinancialInstitutionHandler,
  listFinancialInstitutionsHandler,
  updateFinancialInstitutionHandler,
} from '../handlers';

jest.mock('@repo/fastify', () => ({
  ...jest.requireActual('@repo/fastify'),
  buildSchemaForQueryParamsProperty: jest.fn(),
  createEndpoint: jest.fn(),
  HTTP_METHODS_MAP: {
    CREATE: 'POST',
    LIST: 'GET',
    GET: 'GET',
    UPDATE: 'PUT',
    DELETE: 'DELETE',
  },
}));

jest.mock('../handlers', () => ({
  createFinancialInstitutionHandler: jest.fn(),
  deleteFinancialInstitutionHandler: jest.fn(),
  getFinancialInstitutionHandler: jest.fn(),
  listFinancialInstitutionsHandler: jest.fn(),
  updateFinancialInstitutionHandler: jest.fn(),
}));

describe(financialInstitutionsEndpointsBuilder.name, () => {
  let mockServer: Partial<FastifyInstance>;
  let mockCreateEndpoint: jest.Mock;

  beforeEach(() => {
    mockServer = {};
    mockCreateEndpoint = createEndpoint as jest.Mock;
    mockCreateEndpoint.mockReturnValue({} as RouteOptions);

    (buildSchemaForQueryParamsProperty as jest.Mock).mockReturnValue({
      name: { type: 'string' },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should build all CRUD endpoints', () => {
    const result = financialInstitutionsEndpointsBuilder(mockServer as FastifyInstance);

    expect(result).toHaveLength(5);
    expect(mockCreateEndpoint).toHaveBeenCalledTimes(5);
  });

  it('should create POST endpoint for creating financial institutions', () => {
    financialInstitutionsEndpointsBuilder(mockServer as FastifyInstance);

    expect(mockCreateEndpoint).toHaveBeenCalledWith(
      mockServer,
      {
        method: [HTTP_METHODS_MAP.CREATE],
        url: URL_V1,
        handler: createFinancialInstitutionHandler,
        schema: {
          body: CREATE_FINANCIAL_INSTITUTION_BODY_JSON_SCHEMA,
        },
      },
    );
  });

  it('should create GET endpoint for listing financial institutions', () => {
    financialInstitutionsEndpointsBuilder(mockServer as FastifyInstance);

    expect(mockCreateEndpoint).toHaveBeenCalledWith(
      mockServer,
      {
        method: [HTTP_METHODS_MAP.LIST],
        url: URL_V1,
        handler: listFinancialInstitutionsHandler,
        schema: {
          querystring: QUERY_STRING_JSON_SCHEMA,
        },
      },
    );
  });

  it('should create GET endpoint for getting a specific financial institution', () => {
    financialInstitutionsEndpointsBuilder(mockServer as FastifyInstance);

    expect(mockCreateEndpoint).toHaveBeenCalledWith(
      mockServer,
      {
        method: [HTTP_METHODS_MAP.GET],
        url: URL_WITH_ID_V1,
        handler: getFinancialInstitutionHandler,
        schema: {
          params: FINANCIAL_INSTITUTION_ENDPOINTS_PARAMS_JSON_SCHEMA,
        },
      },
    );
  });

  it('should create PUT endpoint for updating financial institutions', () => {
    financialInstitutionsEndpointsBuilder(mockServer as FastifyInstance);

    expect(mockCreateEndpoint).toHaveBeenCalledWith(
      mockServer,
      {
        method: [HTTP_METHODS_MAP.UPDATE],
        url: URL_WITH_ID_V1,
        handler: updateFinancialInstitutionHandler,
        schema: {
          body: UPDATE_FINANCIAL_INSTITUTION_BODY_JSON_SCHEMA,
          params: FINANCIAL_INSTITUTION_ENDPOINTS_PARAMS_JSON_SCHEMA,
        },
      },
    );
  });

  it('should create DELETE endpoint for deleting financial institutions', () => {
    financialInstitutionsEndpointsBuilder(mockServer as FastifyInstance);

    expect(mockCreateEndpoint).toHaveBeenCalledWith(
      mockServer,
      {
        method: [HTTP_METHODS_MAP.DELETE],
        url: URL_WITH_ID_V1,
        handler: deleteFinancialInstitutionHandler,
        schema: {
          params: FINANCIAL_INSTITUTION_ENDPOINTS_PARAMS_JSON_SCHEMA,
        },
      },
    );
  });


}); 