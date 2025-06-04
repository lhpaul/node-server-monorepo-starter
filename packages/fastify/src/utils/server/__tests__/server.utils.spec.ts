import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import {
  INTERNAL_ERROR_VALUES,
  RESOURCE_NOT_FOUND_ERROR,
  STATUS_CODES,
  TIMEOUT_ERROR,
  UNCAUGHT_EXCEPTION_ERROR,
  UNHANDLED_REJECTION_ERROR,
  VALIDATION_ERROR,
  VALIDATION_ERROR_CODE,
} from '../../../constants/server.constants';
import { RequestLogger } from '../../request-logger/request-logger.class';
import { setServerErrorHandlers, setServerHooks, setServerProcessErrorHandlers } from '../server.utils';

describe(setServerErrorHandlers.name, () => {
  let mockServer: jest.Mocked<FastifyInstance>;
  let mockRequest: jest.Mocked<FastifyRequest>;
  let mockReply: jest.Mocked<FastifyReply>;

  beforeEach(() => {
    mockRequest = {
      id: 'test-request-id',
      url: '/test-url',
      log: {
        warn: jest.fn(),
        error: jest.fn(),
        lastStep: null,
        stepsCounter: 0,
      },
    } as any;

    mockReply = {
      status: jest.fn().mockReturnThis(),
      code: jest.fn().mockReturnThis(),
      send: jest.fn(),
    } as any;

    mockServer = {
      setNotFoundHandler: jest.fn(),
      setErrorHandler: jest.fn(),
    } as any;
  });

  it('should set up not found handler correctly', () => {
    setServerErrorHandlers(mockServer);
    
    const notFoundHandler = mockServer.setNotFoundHandler.mock.calls[0][0] as Function;
    notFoundHandler(mockRequest, mockReply);

    expect(mockRequest.log.warn).toHaveBeenCalledWith(
      {
        logId: RESOURCE_NOT_FOUND_ERROR.logId,
        requestId: mockRequest.id,
        url: mockRequest.url,
      },
      RESOURCE_NOT_FOUND_ERROR.logMessage,
    );
    expect(mockReply.status).toHaveBeenCalledWith(STATUS_CODES.NOT_FOUND);
    expect(mockReply.send).toHaveBeenCalledWith({
      code: RESOURCE_NOT_FOUND_ERROR.responseCode,
      message: RESOURCE_NOT_FOUND_ERROR.responseMessage,
    });
  });

  it('should handle validation errors correctly', () => {
    setServerErrorHandlers(mockServer);
    
    const errorHandler = mockServer.setErrorHandler.mock.calls[0][0] as Function;
    const validationError = {
      statusCode: STATUS_CODES.BAD_REQUEST,
      code: VALIDATION_ERROR_CODE,
      validation: [{ message: 'Invalid input' }],
    };

    errorHandler(validationError, mockRequest, mockReply);

    expect(mockRequest.log.warn).toHaveBeenCalledWith(
      {
        logId: VALIDATION_ERROR.logId,
        error: validationError,
      },
      VALIDATION_ERROR.logMessage({ error: validationError }),
    );
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.BAD_REQUEST);
    expect(mockReply.send).toHaveBeenCalledWith({
      code: VALIDATION_ERROR.responseCode,
      message: VALIDATION_ERROR.responseMessage,
      details: ['Invalid input'],
    });
  });

  it('should handle internal errors correctly without step', () => {
    setServerErrorHandlers(mockServer);
    
    const errorHandler = mockServer.setErrorHandler.mock.calls[0][0] as Function;
    const internalError = new Error('Internal error');

    errorHandler(internalError, mockRequest, mockReply);

    expect(mockRequest.log.error).toHaveBeenCalledWith(
      {
        logId: INTERNAL_ERROR_VALUES.logId,
        errorCode: null,
        error: internalError,
        step: null,
      },
      INTERNAL_ERROR_VALUES.logMessage({ error: internalError, step: null }),
    );
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.INTERNAL_ERROR);
    expect(mockReply.send).toHaveBeenCalledWith({
      code: '0',
      message: INTERNAL_ERROR_VALUES.responseMessage,
    });
  });
  it('should handle internal errors correctly with step', () => {
    setServerErrorHandlers(mockServer);
    const step = { id: 'some-step-id' };
    mockRequest.log.lastStep = step;
    mockRequest.log.stepsCounter = 1;
    
    const errorHandler = mockServer.setErrorHandler.mock.calls[0][0] as Function;
    const internalError = new Error('Internal error');

    errorHandler(internalError, mockRequest, mockReply);

    expect(mockRequest.log.error).toHaveBeenCalledWith(
      {
        logId: INTERNAL_ERROR_VALUES.logId,
        errorCode: step.id,
        error: internalError,
        step,
      },
      INTERNAL_ERROR_VALUES.logMessage({ error: internalError, step: step.id }),
    );
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.INTERNAL_ERROR);
    expect(mockReply.send).toHaveBeenCalledWith({
      code: mockRequest.log.stepsCounter.toString(),
      message: INTERNAL_ERROR_VALUES.responseMessage,
    });
  });
});

describe(setServerHooks.name, () => {
  let mockServer: jest.Mocked<FastifyInstance>;
  let mockRequest: jest.Mocked<FastifyRequest>;
  let mockReply: jest.Mocked<FastifyReply>;

  beforeEach(() => {
    mockRequest = {
      log: {
        warn: jest.fn(),
        error: jest.fn(),
      },
    } as any;

    mockReply = {
      elapsedTime: 1000,
    } as any;

    mockServer = {
      addHook: jest.fn(),
    } as any;
  });

  it('should set up onRequest hook correctly', () => {
    setServerHooks(mockServer);
    
    const onRequestHook = mockServer.addHook.mock.calls[0][1] as Function;
    const done = jest.fn();
    onRequestHook(mockRequest, mockReply, done);

    expect(mockRequest.log).toBeInstanceOf(RequestLogger);
    expect(done).toHaveBeenCalled();
  });

  it('should set up onTimeout hook correctly', () => {
    setServerHooks(mockServer);
    
    const onTimeoutHook = mockServer.addHook.mock.calls[1][1] as Function;
    const done = jest.fn();
    onTimeoutHook(mockRequest, mockReply, done);

    expect(mockRequest.log.error).toHaveBeenCalledWith(
      {
        logId: TIMEOUT_ERROR.logId,
        requestId: mockRequest.id,
        elapsedTime: mockReply.elapsedTime,
      },
      TIMEOUT_ERROR.logMessage({ reply: mockReply }),
    );
    expect(done).toHaveBeenCalled();
  });
});

describe(setServerProcessErrorHandlers.name, () => {
  let mockServer: jest.Mocked<FastifyInstance>;
  let originalProcessOn: any;
  let originalProcessExit: any;
  let originalConsoleError: any;

  beforeEach(() => {
    mockServer = {
      log: {
        error: jest.fn(),
      },
    } as any;

    originalProcessOn = process.on;
    originalConsoleError = console.error;
    originalProcessExit = process.exit;
    process.on = jest.fn() as any;
    process.exit = jest.fn() as any;
    console.error = jest.fn();
  });

  afterEach(() => {
    process.on = originalProcessOn;
    console.error = originalConsoleError;
    process.exit = originalProcessExit;
  });

  it('should set up unhandledRejection handler correctly', () => {
    setServerProcessErrorHandlers(mockServer);
    
    const unhandledRejectionHandler = (process.on as jest.Mock).mock.calls[0][1];
    const testError = new Error('Test rejection error');
    unhandledRejectionHandler(testError);

    expect(mockServer.log.error).toHaveBeenCalledWith(
      {
        logId: UNHANDLED_REJECTION_ERROR.logId,
        error: testError,
      },
      UNHANDLED_REJECTION_ERROR.logMessage({ err: testError }),
    );
    expect(console.error).toHaveBeenCalledWith('unhandledRejection', testError);
    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it('should set up uncaughtException handler correctly', () => {
    setServerProcessErrorHandlers(mockServer);
    
    const uncaughtExceptionHandler = (process.on as jest.Mock).mock.calls[1][1];
    const testError = new Error('Test exception error');
    uncaughtExceptionHandler(testError);

    expect(mockServer.log.error).toHaveBeenCalledWith(
      {
        logId: UNCAUGHT_EXCEPTION_ERROR.logId,
        error: testError,
      },
      UNCAUGHT_EXCEPTION_ERROR.logMessage({ err: testError }),
    );
    expect(console.error).toHaveBeenCalledWith('uncaughtException', testError);
    expect(process.exit).toHaveBeenCalledWith(1);
  });
});
