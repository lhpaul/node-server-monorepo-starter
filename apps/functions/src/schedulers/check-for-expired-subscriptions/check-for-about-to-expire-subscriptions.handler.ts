import { NotifySubscriptionAboutToExpireMessage } from '@repo/shared/domain';
import { SubscriptionsService } from '@repo/shared/services';
import { publishMessage } from '@repo/shared/utils';

import { NOTIFY_SUBSCRIPTION_ABOUT_TO_EXPIRE_TOPIC } from '../../pub-subs/notify-subscription-about-to-expire/notify-subscription-about-to-expire.handler.constants';
import { FunctionLogger } from '../../utils/logging/function-logger.class';
import { onScheduleWrapper } from '../../utils/schedulers/schedulers.utils';
import { DAYS_TO_EXPIRE_TO_NOTIFY, HANDLER_NAME, LOGS, SCHEDULE, STEPS } from './check-for-about-to-expire-subscriptions.handler.constants';

export const checkForAboutToExpireSubscriptionsHandler = onScheduleWrapper(
  HANDLER_NAME,
  SCHEDULE,
  async (logger: FunctionLogger) => {
    logger.startStep(STEPS.GET_SUBSCRIPTIONS);
    const subscriptionsSvc = SubscriptionsService.getInstance();
    const aboutToExpireSubscriptionsPerInterval = await Promise.all(DAYS_TO_EXPIRE_TO_NOTIFY.map((daysToExpire) => subscriptionsSvc.getAboutToExpireSubscriptions(daysToExpire, logger)))
    .finally(() => logger.endStep(STEPS.GET_SUBSCRIPTIONS));

    for (const index in DAYS_TO_EXPIRE_TO_NOTIFY) {
      const daysToExpire = DAYS_TO_EXPIRE_TO_NOTIFY[index];
      const aboutToExpireSubscriptions = aboutToExpireSubscriptionsPerInterval[index];
      logger.info({
        logId: LOGS.NOTIFY_SUBSCRIPTION.logId,
        daysToExpire,
        aboutToExpireSubscriptionsCount: aboutToExpireSubscriptions.length,
      }, LOGS.NOTIFY_SUBSCRIPTION.logMessage(daysToExpire, aboutToExpireSubscriptions.length));
      for (const subscription of aboutToExpireSubscriptions) {
        const logId = `${STEPS.NOTIFY_SUBSCRIPTIONS}-${subscription.id}`;
        logger.startStep(logId);
        await publishMessage<NotifySubscriptionAboutToExpireMessage>(NotifySubscriptionAboutToExpireMessage, NOTIFY_SUBSCRIPTION_ABOUT_TO_EXPIRE_TOPIC, {
          companyId: subscription.companyId,
          daysToExpire,
        }, logger, {
          source: HANDLER_NAME,
        })
        .finally(() => logger.endStep(logId));
      }
    }
  }
);
