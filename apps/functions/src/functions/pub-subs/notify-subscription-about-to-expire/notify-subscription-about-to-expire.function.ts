import { NotifySubscriptionAboutToExpireMessage } from '@repo/shared/domain';

import { onMessagePublishedWrapper } from '../../../utils/pub-subs/pub-subs.utils';
import { NOTIFY_SUBSCRIPTION_ABOUT_TO_EXPIRE_TOPIC } from './notify-subscription-about-to-expire.function.constants';
import { notifySubscriptionAboutToExpireHandler } from './notify-subscription-about-to-expire.function.handler';

export const notifySubscriptionAboutToExpireFunction = onMessagePublishedWrapper<NotifySubscriptionAboutToExpireMessage>(
  NotifySubscriptionAboutToExpireMessage,
  NOTIFY_SUBSCRIPTION_ABOUT_TO_EXPIRE_TOPIC,
  notifySubscriptionAboutToExpireHandler
);