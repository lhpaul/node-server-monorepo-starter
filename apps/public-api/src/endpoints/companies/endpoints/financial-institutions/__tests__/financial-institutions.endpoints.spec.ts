import { createEndpoint, HTTP_METHODS_MAP } from '@repo/fastify';
import { FastifyInstance } from 'fastify';
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
} from '../financial-institutions.endpoints.constants';
import {
  createFinancialInstitutionHandler,
  deleteFinancialInstitutionHandler,
  getFinancialInstitutionHandler,
  listFinancialInstitutionsHandler,
  syncTransactionsHandler,
  updateFinancialInstitutionHandler,
} from '../handlers';
import { financialInstitutionsEndpointsBuilder } from '../financial-institutions.endpoints';

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
    expect(createEndpoint).toHaveBeenCalledTimes(6);
    expect(financialInstitutionsEndpoints).toHaveLength(6);
  });

  it('should create CREATE financial institution endpoint with correct configuration', () => {
    expect(createEndpoint).toHaveBeenNthCalledWith(1, mockServer, {
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
    });
  });

  it('should create LIST financial institutions endpoint with correct configuration', () => {
    expect(createEndpoint).toHaveBeenNthCalledWith(2, mockServer, {
      method: [HTTP_METHODS_MAP.LIST],
      url: URL_V1,
      handler: listFinancialInstitutionsHandler,
      schema: {
        params: COMPANY_FINANCIAL_INSTITUTIONS_ENDPOINTS_PARAMS_JSON_SCHEMA,
      },
    });
  });

  it('should create GET financial institution endpoint with correct configuration', () => {
    expect(createEndpoint).toHaveBeenNthCalledWith(3, mockServer, {
      method: [HTTP_METHODS_MAP.GET],
      url: URL_WITH_ID_V1,
      handler: getFinancialInstitutionHandler,
      schema: {
        params: COMPANY_FINANCIAL_INSTITUTION_ENDPOINTS_PARAMS_JSON_SCHEMA,
      },
    });
  });

  it('should create UPDATE financial institution endpoint with correct configuration', () => {
    expect(createEndpoint).toHaveBeenNthCalledWith(4, mockServer, {
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
    });
  });

  it('should create DELETE financial institution endpoint with correct configuration', () => {
    expect(createEndpoint).toHaveBeenNthCalledWith(5, mockServer, {
      method: [HTTP_METHODS_MAP.DELETE],
      url: URL_WITH_ID_V1,
      handler: deleteFinancialInstitutionHandler,
      schema: {
        params: COMPANY_FINANCIAL_INSTITUTION_ENDPOINTS_PARAMS_JSON_SCHEMA,
      },
    });
  });

  it('should create SYNC TRANSACTIONS endpoint with correct configuration', () => {
    expect(createEndpoint).toHaveBeenNthCalledWith(6, mockServer, {
      method: [HTTP_METHODS_MAP.CREATE],
      url: URL_SYNC_TRANSACTIONS_V1,
      handler: syncTransactionsHandler,
      schema: {
        body: SYNC_TRANSACTIONS_BODY_JSON_SCHEMA,
        params: COMPANY_FINANCIAL_INSTITUTION_SYNC_TRANSACTIONS_PARAMS_JSON_SCHEMA,
      },
    });
  });
}); 