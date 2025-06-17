import { FunctionLogger } from '../function-logger.class.js';
import { debug, error, info, warn } from 'firebase-functions/logger';

// Mock the firebase-functions/logger
jest.mock('firebase-functions/logger', () => ({
  debug: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
}));

describe(FunctionLogger.name, () => {
  let logger: FunctionLogger;

  beforeEach(() => {
    logger = new FunctionLogger();
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('debug', () => {
    it('should call firebase debug logger with data and message', () => {
      const testData = { key: 'value' };
      const testMessage = 'Debug message';

      logger.debug(testData, testMessage);

      expect(debug).toHaveBeenCalledWith(testData, testMessage);
    });

    it('should call firebase debug logger with only data when no message provided', () => {
      const testData = { key: 'value' };

      logger.debug(testData);

      expect(debug).toHaveBeenCalledWith(testData, undefined);
    });
  });

  describe('error', () => {
    it('should call firebase error logger with data and message', () => {
      const testData = { key: 'value' };
      const testMessage = 'Error message';

      logger.error(testData, testMessage);

      expect(error).toHaveBeenCalledWith(testData, testMessage);
    });

    it('should call firebase error logger with only data when no message provided', () => {
      const testData = { key: 'value' };

      logger.error(testData);

      expect(error).toHaveBeenCalledWith(testData, undefined);
    });
  });

  describe('info', () => {
    it('should call firebase info logger with data and message', () => {
      const testData = { key: 'value' };
      const testMessage = 'Info message';

      logger.info(testData, testMessage);

      expect(info).toHaveBeenCalledWith(testData, testMessage);
    });

    it('should call firebase info logger with only data when no message provided', () => {
      const testData = { key: 'value' };

      logger.info(testData);

      expect(info).toHaveBeenCalledWith(testData, undefined);
    });
  });

  describe('warn', () => {
    it('should call firebase warn logger with data and message', () => {
      const testData = { key: 'value' };
      const testMessage = 'Warning message';

      logger.warn(testData, testMessage);

      expect(warn).toHaveBeenCalledWith(testData, testMessage);
    });

    it('should call firebase warn logger with only data when no message provided', () => {
      const testData = { key: 'value' };

      logger.warn(testData);

      expect(warn).toHaveBeenCalledWith(testData, undefined);
    });
  });
}); 