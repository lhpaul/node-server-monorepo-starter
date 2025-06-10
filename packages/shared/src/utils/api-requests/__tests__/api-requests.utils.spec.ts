import axios, { AxiosError, AxiosStatic } from 'axios';

import { maskFields } from '../../mask/mask.utils';
import { ExecutionLogger } from '../../../definitions/executions.interfaces';
import { DEFAULT_ERROR_CODE, LOGS } from '../api-requests.utils.constants';
import {
  ApiRequestValues,
  RequestOptions,
} from '../api-requests.utils.interfaces';
import { apiRequest } from '../api-requests.utils';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<AxiosStatic>;

// Mock the maskFields utility
jest.mock('../../mask/mask.utils', () => ({
  maskFields: jest
    .fn()
    .mockImplementation((obj: Record<string, any>, _fields: string[]) => obj),
}));

describe(apiRequest.name, () => {
  let mockLogger: jest.Mocked<ExecutionLogger>;
  const baseRequestValues: ApiRequestValues = {
    method: 'GET',
    url: 'https://api.example.com/test',
    headers: { Authorization: 'Bearer token' },
    params: { id: '123' },
    payload: { data: 'test' },
  };
  const BASE_TIME = 1234567890;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup mock logger
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      fatal: jest.fn(),
      trace: jest.fn(),
      silent: jest.fn(),
      currentStep: '',
      level: 'info',
      initTime: 0,
      metadata: {},
      startStep: jest.fn(),
      endStep: jest.fn(),
      getStepElapsedTime: jest.fn(),
      getTotalElapsedTime: jest.fn(),
    } as unknown as jest.Mocked<ExecutionLogger>;

    // this is so new Date().getTime responds with a fixed value
    jest.useFakeTimers().setSystemTime(new Date(BASE_TIME));
  });

  describe('Successful requests', () => {
    const duration = 100;
    beforeEach(() => {
      // Simulate duration of the request
      jest.spyOn(Date, 'now').mockReturnValueOnce(BASE_TIME);
      jest.spyOn(Date, 'now').mockReturnValueOnce(BASE_TIME + duration);
    });
    it('should make a successful API request and log the response', async () => {
      // Setup mock response
      const mockResponse = {
        status: 200,
        headers: { 'content-type': 'application/json' },
        data: { result: 'success' },
      };
      (mockedAxios as unknown as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Make the request
      const result = await apiRequest(baseRequestValues, mockLogger);

      // Verify axios was called with correct config
      expect(mockedAxios).toHaveBeenCalledWith({
        method: baseRequestValues.method,
        url: baseRequestValues.url,
        headers: baseRequestValues.headers,
        params: baseRequestValues.params,
        data: baseRequestValues.payload,
      });

      // Verify success logging
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          logId: LOGS.API_REQUEST_START.logId,
          method: baseRequestValues.method,
          url: baseRequestValues.url,
          headers: baseRequestValues.headers,
          params: baseRequestValues.params,
          payload: baseRequestValues.payload,
        }),
        LOGS.API_REQUEST_START.logMessage({
          url: baseRequestValues.url,
          method: baseRequestValues.method,
        }),
      );

      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          logId: LOGS.API_REQUEST_SUCCESS.logId,
          method: baseRequestValues.method,
          url: baseRequestValues.url,
          duration,
          requestHeaders: baseRequestValues.headers,
          params: baseRequestValues.params,
          requestPayload: baseRequestValues.payload,
          responseHeaders: mockResponse.headers,
          responsePayload: mockResponse.data,
        }),
        LOGS.API_REQUEST_SUCCESS.logMessage({
          url: baseRequestValues.url,
          method: baseRequestValues.method,
          duration,
        }),
      );

      // Verify result
      expect(result).toEqual({
        status: 200,
        data: { result: 'success' },
      });
    });

    it('should mask sensitive data according to mask options', async () => {
      const mockResponse = {
        status: 200,
        headers: { 'content-type': 'application/json' },
        data: { result: 'success' },
      };
      (mockedAxios as unknown as jest.Mock).mockResolvedValueOnce(mockResponse);

      const options: RequestOptions = {
        maskOptions: {
          requestHeaders: ['Authorization'],
          params: ['id'],
          requestPayloadFields: ['data'],
          responseHeaders: ['content-type'],
          responsePayloadFields: ['result'],
        },
      };

      await apiRequest(baseRequestValues, mockLogger, options);

      const maskOptions = options.maskOptions!;
      expect(maskFields).toHaveBeenCalledWith(
        baseRequestValues.headers,
        maskOptions.requestHeaders,
      );
      expect(maskFields).toHaveBeenCalledWith(
        baseRequestValues.params,
        maskOptions.params,
      );
      expect(maskFields).toHaveBeenCalledWith(
        baseRequestValues.payload,
        maskOptions.requestPayloadFields,
      );
      expect(maskFields).toHaveBeenCalledWith(
        mockResponse.headers,
        maskOptions.responseHeaders,
      );
      expect(maskFields).toHaveBeenCalledWith(
        mockResponse.data,
        maskOptions.responsePayloadFields,
      );
    });
  });

  describe('Failed requests', () => {
    const duration = 100;
    beforeEach(() => {
      // Simulate duration of the request
      jest.spyOn(Date, 'now').mockReturnValueOnce(BASE_TIME);
      jest.spyOn(Date, 'now').mockReturnValueOnce(BASE_TIME + duration);
    });
    it('should handle AxiosError and return error response', async () => {
      const mockError = {
        isAxiosError: true,
        message: 'Request failed',
        code: 'ECONNREFUSED',
        response: {
          status: 500,
          data: { error: 'Internal Server Error' },
        },
      } as AxiosError;
      (mockedAxios as unknown as jest.Mock).mockRejectedValueOnce(mockError);

      const result = await apiRequest(baseRequestValues, mockLogger);

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          logId: LOGS.API_REQUEST_ERROR.logId,
          method: baseRequestValues.method,
          url: baseRequestValues.url,
          duration,
          requestHeaders: baseRequestValues.headers,
          params: baseRequestValues.params,
          requestPayload: baseRequestValues.payload,
          error: {
            message: mockError.message,
            code: mockError.code,
            status: mockError.response?.status,
            data: mockError.response?.data,
          },
        }),
        LOGS.API_REQUEST_ERROR.logMessage({
          url: baseRequestValues.url,
          method: baseRequestValues.method,
          error: mockError,
          duration,
        }),
      );

      expect(result).toEqual({
        status: mockError.response?.status,
        error: {
          code: mockError.code,
          message: mockError.message,
          status: mockError.response?.status,
          data: mockError.response?.data,
        },
      });
    });

    it('should handle AxiosError without response', async () => {
      const mockError = {
        isAxiosError: true,
        message: 'Network Error',
        code: 'ERR_NETWORK',
      } as AxiosError;
      (mockedAxios as unknown as jest.Mock).mockRejectedValueOnce(mockError);

      const result = await apiRequest(baseRequestValues, mockLogger);

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          logId: LOGS.API_REQUEST_ERROR.logId,
          method: baseRequestValues.method,
          url: baseRequestValues.url,
          duration,
          requestHeaders: baseRequestValues.headers,
          params: baseRequestValues.params,
          requestPayload: baseRequestValues.payload,
          error: {
            message: mockError.message,
            code: mockError.code,
            status: null,
            data: null,
          },
        }),
        LOGS.API_REQUEST_ERROR.logMessage({
          url: baseRequestValues.url,
          method: baseRequestValues.method,
          error: mockError,
          duration,
        }),
      );

      expect(result).toEqual({
        status: -1,
        error: {
          code: mockError.code,
          message: mockError.message,
          status: null,
          data: null,
        },
      });
    });

    it('should handle non-AxiosError', async () => {
      const mockError = new Error('Unexpected error');
      (mockedAxios as unknown as jest.Mock).mockRejectedValueOnce(mockError);

      const result = await apiRequest(baseRequestValues, mockLogger);

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          logId: LOGS.API_REQUEST_ERROR.logId,
          method: baseRequestValues.method,
          url: baseRequestValues.url,
          duration,
          requestHeaders: baseRequestValues.headers,
          params: baseRequestValues.params,
          requestPayload: baseRequestValues.payload,
          error: {
            message: mockError.message,
            code: DEFAULT_ERROR_CODE,
            status: null,
            data: null,
          },
        }),
        LOGS.API_REQUEST_ERROR.logMessage({
          url: baseRequestValues.url,
          method: baseRequestValues.method,
          error: mockError,
          duration,
        }),
      );

      expect(result).toEqual({
        status: -1,
        error: {
          code: DEFAULT_ERROR_CODE,
          message: mockError.message,
          status: null,
          data: null,
        },
      });
    });
  });
});
