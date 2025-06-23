import * as admin from 'firebase-admin';

import { transactionUpdateRequestOnWriteFunction } from './functions/firestore';
import { notifySubscriptionAboutToExpireFunction } from './functions/pub-subs';
import { checkForAboutToExpireSubscriptionsFunction } from './functions/schedulers';

admin.initializeApp();

// Firestore
export const firestore = {
  transactionUpdateRequestOnWrite: transactionUpdateRequestOnWriteFunction,
};

// Pub/Subs
export const pubSubs = {
  notifySubscriptionAboutToExpire: notifySubscriptionAboutToExpireFunction,
};

// Schedulers
export const schedulers = {
  checkForAboutToExpireSubscriptions: checkForAboutToExpireSubscriptionsFunction,
};