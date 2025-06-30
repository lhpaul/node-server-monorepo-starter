import { onSchedule } from 'firebase-functions/v2/scheduler';
import { FunctionLogger } from '../../logging/function-logger.class';
import { onScheduleWrapper } from '../schedulers.utils';
import { LOG_GROUP, LOGS, SCHEDULE_DEFAULT_OPTIONS, STEPS } from '../schedulers.utils.constants';

jest.mock('firebase-functions/v2/scheduler', () => ({
  onSchedule: jest.fn(),
}));

jest.mock('../../logging/function-logger.class');

describe(onScheduleWrapper.name, () => {
  let mockLogger: jest.Mocked<FunctionLogger>;
  let mockHandler: jest.Mock;
  let mockEvent: any;

  const logGroup = `${LOG_GROUP}.${onScheduleWrapper.name}`;

  beforeEach(() => {
    mockLogger = {
      info: jest.fn(),
      startStep: jest.fn(),
      endStep: jest.fn(),
    } as unknown as jest.Mocked<FunctionLogger>;

    mockHandler = jest.fn().mockResolvedValue(undefined);
    mockEvent = { type: 'test-event' };
    
    (FunctionLogger as jest.Mock).mockImplementation(() => mockLogger);

  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a scheduler with default options', () => {
    const schedule = 'every 1 hours';
    const handlerName = 'testHandler';

    onScheduleWrapper(handlerName, schedule, mockHandler);

    expect(onSchedule).toHaveBeenCalledWith(
      {
        ...SCHEDULE_DEFAULT_OPTIONS,
        schedule,
      },
      expect.any(Function)
    );
  });

  it('should create a scheduler with custom options', () => {
    const schedule = 'every 1 hours';
    const handlerName = 'testHandler';
    const customOptions = { timeZone: 'UTC', schedule };

    onScheduleWrapper(handlerName, schedule, mockHandler, customOptions);

    expect(onSchedule).toHaveBeenCalledWith(
      {
        ...SCHEDULE_DEFAULT_OPTIONS,
        ...customOptions,
        schedule,
      },
      expect.any(Function)
    );
  });

  it('should log scheduler start information', () => {
    const schedule = 'every 1 hours';
    const handlerName = 'testHandler';

    onScheduleWrapper(handlerName, schedule, mockHandler);

    expect(mockLogger.info).toHaveBeenCalledWith(
      {
        logId: LOGS.SCHEDULER_STARTED.logId,
        schedule,
        handler: handlerName,
      },
      LOGS.SCHEDULER_STARTED.logMessage
    );
  });

  it('should start and end steps correctly', async () => {
    const schedule = 'every 1 hours';
    const handlerName = 'testHandler';
    
    onScheduleWrapper(handlerName, schedule, mockHandler);

    // Get the handler function passed to onSchedule
    const scheduleHandler = (onSchedule as jest.Mock).mock.calls[0][1];

    // Execute the handler
    await scheduleHandler(mockEvent);

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.SCHEDULER_STARTED.label, logGroup);
    expect(mockHandler).toHaveBeenCalledWith(mockLogger, mockEvent);
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.SCHEDULER_STARTED.label);
  });

  it('should handle handler errors and still end step', async () => {
    const schedule = 'every 1 hours';
    const handlerName = 'testHandler';
    const error = new Error('Test error');
    mockHandler.mockRejectedValue(error);

    onScheduleWrapper(handlerName, schedule, mockHandler);

    // Get the handler function passed to onSchedule
    const scheduleHandler = (onSchedule as jest.Mock).mock.calls[0][1];

    // Execute the handler and expect it to throw
    await expect(scheduleHandler(mockEvent)).rejects.toThrow(error);

    // Verify step was still ended
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.SCHEDULER_STARTED.label);
  });
}); 