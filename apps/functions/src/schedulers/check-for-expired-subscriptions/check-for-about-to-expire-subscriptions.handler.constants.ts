export const HANDLER_NAME = 'checkForAboutToExpireSubscriptions';

export const SCHEDULE = 'every day 00:00';

export const DAYS_TO_EXPIRE_TO_NOTIFY = [7, 14, 28];

export const STEPS = {
  GET_SUBSCRIPTIONS: 'get-subscriptions',
  NOTIFY_SUBSCRIPTIONS: 'notify-subscriptions',
};

export const LOGS = {
  NOTIFY_SUBSCRIPTION: {
    logMessage: (daysToExpire: number, aboutToExpireSubscriptionsCount: number) => `Notifying ${aboutToExpireSubscriptionsCount} subscriptions about to expire in ${daysToExpire} days`,
    logId: 'notify-subscription',
  },
};
