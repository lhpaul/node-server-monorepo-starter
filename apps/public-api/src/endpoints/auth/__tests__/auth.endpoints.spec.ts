import { createEndpoint } from '@repo/fastify';
import { FastifyInstance } from 'fastify';
import { URL_LOGIN, LOGIN_BODY_JSON_SCHEMA } from '../auth.endpoints.constants';
import { loginHandler } from '../handlers/login.handler';
import { authEndpointsBuilder } from '../auth.endpoints';

jest.mock('@repo/fastify', () => ({
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
    expect(createEndpoint).toHaveBeenCalledTimes(1);
    expect(authEndpoints).toHaveLength(1);
  });

  it('should create POST login endpoint with correct configuration', () => {
    expect(createEndpoint).toHaveBeenCalledWith(
      mockServer,
      {
        method: ['POST'],
        url: URL_LOGIN,
        handler: loginHandler,
        schema: {
          body: LOGIN_BODY_JSON_SCHEMA,
        },
      },
      {
        authenticate: false,
        maskOptions: {
          requestPayloadFields: ['email', 'password'],
          responsePayloadFields: ['token'],
        },
      }
    );
  });
});
