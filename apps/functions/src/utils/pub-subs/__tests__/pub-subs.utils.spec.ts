import { maskFields, printError } from '@repo/shared/utils';
import { validate } from 'class-validator';
import { CloudEvent } from 'firebase-functions/core';
import { MessagePublishedData } from 'firebase-functions/v2/pubsub';

import { FunctionLogger } from '../../logging/function-logger.class';
import { onMessagePublishedWrapper } from '../pub-subs.utils';
import { LOG_GROUP, LOGS, STEPS } from '../pub-subs.utils.constants';

jest.mock('@repo/shared/utils');
jest.mock('class-validator');
jest.mock('../../logging/function-logger.class');

class MessageClass{
  value: string;
  constructor(data: { value: string }) {
    this.value = data.value;
  }
}

describe(onMessagePublishedWrapper.name, () => {
  const mockTopic = 'test-topic';
  const mockMessage = { value: 'test-value' };
  const mockEvent = {
    data: {
      message: {
        json: mockMessage,
      },
    },
  } as CloudEvent<MessagePublishedData<{ value: string }>>;

  const mockHandler = jest.fn();
  const mockLogger = {
    info: jest.fn(),
    startStep: jest.fn(),
    endStep: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  } as unknown as FunctionLogger;

  const printedErrorMock = 'printed error';
  const logGroup = `${LOG_GROUP}.${onMessagePublishedWrapper.name}`;

  beforeEach(() => {
    jest.clearAllMocks();
    (FunctionLogger as jest.Mock).mockImplementation(() => mockLogger);
    (maskFields as jest.Mock).mockImplementation((obj) => obj);
    (printError as jest.Mock).mockReturnValue(printedErrorMock);
  });

  it('should process valid message successfully', async () => {
    (validate as jest.Mock).mockResolvedValueOnce([]);
    
    const wrapper = onMessagePublishedWrapper(MessageClass, mockHandler, {
      topic: mockTopic,
    });
    await wrapper(mockEvent);

    expect(mockLogger.info).toHaveBeenCalledWith(
      {
        logId: LOGS.MESSAGE_RECEIVED.logId,
        message: mockMessage,
      },
      LOGS.MESSAGE_RECEIVED.logMessage
    );
    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.VALIDATE_MESSAGE.label, logGroup);
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.VALIDATE_MESSAGE.label);
    expect(mockHandler).toHaveBeenCalledWith(expect.any(Object), mockLogger, mockEvent);
  });

  it('should mask message fields when options are provided', async () => {
    (validate as jest.Mock).mockResolvedValueOnce([]);
    const maskedMessage = { value: '***' };
    (maskFields as jest.Mock).mockReturnValueOnce(maskedMessage);

    const wrapper = onMessagePublishedWrapper(class {
      value: string;
      constructor(data: { value: string }) {
        this.value = data.value;
      }
    }, mockHandler, {
      topic: mockTopic,
      maskMessageFields: ['value'],
    });
    await wrapper(mockEvent);

    expect(mockLogger.info).toHaveBeenCalledWith(
      {
        logId: LOGS.MESSAGE_RECEIVED.logId,
        message: maskedMessage,
      },
      LOGS.MESSAGE_RECEIVED.logMessage
    );
  });

  it('should handle invalid message format', async () => {
    const validationErrors = [{ property: 'value', constraints: { isNotEmpty: 'value should not be empty' } }];
    (validate as jest.Mock).mockResolvedValueOnce(validationErrors);

    const wrapper = onMessagePublishedWrapper(class {
      value: string;
      constructor(data: { value: string }) {
        this.value = data.value;
      }
    }, mockHandler, {
      topic: mockTopic,
    });
    await wrapper(mockEvent);
    expect(printError).toHaveBeenCalledWith(validationErrors);
    expect(mockLogger.warn).toHaveBeenCalledWith(
      {
        logId: LOGS.INVALID_MESSAGE_FORMAT.logId,
        errors: printedErrorMock,
      },
      LOGS.INVALID_MESSAGE_FORMAT.logMessage
    );
    expect(mockHandler).not.toHaveBeenCalled();
  });

  it('should handle unknown errors', async () => {
    const error = new Error('Test error');
    (validate as jest.Mock).mockRejectedValueOnce(error);

    const wrapper = onMessagePublishedWrapper(class {
      value: string;
      constructor(data: { value: string }) {
        this.value = data.value;
      }
    }, mockHandler, {
      topic: mockTopic,
    });
    await expect(wrapper(mockEvent)).rejects.toThrow('Test error');
    expect(printError).toHaveBeenCalledWith(error);
    expect(mockLogger.error).toHaveBeenCalledWith(
      {
        logId: LOGS.UNKNOWN_ERROR.logId,
        error: printedErrorMock,
      },
      LOGS.UNKNOWN_ERROR.logMessage
    );
  });
}); 