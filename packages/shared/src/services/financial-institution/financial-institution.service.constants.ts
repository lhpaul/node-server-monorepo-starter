export const MOCK_API_PROJECT_SECRET_KEY = 'MOCK_API_PROJECT_SECRET';
export const MOCK_TRANSACTIONS_ENDPOINT_ENV_VARIABLE_KEY = 'MOCK_TRANSACTIONS_ENDPOINT';
export const HOST_BY_INSTITUTION_ID: Record<string, string> = { // for all environments, we use the same mock api
  '1': 'mockapi.io',
  '2': 'mockapi.io',
  '3': 'mockapi.io',
};
export const GET_TRANSACTIONS_ERROR_MESSAGE = 'Failed to get transactions from financial institution';