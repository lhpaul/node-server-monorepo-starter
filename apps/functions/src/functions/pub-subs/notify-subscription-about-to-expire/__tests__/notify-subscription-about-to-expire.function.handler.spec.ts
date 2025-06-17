import { NotifySubscriptionAboutToExpireMessage } from '@repo/shared/domain';
import { wait } from '@repo/shared/utils';
import { CloudEvent } from 'firebase-functions/core';
import { MessagePublishedData } from 'firebase-functions/v2/pubsub';

import { FunctionLogger } from '../../../../utils/logging/function-logger.class';
import { notifySubscriptionAboutToExpireHandler } from '../notify-subscription-about-to-expire.function.handler.js';
import { LOGS } from '../notify-subscription-about-to-expire.function.constants.js';

jest.mock('@repo/shared/utils');


describe(notifySubscriptionAboutToExpireHandler.name, () => {
  let mockLogger: jest.Mocked<FunctionLogger>;
  let mockMessage: NotifySubscriptionAboutToExpireMessage;
  let mockEvent: CloudEvent<MessagePublishedData<NotifySubscriptionAboutToExpireMessage>>;

  beforeEach(() => {
    mockLogger = {
      error: jest.fn(),
    } as unknown as jest.Mocked<FunctionLogger>;

    mockMessage = {} as NotifySubscriptionAboutToExpireMessage;
    mockEvent = {} as CloudEvent<MessagePublishedData<NotifySubscriptionAboutToExpireMessage>>;
  });

  it('should throw an error when an unknown error occurs', async () => {
    const error = new Error('Test error');
    jest.mocked(wait).mockRejectedValue(error);
    await expect(
      notifySubscriptionAboutToExpireHandler(mockMessage, mockLogger, mockEvent)
    ).rejects.toThrow(error);

    expect(mockLogger.error).toHaveBeenCalledWith(
      {
        logId: LOGS.UNKNOWN_ERROR.logId,
        error,
      },
      LOGS.UNKNOWN_ERROR.logMessage
    );
  });

  // TODO: Add more test cases once the implementation is complete
  // These could include:
  // - Successful notification scenario
  // - Different error scenarios
  // - Edge cases
}); 