import { BasicExecutionLogger } from '../basic-execution-logger.class';
import { LOGS } from '../basic-execution-logger.class.constants';

describe(BasicExecutionLogger.name, () => {
  let logger: BasicExecutionLogger;

  beforeEach(() => {
    logger = new BasicExecutionLogger();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with default values', () => {
      expect(logger.initTime).toBeDefined();
      expect(logger.lastStep).toEqual({ id: '' });
      expect(logger.stepsCounter).toBe(0);
    });
  });

  describe('logging methods', () => {
    const testData = { test: 'data' };
    const testMessage = 'test message';

    it('should log info', () => {
      const spy = jest.spyOn(console, 'info').mockImplementation();
      logger.info(testData, testMessage);
      expect(spy).toHaveBeenCalledWith(testData, testMessage);
    });

    it('should log error', () => {
      const spy = jest.spyOn(console, 'error').mockImplementation();
      logger.error(testData, testMessage);
      expect(spy).toHaveBeenCalledWith(testData, testMessage);
    });

    it('should log warn', () => {
      const spy = jest.spyOn(console, 'warn').mockImplementation();
      logger.warn(testData, testMessage);
      expect(spy).toHaveBeenCalledWith(testData, testMessage);
    });

    it('should log debug', () => {
      const spy = jest.spyOn(console, 'debug').mockImplementation();
      logger.debug(testData, testMessage);
      expect(spy).toHaveBeenCalledWith(testData, testMessage);
    });

    it('should log trace', () => {
      const spy = jest.spyOn(console, 'trace').mockImplementation();
      logger.trace(testData, testMessage);
      expect(spy).toHaveBeenCalledWith(testData, testMessage);
    });
  });

  describe('time tracking', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });
  
    afterEach(() => {
      jest.useRealTimers();
    });
    it('should get total elapsed time', () => {
      const initialTime = new Date().getTime();
      jest.setSystemTime(initialTime);
      const logger = new BasicExecutionLogger();
      
      jest.setSystemTime(initialTime + 1000);
      expect(logger.getTotalElapsedTime()).toBe(1000);
    });

    it('should get step elapsed time', () => {
      const stepLabel = 'test-step';
      const initialTime = new Date().getTime();
      jest.setSystemTime(initialTime);
      
      logger.startStep(stepLabel);
      jest.setSystemTime(initialTime + 500);
      
      expect(logger.getStepElapsedTime(stepLabel)).toBe(500);
    });

    it('should return -1 for non-existent step', () => {
      expect(logger.getStepElapsedTime('non-existent')).toBe(-1);
    });
  });

  describe('step management', () => {
    let consoleSpy: jest.SpyInstance;
    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'info').mockImplementation();
      jest.useFakeTimers();
    });
    afterEach(() => {
      consoleSpy.mockRestore();
      jest.useRealTimers();
    });
    const stepLabel = 'test-step';

    it('should start a step', () => {
      logger.startStep(stepLabel);
      expect(logger.lastStep).toEqual({ id: stepLabel });
      expect(logger.stepsCounter).toBe(1);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          logId: LOGS.STEP_START.logId,
          step: stepLabel,
        }),
        expect.any(String)
      );
    });

    it('should start a step silently', () => {
      logger.startStep(stepLabel, { silent: true });
      expect(logger.lastStep).toEqual({ id: stepLabel });
      expect(logger.stepsCounter).toBe(1);
      expect(consoleSpy).not.toHaveBeenCalled();
    });

    it('should end a step', () => {
      logger.startStep(stepLabel);
      jest.advanceTimersByTime(1000);
      consoleSpy.mockClear(); // Clear previous calls
      logger.endStep(stepLabel);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        {
          logId: LOGS.STEP_END.logId,
          step: stepLabel,
          elapsedTimeFromPreviousStep: 1000,
          totalElapsedTime: 1000,
        },
        undefined
      );
    });

    it('should end a step silently', () => {
      logger.startStep(stepLabel);
      jest.advanceTimersByTime(1000);
      consoleSpy.mockClear(); // Clear previous calls
      logger.endStep(stepLabel, { silent: true });
      
      expect(consoleSpy).not.toHaveBeenCalled();
    });

    it('should handle parent logger steps', () => {
      const parentLogger = new BasicExecutionLogger();
      const childLogger = new BasicExecutionLogger({ parent: parentLogger });
      
      const parentSpy = jest.spyOn(parentLogger, 'startStep');
      const parentEndSpy = jest.spyOn(parentLogger, 'endStep');
      
      childLogger.startStep(stepLabel);
      expect(parentSpy).toHaveBeenCalledWith(stepLabel, { silent: true });
      
      childLogger.endStep(stepLabel);
      expect(parentEndSpy).toHaveBeenCalledWith(stepLabel, { silent: true });
    });

    it('should not throw when ending non-existent step', () => {
      expect(() => logger.endStep('non-existent')).not.toThrow();
    });
  });
});
