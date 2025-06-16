import * as admin from 'firebase-admin';

import { checkForAboutToExpireSubscriptionsFunction } from './schedulers/check-for-expired-subscriptions/check-for-about-to-expire-subscriptions.scheduler';
import { notifySubscriptionAboutToExpirePubSub } from './pubsubs/notify-subscription-about-to-expire/notify-subscription-about-to-expire.pubsub';

admin.initializeApp();

// Pub/Subs
export const notifySubscriptionAboutToExpire = notifySubscriptionAboutToExpirePubSub;

// Schedulers
export const checkForAboutToExpireSubscriptions = checkForAboutToExpireSubscriptionsFunction;