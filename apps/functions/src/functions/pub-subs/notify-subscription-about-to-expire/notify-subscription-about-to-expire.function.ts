import { NotifySubscriptionAboutToExpireMessage } from '@repo/shared/domain';

import { onMessagePublishedWrapper } from '../../../utils/pub-subs/pub-subs.utils';
import { MAX_INSTANCES, NOTIFY_SUBSCRIPTION_ABOUT_TO_EXPIRE_TOPIC } from './notify-subscription-about-to-expire.function.constants';
import { notifySubscriptionAboutToExpireHandler } from './notify-subscription-about-to-expire.function.handler';

export const notifySubscriptionAboutToExpireFunction = onMessagePublishedWrapper<NotifySubscriptionAboutToExpireMessage>(
  NotifySubscriptionAboutToExpireMessage,
  notifySubscriptionAboutToExpireHandler,
  {
    topic: NOTIFY_SUBSCRIPTION_ABOUT_TO_EXPIRE_TOPIC,
    maxInstances: MAX_INSTANCES,
  }
);