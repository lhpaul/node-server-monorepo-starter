import { NotifySubscriptionAboutToExpireMessage } from '@repo/shared/domain';
import { wait } from '@repo/shared/utils';
import { CloudEvent } from 'firebase-functions/core';
import { MessagePublishedData } from 'firebase-functions/v2/pubsub';

import { FunctionLogger } from '../../../utils/logging/function-logger.class';
import { LOGS } from './notify-subscription-about-to-expire.function.constants';

export async function notifySubscriptionAboutToExpireHandler(
  _message: NotifySubscriptionAboutToExpireMessage,
  logger: FunctionLogger,
  _event: CloudEvent<MessagePublishedData<NotifySubscriptionAboutToExpireMessage>>
): Promise<void> {
    try {
      // TODO: Implement the logic to notify the subscription about to expire
      await wait(1000); // this is just to simulate a delay
    } catch (error) {
      logger.error({
        logId: LOGS.UNKNOWN_ERROR.logId,
        error,
      }, LOGS.UNKNOWN_ERROR.logMessage);
      throw error;
    }
  }
