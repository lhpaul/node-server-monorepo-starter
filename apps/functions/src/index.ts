import * as admin from 'firebase-admin';

import { checkForAboutToExpireSubscriptionsHandler } from './schedulers/check-for-expired-subscriptions/check-for-about-to-expire-subscriptions.handler';
import { notifySubscriptionAboutToExpireHandler } from './pubsubs/notify-subscription-about-to-expire/notify-subscription-about-to-expire.handler';

admin.initializeApp();

// Pub/Subs
export const pubsubs = {
  notifySubscriptionAboutToExpire: notifySubscriptionAboutToExpireHandler,
};

// Schedulers
export const schedulers = {
  checkForAboutToExpireSubscriptions: checkForAboutToExpireSubscriptionsHandler,
};