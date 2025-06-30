import { validate } from 'class-validator';

import { ExecutionLogger } from '../../../definitions';
import { publishMessage } from '../pub-subs.utils';
import { LOG_GROUP, LOGS, STEPS } from '../pub-subs.utils.constants';
import { printError } from '../../errors/errors.utils';
import { PubSubsService } from '../../../services';


jest.mock('class-validator', () => ({
  validate: jest.fn(),
}));

jest.mock('../../services');

jest.mock('../../errors/errors.utils', () => ({
  printError: jest.fn(),
}));

const mockStartStep = jest.fn();
const mockEndStep = jest.fn();
const mockWarn = jest.fn();
const mockError = jest.fn();
const mockLogger = {
  startStep: mockStartStep,
  endStep: mockEndStep,
  warn: mockWarn,
  error: mockError,
} as unknown as ExecutionLogger;

const mockPublishToTopic = jest.fn();
const mockTopic = 'topic';
const mockPrintedError = 'printed error';


describe(publishMessage.name, () => {
  const logGroup = `${LOG_GROUP}.${publishMessage.name}`;
  class DummyClass {
    value: string;
    constructor(values: Required<DummyClass>) {
      Object.assign(this, values);
    }
  }

  beforeEach(() => {
    (printError as jest.Mock).mockReturnValue(mockPrintedError);
    jest.clearAllMocks();
  });

  it('should log a warning and not publish if validation fails', async () => {
    const errors = [{ error: 'invalid' }];
    (validate as jest.Mock).mockResolvedValueOnce(errors);
    const message = { value: 'bar' };
    await publishMessage(DummyClass, 'topic', message, mockLogger);
    expect(mockWarn).toHaveBeenCalledWith(
      {
        logId: LOGS.INVALID_MESSAGE_FORMAT.logId,
        errors: mockPrintedError,
      },
      LOGS.INVALID_MESSAGE_FORMAT.logMessage,
    );
    expect(mockPublishToTopic).not.toHaveBeenCalled();
  });

  it('should validate and publish message if valid', async () => {
    jest.spyOn(PubSubsService, 'getInstance').mockImplementation(() => ({
      publishToTopic: mockPublishToTopic,
    }) as unknown as PubSubsService);
    (validate as jest.Mock).mockResolvedValueOnce([]);
    const message = { value: 'bar' };
    await publishMessage(DummyClass, mockTopic, message, mockLogger);
    expect(mockStartStep).toHaveBeenCalledWith(STEPS.VALIDATE_MESSAGE.label, logGroup);
    expect(mockEndStep).toHaveBeenCalledWith(STEPS.VALIDATE_MESSAGE.label);
    expect(mockWarn).not.toHaveBeenCalled();
    expect(mockPublishToTopic).toHaveBeenCalledWith(mockTopic, mockLogger, expect.any(DummyClass), undefined);
  });

  it('should log and throw on unknown error', async () => {
    (validate as jest.Mock).mockImplementationOnce(() => { throw new Error('fail'); });
    const message = { value: 'bar' };
    await expect(publishMessage(DummyClass, mockTopic, message, mockLogger)).rejects.toThrow('fail');
    expect(mockError).toHaveBeenCalledWith(
      {
        logId: LOGS.UNKNOWN_ERROR.logId,
        error: mockPrintedError,
      },
      LOGS.UNKNOWN_ERROR.logMessage,
    );
  });
}); 