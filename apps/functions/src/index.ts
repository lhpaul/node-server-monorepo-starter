import * as admin from 'firebase-admin';

import { checkForAboutToExpireSubscriptionsHandler } from './schedulers/check-for-expired-subscriptions/check-for-about-to-expire-subscriptions.handler';
import { notifySubscriptionAboutToExpireHandler } from './pub-subs/notify-subscription-about-to-expire/notify-subscription-about-to-expire.handler';

admin.initializeApp();

// Pub/Subs
export const pubSubs = {
  notifySubscriptionAboutToExpire: notifySubscriptionAboutToExpireHandler,
};

// Schedulers
export const schedulers = {
  checkForAboutToExpireSubscriptions: checkForAboutToExpireSubscriptionsHandler,
};