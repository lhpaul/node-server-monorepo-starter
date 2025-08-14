export const RESOURCE_NAME = 'Transactions';
export const RESOURCE_PATH = 'transactions://{companyId}/{dateFrom}/{dateTo}';

export const RESOURCE_DESCRIPTION = 'Get transactions. The dateFrom and dateTo parameters are optional. If not provided, the transactions will be returned for the last 30 days.';

export const STEPS = {
  GET_TRANSACTIONS: 'GET_TRANSACTIONS',
};
