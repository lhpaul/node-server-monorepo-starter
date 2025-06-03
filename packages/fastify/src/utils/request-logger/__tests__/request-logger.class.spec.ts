import { FastifyBaseLogger } from 'fastify';
import { Bindings } from 'pino';
import { ChildLoggerOptions } from 'fastify/types/logger';

import { RequestLogger } from '../request-logger.class';
import { LOGS } from '../request-logger.class.constants';

describe(RequestLogger.name, () => {
  let mockLogger: jest.Mocked<FastifyBaseLogger>;
  let requestLogger: RequestLogger;
  const BASE_TIME = 1234567890;

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      fatal: jest.fn(),
      trace: jest.fn(),
      child: jest.fn(),
      silent: jest.fn(),
      level: 'info',
    } as unknown as jest.Mocked<FastifyBaseLogger>;

    // this is so new Date().getTime responds with a fixed value
    jest.useFakeTimers().setSystemTime(new Date(BASE_TIME));
  });

  describe('Initialization', () => {
    it('should initialize with the provided logger', () => {
      requestLogger = new RequestLogger({ logger: mockLogger });
      expect(requestLogger).toBeInstanceOf(RequestLogger);
      expect(requestLogger.level).toBe('info');
    });

    it('should set the initTime on creation', () => {
      requestLogger = new RequestLogger({ logger: mockLogger });
      expect(requestLogger.initTime).toBe(BASE_TIME);
    });

    it('should initialize with parent logger if provided', () => {
      const parentLogger = new RequestLogger({ logger: mockLogger });
      requestLogger = new RequestLogger({
        logger: mockLogger,
        parent: parentLogger,
      });
      expect(requestLogger).toBeInstanceOf(RequestLogger);
    });
  });

  describe('Logging Methods', () => {
    beforeEach(() => {
      requestLogger = new RequestLogger({ logger: mockLogger });
    });

    it('should forward info calls to the underlying logger', () => {
      const data = { test: 'data' };
      const message = 'test message';
      requestLogger.info(data, message);
      expect(mockLogger.info).toHaveBeenCalledWith(data, message);
    });

    it('should forward error calls to the underlying logger', () => {
      const data = { error: 'test error' };
      const message = 'error message';
      requestLogger.error(data, message);
      expect(mockLogger.error).toHaveBeenCalledWith(data, message);
    });

    it('should forward warn calls to the underlying logger', () => {
      const data = { warning: 'test warning' };
      const message = 'warning message';
      requestLogger.warn(data, message);
      expect(mockLogger.warn).toHaveBeenCalledWith(data, message);
    });

    it('should forward debug calls to the underlying logger', () => {
      const data = { debug: 'test debug' };
      const message = 'debug message';
      requestLogger.debug(data, message);
      expect(mockLogger.debug).toHaveBeenCalledWith(data, message);
    });

    it('should forward fatal calls to the underlying logger', () => {
      const data = { fatal: 'test fatal' };
      const message = 'fatal message';
      requestLogger.fatal(data, message);
      expect(mockLogger.fatal).toHaveBeenCalledWith(data, message);
    });

    it('should forward trace calls to the underlying logger', () => {
      const data = { trace: 'test trace' };
      const message = 'trace message';
      requestLogger.trace(data, message);
      expect(mockLogger.trace).toHaveBeenCalledWith(data, message);
    });

    it('should forward info calls to the underlying logger', () => {
      const data = { info: 'test info' };
      const message = 'info message';
      requestLogger.info(data, message);
      expect(mockLogger.info).toHaveBeenCalledWith(data, message);
    });
    it('should forward silent calls to the underlying logger', () => {
      const data = { silent: 'test silent' };
      const message = 'silent message';
      requestLogger.silent(data, message);
      expect(mockLogger.silent).toHaveBeenCalledWith(data, message);
    });
  });

  describe('Step Management', () => {
    let parentLogger: RequestLogger;

    beforeEach(() => {
      parentLogger = new RequestLogger({ logger: mockLogger });
      requestLogger = new RequestLogger({
        logger: mockLogger,
        parent: parentLogger,
      });
    });

    it('should start a step, update currentStep and increment stepsCounter', () => {
      const step = { id: 'test-step' };
      requestLogger.startStep(step.id);
      expect(requestLogger.lastStep).toEqual(step);
      expect(requestLogger.stepsCounter).toBe(1);
      expect(mockLogger.info).toHaveBeenCalledWith(
        LOGS.STEP_START.logMessage(step.id),
        expect.objectContaining({
          logId: LOGS.STEP_START.logId,
          step: step.id,
          totalElapsedTime: 0,
        }),
      );
    });

    it('should start a step silently when config.silent is true', () => {
      const step = { id: 'test-step' };
      requestLogger.startStep(step.id, { silent: true });
      expect(requestLogger.lastStep).toEqual(step);
      expect(mockLogger.info).not.toHaveBeenCalled();
    });

    it('should end a step and log the elapsed time', () => {
      const step = { id: 'test-step' };
      requestLogger.startStep(step.id);

      // Mock a later time for the end step
      jest.useFakeTimers().setSystemTime(new Date(BASE_TIME + 100));
      requestLogger.endStep(step.id);

      expect(mockLogger.info).toHaveBeenCalledWith(
        LOGS.STEP_END.logMessage(step.id),
        expect.objectContaining({
          logId: LOGS.STEP_END.logId,
          step: step.id,
          elapsedTimeFromPreviousStep: 100,
          totalElapsedTime: 100,
        }),
      );
    });

    it('should end a step silently when config.silent is true', () => {
      const step = { id: 'test-step' };
      requestLogger.startStep(step.id, { silent: true });
      jest.useFakeTimers().setSystemTime(new Date(BASE_TIME + 100));
      requestLogger.endStep(step.id, { silent: true });
      expect(mockLogger.info).not.toHaveBeenCalled();
    });

    it('should handle ending a non-existent step gracefully', () => {
      const stepLabel = 'non-existent-step';
      expect(() => requestLogger.endStep(stepLabel)).not.toThrow();
    });

    it('should propagate step start to parent logger silently', () => {
      const step = { id: 'test-step' };
      requestLogger.startStep(step.id);
      expect(parentLogger.lastStep).toEqual(step);
      // Verify parent logger was called with silent config
      expect(mockLogger.info).toHaveBeenCalledTimes(1); // Only called once for child logger
    });

    it('should propagate step end to parent logger silently', () => {
      const step = { id: 'test-step' };
      requestLogger.startStep(step.id);
      jest.useFakeTimers().setSystemTime(new Date(BASE_TIME + 100));
      requestLogger.endStep(step.id);
      // Verify parent logger was called with silent config
      expect(mockLogger.info).toHaveBeenCalledTimes(2); // Only called twice for child logger
    });
  });

  describe('Timing Methods', () => {
    beforeEach(() => {
      requestLogger = new RequestLogger({ logger: mockLogger });
    });

    it('should calculate total elapsed time correctly', () => {
      // Mock a later time
      jest.useFakeTimers().setSystemTime(new Date(BASE_TIME + 500));
      expect(requestLogger.getTotalElapsedTime()).toBe(500);
    });

    it('should calculate step elapsed time correctly', () => {
      const stepLabel = 'test-step';
      requestLogger.startStep(stepLabel);

      // Mock a later time
      jest.useFakeTimers().setSystemTime(new Date(BASE_TIME + 300));
      expect(requestLogger.getStepElapsedTime(stepLabel)).toBe(300);
    });

    it('should return -1 for non-existent step elapsed time', () => {
      expect(requestLogger.getStepElapsedTime('non-existent-step')).toBe(-1);
    });
  });

  describe('Child Logger', () => {
    beforeEach(() => {
      requestLogger = new RequestLogger({ logger: mockLogger });
    });

    it('should create a child logger with the provided bindings', () => {
      const bindings: Bindings = { test: 'binding' };
      const options: ChildLoggerOptions = { level: 'debug' };

      const mockChildLogger = {} as FastifyBaseLogger;
      mockLogger.child.mockReturnValue(mockChildLogger);

      const childLogger = requestLogger.child(bindings, options);

      expect(mockLogger.child).toHaveBeenCalledWith(bindings, options);
      expect(childLogger).toBeInstanceOf(RequestLogger);
    });
  });
});
