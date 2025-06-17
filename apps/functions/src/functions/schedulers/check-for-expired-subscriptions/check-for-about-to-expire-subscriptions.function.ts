import { onScheduleWrapper } from '../../../utils/schedulers/schedulers.utils';
import { HANDLER_NAME, SCHEDULE } from './check-for-about-to-expire-subscriptions.function.constants';
import { checkForAboutToExpireSubscriptionsHandler } from './check-for-about-to-expire-subscriptions.function.handler';

export const checkForAboutToExpireSubscriptionsFunction = onScheduleWrapper(
  HANDLER_NAME,
  SCHEDULE,
  checkForAboutToExpireSubscriptionsHandler
);