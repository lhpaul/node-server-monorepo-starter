import * as admin from 'firebase-admin';

import { notifySubscriptionAboutToExpireFunction } from './functions/pub-subs/notify-subscription-about-to-expire/notify-subscription-about-to-expire.function';
import { checkForAboutToExpireSubscriptionsFunction } from './functions/schedulers/check-for-expired-subscriptions/check-for-about-to-expire-subscriptions.function';

admin.initializeApp();

// Pub/Subs
export const pubSubs = {
  notifySubscriptionAboutToExpire: notifySubscriptionAboutToExpireFunction,
};

// Schedulers
export const schedulers = {
  checkForAboutToExpireSubscriptions: checkForAboutToExpireSubscriptionsFunction,
};