import { createEndpoint, HTTP_METHODS_MAP } from '@repo/fastify';
import { FastifyInstance } from 'fastify';
import { LOGIN_BODY_JSON_SCHEMA, URL_LOGIN, URL_UPDATE_CLAIMS } from '../auth.endpoints.constants';
import { updateClaimsHandler } from '../handlers/update-claims/update-claims.handler';
import { authEndpointsBuilder } from '../auth.endpoints';
import { loginHandler } from '../handlers/login/login.handler';

jest.mock('@repo/fastify', () => ({
  ...jest.requireActual('@repo/fastify'),
  createEndpoint: jest.fn(),
}));

describe(authEndpointsBuilder.name, () => {
  let authEndpoints: ReturnType<typeof authEndpointsBuilder>;
  let mockServer: FastifyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    mockServer = {
      authenticate: jest.fn(),
    } as unknown as FastifyInstance;
    authEndpoints = authEndpointsBuilder(mockServer);
  });

  it('should create all endpoints with correct configuration', () => {
    expect(createEndpoint).toHaveBeenCalledTimes(2);
    expect(authEndpoints).toHaveLength(2);
  });

  it('should create POST login endpoint with correct configuration', () => {
    expect(createEndpoint).toHaveBeenCalledWith(
      mockServer,
      {
        method: [HTTP_METHODS_MAP.CREATE],
        url: URL_LOGIN,
        handler: loginHandler,
        schema: {
          body: LOGIN_BODY_JSON_SCHEMA,
        },
      },
      {
        authenticate: false,
        maskOptions: {
          requestPayloadFields: ['token'],
          responsePayloadFields: ['token'],
        },
      }
    );
  });

  it('should create PATCH update claims endpoint with correct configuration', () => {
    expect(createEndpoint).toHaveBeenCalledWith(
      mockServer,
      {
        method: ['PATCH'],
        url: URL_UPDATE_CLAIMS,
        handler: updateClaimsHandler,
      }
    );
  });
});
