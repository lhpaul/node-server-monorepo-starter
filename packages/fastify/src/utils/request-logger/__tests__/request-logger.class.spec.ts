import { RequestLogger } from '../request-logger.class';
import { FastifyBaseLogger } from 'fastify';
import { Bindings } from 'pino';

describe(RequestLogger.name, () => {
  let mockLogger: jest.Mocked<FastifyBaseLogger>;
  let requestLogger: RequestLogger;

  beforeEach(() => {
    mockLogger = {
      child: jest.fn().mockImplementation(() => mockLogger),
      debug: jest.fn(),
      error: jest.fn(),
      fatal: jest.fn(),
      info: jest.fn(),
      silent: jest.fn(),
      trace: jest.fn(),
      warn: jest.fn(),
      level: 'info',
    } as unknown as jest.Mocked<FastifyBaseLogger>;

    requestLogger = new RequestLogger({ logger: mockLogger });
  });

  describe('level', () => {
    it('should return the logger level', () => {
      expect(requestLogger.level).toBe('info');
    });
  });

  describe('child', () => {
    it('should create a child logger with bindings and parent bindings', () => {
      const parentBindings: Bindings = { requestId: '123' };
      requestLogger = new RequestLogger({ logger: mockLogger, bindings: parentBindings });
      const bindings: Bindings = { requestId: '123' };
      const childLogger = requestLogger.child(bindings);

      expect(mockLogger.child).toHaveBeenCalledWith({ ...parentBindings, ...bindings }, undefined);
      expect(childLogger).toBeInstanceOf(RequestLogger);
    });

    it('should create a child logger with bindings and options', () => {
      const bindings: Bindings = { requestId: '123' };
      const options = { redact: ['password'] };
      const childLogger = requestLogger.child(bindings, options);

      expect(mockLogger.child).toHaveBeenCalledWith(bindings, options);
      expect(childLogger).toBeInstanceOf(RequestLogger);
    });
  });

  describe('bindings', () => {
    describe('when there are no bindings', () => {
      it('should return empty object', () => {
        const requestLogger = new RequestLogger({ logger: mockLogger });
        expect(requestLogger.bindings).toEqual({});
      });
    });
    describe('when there are bindings', () => {
      it('should return the bindings', () => {
      const testBindings: Bindings = { requestId: '123' };
      const requestLogger = new RequestLogger({ logger: mockLogger, bindings: testBindings });
        expect(requestLogger.bindings).toEqual(testBindings);
      });
    });
  });

  describe('logging methods', () => {
    const testData = { key: 'value' };
    const testMessage = 'test message';

    describe('when the are no bindings', () => {
      beforeEach(() => {
        requestLogger = new RequestLogger({ logger: mockLogger });
      });
      it('should call debug with data and message', () => {
        requestLogger.debug(testData, testMessage);
        expect(mockLogger.debug).toHaveBeenCalledWith(testData, testMessage);
      });
  
      it('should call error with data and message', () => {
        requestLogger.error(testData, testMessage);
        expect(mockLogger.error).toHaveBeenCalledWith(testData, testMessage);
      });
  
      it('should call fatal with data and message', () => {
        requestLogger.fatal(testData, testMessage);
        expect(mockLogger.fatal).toHaveBeenCalledWith(testData, testMessage);
      });
  
      it('should call info with data and message', () => {
        requestLogger.info(testData, testMessage);
        expect(mockLogger.info).toHaveBeenCalledWith(testData, testMessage);
      });
  
      it('should call silent with data and message', () => {
        requestLogger.silent(testData, testMessage);
        expect(mockLogger.silent).toHaveBeenCalledWith(testData, testMessage);
      });
  
      it('should call trace with data and message', () => {
        requestLogger.trace(testData, testMessage);
        expect(mockLogger.trace).toHaveBeenCalledWith(testData, testMessage);
      });
  
      it('should call warn with data and message', () => {
        requestLogger.warn(testData, testMessage);
        expect(mockLogger.warn).toHaveBeenCalledWith(testData, testMessage);
      });
    });
    describe('when there are bindings', () => {
      const testBindings: Bindings = { requestId: '123' };
      beforeEach(() => {
        requestLogger = new RequestLogger({ logger: mockLogger, bindings: testBindings });
      });
      it('should call debug with data and message', () => {
        requestLogger.debug(testData, testMessage);
        expect(mockLogger.debug).toHaveBeenCalledWith({ ...testData, ...testBindings }, testMessage);
      });
      it('should call error with data and message', () => {
        requestLogger.error(testData, testMessage);
        expect(mockLogger.error).toHaveBeenCalledWith({ ...testData, ...testBindings }, testMessage);
      });
      it('should call fatal with data and message', () => {
        requestLogger.fatal(testData, testMessage);
        expect(mockLogger.fatal).toHaveBeenCalledWith({ ...testData, ...testBindings }, testMessage);
      });
      it('should call info with data and message', () => {
        requestLogger.info(testData, testMessage);
        expect(mockLogger.info).toHaveBeenCalledWith({ ...testData, ...testBindings }, testMessage);
      });
    });
  });
});
