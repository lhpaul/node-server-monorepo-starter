import {
  buildSchemaForQueryParamsProperty,
  createEndpoint,
  HTTP_METHODS_MAP,
} from '@repo/fastify';
import { FastifyInstance, RouteOptions } from 'fastify';

import { usersEndpointsBuilder } from '../users.endpoints';
import {
  USER_ENDPOINTS_PARAMS_JSON_SCHEMA,
  UPDATE_USER_BODY_JSON_SCHEMA,
  URL_V1,
  URL_WITH_ID_V1,
} from '../users.endpoints.constants';

jest.mock('@repo/fastify');

describe('usersEndpointsBuilder', () => {
  let mockServer: Partial<FastifyInstance>;
  let mockCreateEndpoint: jest.MockedFunction<typeof createEndpoint>;

  beforeEach(() => {
    mockCreateEndpoint = createEndpoint as jest.MockedFunction<typeof createEndpoint>;
    mockCreateEndpoint.mockReturnValue({} as RouteOptions);

    mockServer = {
      // Add any server properties that might be needed
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create all endpoints with correct configuration', () => {
    const result = usersEndpointsBuilder(mockServer as FastifyInstance);

    expect(result).toHaveLength(3);
    expect(mockCreateEndpoint).toHaveBeenCalledTimes(3);
  });

  it('should create GET users list endpoint with correct configuration', () => {
    usersEndpointsBuilder(mockServer as FastifyInstance);

    expect(mockCreateEndpoint).toHaveBeenCalledWith(
      mockServer,
      expect.objectContaining({
        method: [HTTP_METHODS_MAP.LIST],
        url: URL_V1,
        schema: {
          querystring: expect.objectContaining({
            type: 'object',
            properties: expect.objectContaining({
              ...buildSchemaForQueryParamsProperty('email', 'string', [
                'eq',
                'in',
              ]),
            }),
          }),
        },
      }),
    );
  });

  it('should create GET single user endpoint with correct configuration', () => {
    usersEndpointsBuilder(mockServer as FastifyInstance);

    expect(mockCreateEndpoint).toHaveBeenCalledWith(
      mockServer,
      expect.objectContaining({
        method: [HTTP_METHODS_MAP.GET],
        url: URL_WITH_ID_V1,
        schema: {
          params: USER_ENDPOINTS_PARAMS_JSON_SCHEMA,
        },
      }),
    );
  });

  it('should create PUT user update endpoint with correct configuration', () => {
    usersEndpointsBuilder(mockServer as FastifyInstance);

    expect(mockCreateEndpoint).toHaveBeenCalledWith(
      mockServer,
      expect.objectContaining({
        method: [HTTP_METHODS_MAP.UPDATE],
        url: URL_WITH_ID_V1,
        schema: {
          body: UPDATE_USER_BODY_JSON_SCHEMA,
          params: USER_ENDPOINTS_PARAMS_JSON_SCHEMA,
        },
      }),
    );
  });

  it('should return an array of route options', () => {
    const result = usersEndpointsBuilder(mockServer as FastifyInstance);

    expect(Array.isArray(result)).toBe(true);
    expect(result.every(route => typeof route === 'object')).toBe(true);
  });

  it('should call createEndpoint with the correct server instance', () => {
    usersEndpointsBuilder(mockServer as FastifyInstance);

    expect(mockCreateEndpoint).toHaveBeenCalledWith(
      mockServer,
      expect.any(Object),
    );
  });
});
