import { FastifyInstance, FastifyRequest, FastifyReply, RouteOptions } from 'fastify';
import { QUERY_PARAMS_OPERATORS, QUERY_PARAMS_OPERATORS_MAP } from '../../../constants/requests.constants';
import { LOG_IDS } from '../endpoints.utils.constants';
import { createEndpoint, transformQueryParams, buildSchemaForQueryParamsProperty } from '../endpoints.utils';
import { EndpointOptions } from '../endpoints.utils.interfaces';

describe(createEndpoint.name, () => {
  let mockServer: FastifyInstance;
  let mockRequest: FastifyRequest;
  let mockReply: FastifyReply;
  let mockDone: jest.Mock;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockServer = {
      authenticate: jest.fn(),
    } as unknown as FastifyInstance;

    mockRequest = {
      method: 'GET',
      url: '/test',
      params: { id: '123' },
      query: { filter: 'test' },
      body: { data: 'test' },
      headers: { 'content-type': 'application/json' },
      log: {
        info: jest.fn(),
      },
    } as unknown as FastifyRequest;

    mockReply = {
      statusCode: 200,
      elapsedTime: 100,
      getHeaders: jest.fn().mockReturnValue({ 'content-type': 'application/json' }),
    } as unknown as FastifyReply;

    mockDone = jest.fn();
    mockNext = jest.fn();
  });

  it('should create endpoint with authentication by default', () => {
    const routeOptions: RouteOptions = {
      url: '/test',
      method: 'GET',
      handler: jest.fn(),
    };

    const result = createEndpoint(mockServer, routeOptions);

    expect(result.preHandler).toEqual([mockServer.authenticate]);
  });

  it('should create endpoint without authentication when specified', () => {
    const routeOptions: RouteOptions = {
      url: '/test',
      method: 'GET',
      handler: jest.fn(),
    };
    const options: EndpointOptions = { authenticate: false };

    const result = createEndpoint(mockServer, routeOptions, options);

    expect(result.preHandler).toEqual([]);
  });

  it('should handle preValidation hooks', () => {
    const preValidation = jest.fn();
    const routeOptions: RouteOptions = {
      url: '/test',
      method: 'GET',
      handler: jest.fn(),
      preValidation,
    };

    const result = createEndpoint(mockServer, routeOptions, { maskOptions: { responsePayloadFields: ['data'] } });
    (result.preValidation as Function).bind(mockServer)(mockRequest, mockReply, mockDone);

    expect(preValidation).toHaveBeenCalledWith(mockRequest, mockReply, mockDone);
    expect(mockRequest.log.info).toHaveBeenCalledWith(
      expect.objectContaining({
        id: LOG_IDS.PRE_VALIDATION,
      }),
      expect.any(String)
    );
  });

  it('should handle when preValidation is an array', () => {
    const preValidations = [jest.fn(), jest.fn()];
    const routeOptions: RouteOptions = {
      url: '/test',
      method: 'GET',
      handler: jest.fn(),
      preValidation: preValidations,
    };

    const result = createEndpoint(mockServer, routeOptions);

    (result.preValidation as Function).bind(mockServer)(mockRequest, mockReply, mockDone);

    preValidations.forEach((fn) => expect(fn).toHaveBeenCalledWith(mockRequest, mockReply, mockDone));
  });

  it('should handle onSend hooks', () => {
    const onSend = jest.fn();
    const routeOptions: RouteOptions = {
      url: '/test',
      method: 'GET',
      handler: jest.fn(),
      onSend,
    };

    const result = createEndpoint(mockServer, routeOptions, { maskOptions: { responsePayloadFields: ['data'] } });
    (result.onSend as Function).bind(mockServer)(mockRequest, mockReply, '{"data":"test"}', mockNext);

    expect(onSend).toHaveBeenCalledWith(mockRequest, mockReply, '{"data":"test"}', mockNext);
    expect(mockRequest.log.info).toHaveBeenCalledWith(
      expect.objectContaining({
        id: LOG_IDS.ON_SEND,
      }),
      expect.any(String)
    );
  });
  it('should handle when onSend is an array', () => {
    const onSends = [jest.fn(), jest.fn()];
    const routeOptions: RouteOptions = {
      url: '/test',
      method: 'GET',
      handler: jest.fn(),
      onSend: onSends,
    };

    const result = createEndpoint(mockServer, routeOptions);
    (result.onSend as Function).bind(mockServer)(mockRequest, mockReply, '{"data":"test"}', mockNext);

    onSends.forEach((fn) => expect(fn).toHaveBeenCalledWith(mockRequest, mockReply, '{"data":"test"}', mockNext));
  });
  it('should mask request headers by default', () => { // TODO: improve this test
    const routeOptions: RouteOptions = {
      url: '/test',
      method: 'GET',
      handler: jest.fn(),
    };
    const result = createEndpoint(mockServer, routeOptions);
    (result.preValidation as Function).bind(mockServer)(mockRequest, mockReply, mockDone);
    expect(mockRequest.log.info).toHaveBeenCalledWith(
      expect.objectContaining({
        id: LOG_IDS.PRE_VALIDATION,
      }),
      expect.any(String)
    );
  });
  it('should handle when there is no payload in the response', () => {
    const routeOptions: RouteOptions = {
      url: '/test',
      method: 'GET',
      handler: jest.fn(),
    };
    const result = createEndpoint(mockServer, routeOptions);
    (result.onSend as Function).bind(mockServer)(mockRequest, mockReply, undefined, mockNext);
    expect(mockRequest.log.info).toHaveBeenCalledWith(
      expect.objectContaining({
        id: LOG_IDS.ON_SEND,
      }),
      expect.any(String)
    );
    expect(mockNext).toHaveBeenCalledWith();
  });
});

describe(transformQueryParams.name, () => {
  it('should transform simple query parameters', () => {
    const queryParams = {
      name: 'John',
      age: '25',
    };

    const result = transformQueryParams(queryParams);

    expect(result).toEqual({
      name: [{ value: 'John', operator: '==' }],
      age: [{ value: '25', operator: '==' }],
    });
  });

  it('should transform query parameters with operators', () => {
    const queryParams = {
      'age[gt]': '25',
      'name[eq]': 'John',
    };

    const result = transformQueryParams(queryParams);

    expect(result).toEqual({
      age: [{ value: '25', operator: QUERY_PARAMS_OPERATORS_MAP.gt }],
      name: [{ value: 'John', operator: QUERY_PARAMS_OPERATORS_MAP.eq }],
    });
  });

  it('should handle multiple conditions for the same field', () => {
    const queryParams = {
      'age[gt]': '25',
      'age[lt]': '50',
    };

    const result = transformQueryParams(queryParams);

    expect(result).toEqual({
      age: [
        { value: '25', operator: QUERY_PARAMS_OPERATORS_MAP.gt },
        { value: '50', operator: QUERY_PARAMS_OPERATORS_MAP.lt },
      ],
    });
  });
});

describe(buildSchemaForQueryParamsProperty.name, () => {
  it('should build schema for simple field', () => {
    const field = 'name';
    const type = 'string';
    const operators: QUERY_PARAMS_OPERATORS[] = ['eq'];

    const result = buildSchemaForQueryParamsProperty(field, type, operators);

    expect(result).toEqual({
      name: { type: 'string' },
    });
  });

  it('should build schema for field with multiple operators', () => {
    const field = 'age';
    const type = 'number';
    const operators: QUERY_PARAMS_OPERATORS[] = ['eq', 'gt', 'lt'];

    const result = buildSchemaForQueryParamsProperty(field, type, operators);

    expect(result).toEqual({
      age: { type: 'number' },
      'age[gt]': { type: 'number' },
      'age[lt]': { type: 'number' },
    });
  });

  it('should handle all supported operators', () => {
    const field = 'search';
    const type = 'string';
    const operators: QUERY_PARAMS_OPERATORS[] = ['eq', 'gt', 'ge', 'in', 'le', 'lt', 'ne', 'not-in'];

    const result = buildSchemaForQueryParamsProperty(field, type, operators);

    expect(result).toEqual({
      search: { type: 'string' },
      'search[gt]': { type: 'string' },
      'search[ge]': { type: 'string' },
      'search[in]': { type: 'string' },
      'search[le]': { type: 'string' },
      'search[lt]': { type: 'string' },
      'search[ne]': { type: 'string' },
      'search[not-in]': { type: 'string' },
    });
  });
});
