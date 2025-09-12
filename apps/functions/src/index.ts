import * as admin from 'firebase-admin';

import { transactionUpdateRequestOnWriteFunction, companyUpdateRequestOnWriteFunction, transactionCreateRequestOnWriteFunction } from './functions/firestore';
import { notifySubscriptionAboutToExpireFunction, syncCompanyTransactionsFunction } from './functions/pub-subs';
import { checkForAboutToExpireSubscriptionsFunction, syncCompaniesTransactionsFunction } from './functions/schedulers';

admin.initializeApp();

// Firestore
export const firestore = {
  transactionCreateRequestOnWrite: transactionCreateRequestOnWriteFunction,
  transactionUpdateRequestOnWrite: transactionUpdateRequestOnWriteFunction,
  companyUpdateRequestOnWrite: companyUpdateRequestOnWriteFunction,
};

// Pub/Subs
export const pubSubs = {
  notifySubscriptionAboutToExpire: notifySubscriptionAboutToExpireFunction,
  syncCompanyTransactions: syncCompanyTransactionsFunction,
};

// Schedulers
export const schedulers = {
  checkForAboutToExpireSubscriptions: checkForAboutToExpireSubscriptionsFunction,
  syncCompaniesTransactions: syncCompaniesTransactionsFunction,
};