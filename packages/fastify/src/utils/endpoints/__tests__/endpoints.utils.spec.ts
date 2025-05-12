import { maskFields } from '@repo/shared/utils';
import {
  FastifyRequest,
  FastifyReply,
  RouteOptions,
  FastifyInstance,
  onRequestHookHandler,
  onSendHookHandler,
} from 'fastify';

import { createEndpoint, transformQueryParams } from '../endpoints.utils';
import { LOG_IDS } from '../endpoints.utils.constants';
import { IEndpointOptions } from '../endpoints.utils.interfaces';

// Mock the maskFields utility
jest.mock('@repo/shared/utils', () => ({
  maskFields: jest
    .fn()
    .mockImplementation((obj: Record<string, any>, _fields: string[]) => obj),
}));

describe(createEndpoint.name, () => {
  let mockRequest: jest.Mocked<FastifyRequest>;
  let mockReply: jest.Mocked<FastifyReply>;
  let mockFastifyInstance: jest.Mocked<FastifyInstance>;
  let mockOnRequest: jest.Mock;
  let mockOnSend: jest.Mock;
  let mockDone: jest.Mock;
  let mockNext: jest.Mock;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup mock request
    mockRequest = {
      method: 'GET',
      url: '/test',
      params: { id: '123' },
      query: { search: 'test' },
      body: { data: 'test' },
      headers: { 'content-type': 'application/json' },
      log: {
        info: jest.fn(),
      },
    } as unknown as jest.Mocked<FastifyRequest>;

    // Setup mock reply
    mockReply = {
      statusCode: 200,
      elapsedTime: 100,
      getHeaders: jest
        .fn()
        .mockReturnValue({ 'content-type': 'application/json' }),
    } as unknown as jest.Mocked<FastifyReply>;

    // Setup mock Fastify instance
    mockFastifyInstance = {} as jest.Mocked<FastifyInstance>;

    // Setup mock callbacks
    mockOnRequest = jest.fn();
    mockOnSend = jest.fn();
    mockDone = jest.fn();
    mockNext = jest.fn();
  });

  describe(createEndpoint.name, () => {
    it('should create an endpoint with logging hooks', () => {
      const routeOptions: RouteOptions = {
        method: 'GET',
        url: '/test',
        handler: jest.fn(),
      };

      const endpoint = createEndpoint(routeOptions);

      expect(endpoint).toHaveProperty('onRequest');
      expect(endpoint).toHaveProperty('onSend');
      expect(endpoint.method).toBe('GET');
      expect(endpoint.url).toBe('/test');
    });

    it('should call original onRequest handler if provided', () => {
      const routeOptions: RouteOptions = {
        method: 'GET',
        url: '/test',
        handler: jest.fn(),
        onRequest: mockOnRequest as unknown as onRequestHookHandler,
      };

      const endpoint = createEndpoint(routeOptions);
      const onRequestHook = endpoint.onRequest as onRequestHookHandler;
      onRequestHook.call(mockFastifyInstance, mockRequest, mockReply, mockDone);

      expect(mockOnRequest).toHaveBeenCalledWith(
        mockRequest,
        mockReply,
        mockDone,
      );
      expect(mockDone).toHaveBeenCalled();
    });

    it('should call original onSend handler if provided', () => {
      const routeOptions: RouteOptions = {
        method: 'GET',
        url: '/test',
        handler: jest.fn(),
        onSend: mockOnSend as unknown as onSendHookHandler,
      };

      const endpoint = createEndpoint(routeOptions);
      const onSendHook = endpoint.onSend as onSendHookHandler;
      const payload = { data: 'test' };
      onSendHook.call(
        mockFastifyInstance,
        mockRequest,
        mockReply,
        payload,
        mockNext,
      );

      expect(mockOnSend).toHaveBeenCalledWith(
        mockRequest,
        mockReply,
        payload,
        mockNext,
      );
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle array of onRequest handlers', () => {
      const mockOnRequest2 = jest.fn();
      const routeOptions: RouteOptions = {
        method: 'GET',
        url: '/test',
        handler: jest.fn(),
        onRequest: [
          mockOnRequest,
          mockOnRequest2,
        ] as unknown as onRequestHookHandler[],
      };

      const endpoint = createEndpoint(routeOptions);
      const onRequestHook = endpoint.onRequest as onRequestHookHandler;
      onRequestHook.call(mockFastifyInstance, mockRequest, mockReply, mockDone);

      expect(mockOnRequest).toHaveBeenCalledWith(
        mockRequest,
        mockReply,
        mockDone,
      );
      expect(mockOnRequest2).toHaveBeenCalledWith(
        mockRequest,
        mockReply,
        mockDone,
      );
      expect(mockDone).toHaveBeenCalled();
    });

    it('should handle array of onSend handlers', () => {
      const mockOnSend2 = jest.fn();
      const routeOptions: RouteOptions = {
        method: 'GET',
        url: '/test',
        handler: jest.fn(),
        onSend: [mockOnSend, mockOnSend2] as unknown as onSendHookHandler[],
      };

      const endpoint = createEndpoint(routeOptions);
      const onSendHook = endpoint.onSend as onSendHookHandler;
      const payload = { data: 'test' };
      onSendHook.call(
        mockFastifyInstance,
        mockRequest,
        mockReply,
        payload,
        mockNext,
      );

      expect(mockOnSend).toHaveBeenCalledWith(
        mockRequest,
        mockReply,
        payload,
        mockNext,
      );
      expect(mockOnSend2).toHaveBeenCalledWith(
        mockRequest,
        mockReply,
        payload,
        mockNext,
      );
      expect(mockNext).toHaveBeenCalled();
    });

    it('should log request details with default mask options', () => {
      const routeOptions: RouteOptions = {
        method: 'GET',
        url: '/test',
        handler: jest.fn(),
      };

      const endpoint = createEndpoint(routeOptions);
      const onRequestHook = endpoint.onRequest as onRequestHookHandler;
      onRequestHook.call(mockFastifyInstance, mockRequest, mockReply, mockDone);

      expect(mockRequest.log.info).toHaveBeenCalledWith(
        expect.objectContaining({
          id: LOG_IDS.ON_REQUEST,
          data: {
            method: mockRequest.method,
            url: mockRequest.url,
            params: mockRequest.params,
            query: mockRequest.query,
            body: mockRequest.body,
            headers: mockRequest.headers,
          },
        }),
        `On Request: ${mockRequest.method} ${mockRequest.url}`,
      );
    });

    it('should log request details with custom mask options', () => {
      const options: IEndpointOptions = {
        maskOptions: {
          params: ['id'],
          query: ['search'],
          requestPayloadFields: ['data'],
          requestHeaders: ['content-type'],
        },
      };

      const routeOptions: RouteOptions = {
        method: 'GET',
        url: '/test',
        handler: jest.fn(),
      };

      const endpoint = createEndpoint(routeOptions, options);
      const onRequestHook = endpoint.onRequest as onRequestHookHandler;
      onRequestHook.call(mockFastifyInstance, mockRequest, mockReply, mockDone);

      const maskOptions = options.maskOptions!;
      expect(maskFields).toHaveBeenCalledWith(
        mockRequest.params,
        maskOptions.params,
      );
      expect(maskFields).toHaveBeenCalledWith(
        mockRequest.query,
        maskOptions.query,
      );
      expect(maskFields).toHaveBeenCalledWith(
        mockRequest.body,
        maskOptions.requestPayloadFields,
      );
      expect(maskFields).toHaveBeenCalledWith(
        mockRequest.headers,
        maskOptions.requestHeaders,
      );
    });
    it('should log response details with default mask options', () => {
      const routeOptions: RouteOptions = {
        method: 'GET',
        url: '/test',
        handler: jest.fn(),
      };

      const endpoint = createEndpoint(routeOptions);
      const onSendHook = endpoint.onSend as onSendHookHandler;
      const payload = { data: 'test' };
      onSendHook.call(
        mockFastifyInstance,
        mockRequest,
        mockReply,
        payload,
        mockNext,
      );

      expect(mockRequest.log.info).toHaveBeenCalledWith(
        expect.objectContaining({
          id: LOG_IDS.ON_SEND,
          data: {
            responseTime: 100,
            statusCode: 200,
            responseHeaders: mockReply.getHeaders(),
            responsePayload: payload,
          },
        }),
        `On Send: statusCode: ${mockReply.statusCode} responseTime: ${mockReply.elapsedTime}ms`,
      );
    });

    it('should log response details with custom mask options', () => {
      const options: IEndpointOptions = {
        maskOptions: {
          responseHeaders: ['content-type'],
          responsePayloadFields: ['data'],
        },
      };

      const routeOptions: RouteOptions = {
        method: 'GET',
        url: '/test',
        handler: jest.fn(),
      };

      const endpoint = createEndpoint(routeOptions, options);
      const onSendHook = endpoint.onSend as onSendHookHandler;
      const payload = { data: 'test' };
      onSendHook.call(
        mockFastifyInstance,
        mockRequest,
        mockReply,
        payload,
        mockNext,
      );

      const maskOptions = options.maskOptions!;
      expect(maskFields).toHaveBeenCalledWith(
        mockReply.getHeaders(),
        maskOptions.responseHeaders,
      );
      expect(maskFields).toHaveBeenCalledWith(
        payload,
        maskOptions.responsePayloadFields,
      );
    });
  });

  describe(transformQueryParams.name, () => {
    it('should transform query params', () => {
      const queryParams = { amount: 100, date: '2021-01-01', type: 'income' };
      const transformedQuery = transformQueryParams(queryParams);
      expect(transformedQuery).toEqual({
        amount: [{ value: 100, operator: '==' }],
        date: [{ value: '2021-01-01', operator: '==' }],
        type: [{ value: 'income', operator: '==' }],
      });
    });

    it('should transform query params with multiple operators', () => {
      const queryParams = {
        'amount[gt]': 100,
        'date[gt]': '2021-01-01',
        'date[lt]': '2021-01-02',
        'type[in]': ['income', 'expense'],
      };
      const transformedQuery = transformQueryParams(queryParams);
      expect(transformedQuery).toEqual({
        amount: [{ value: 100, operator: '>' }],
        date: [
          { value: '2021-01-01', operator: '>' },
          { value: '2021-01-02', operator: '<' },
        ],
        type: [{ value: ['income', 'expense'], operator: 'in' }],
      });
    });
  });
});
