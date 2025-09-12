export const HANDLER_NAME = 'syncCompaniesTransactions';

export const SCHEDULE = 'every day 00:00';

export const STEPS = {
  GET_ACTIVE_SUBSCRIPTIONS: 'get-active-subscriptions',
  PUBLISH_SYNC_COMPANIES_TRANSACTIONS_MESSAGES: 'publish-sync-companies-transactions-messages',
};