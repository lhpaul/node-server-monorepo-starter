import { onScheduleWrapper } from '../../utils/schedulers/schedulers.utils';
import { HANDLER_NAME } from './check-for-about-to-expire-subscriptions.scheduler.constants';

export const checkForAboutToExpireSubscriptionsFunction = onScheduleWrapper(
  HANDLER_NAME,
  'every day 00:00',
  async () => {
    console.log('Checking for about to expire subscriptions');
    // Get subscription that are about to expire in the next 30 days
    // For every subscription, if the day to expire is divisible by 7, publish to pubsub topic for sending email to the user
  }
);
