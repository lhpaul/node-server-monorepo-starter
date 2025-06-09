import { validate } from 'class-validator';
import { onMessagePublished } from 'firebase-functions/v2/pubsub';

import { FunctionLogger } from '../../utils/logging/function-logger.class';
import { LOGS, NOTIFY_SUBSCRIPTION_ABOUT_TO_EXPIRE_TOPIC, STEPS } from './notify-subscription-about-to-expire.pubsub.constants';
import { NotifySubscriptionAboutToExpirePubSubMessage } from './notify-subscription-about-to-expire.pubsub.dtos';

export const notifySubscriptionAboutToExpirePubSub = onMessagePublished(
  NOTIFY_SUBSCRIPTION_ABOUT_TO_EXPIRE_TOPIC,
  async (event) => {
    const logger = new FunctionLogger();
    try {
      const message = event.data.message.json as NotifySubscriptionAboutToExpirePubSubMessage;
      logger.startStep(STEPS.VALIDATE_MESSAGE.label);
      const errors = await validate(message)
        .finally(() => logger.endStep(STEPS.VALIDATE_MESSAGE.label));
      if (errors.length > 0) {
        logger.warn({
          logId: LOGS.INVALID_MESSAGE_FORMAT.logId,
          errors,
        }, LOGS.INVALID_MESSAGE_FORMAT.logMessage);
        return;
      }
      logger.info({
        logId: LOGS.MESSAGE_RECEIVED.logId,
        message,
      }, LOGS.MESSAGE_RECEIVED.logMessage);

      // TODO: Implement the logic to notify the subscription about to expire
    } catch (error) {
      logger.error({
        logId: LOGS.UNKNOWN_ERROR.logId,
        error,
      }, LOGS.UNKNOWN_ERROR.logMessage);
      throw error;
    }
  },
);
