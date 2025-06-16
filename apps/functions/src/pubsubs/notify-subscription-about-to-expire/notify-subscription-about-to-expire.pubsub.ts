import { LOGS, NOTIFY_SUBSCRIPTION_ABOUT_TO_EXPIRE_TOPIC } from './notify-subscription-about-to-expire.pubsub.constants';
import { NotifySubscriptionAboutToExpirePubSubMessage } from './notify-subscription-about-to-expire.pubsub.interfaces';
import { onMessagePublishedWrapper } from '../../utils/pub-subs/pubsub.utils';

export const notifySubscriptionAboutToExpirePubSub = onMessagePublishedWrapper<NotifySubscriptionAboutToExpirePubSubMessage>(
  NotifySubscriptionAboutToExpirePubSubMessage,
  NOTIFY_SUBSCRIPTION_ABOUT_TO_EXPIRE_TOPIC,
  async (_message, logger, _event) => {
    try {
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
