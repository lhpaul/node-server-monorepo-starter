export const MOCK_API_HOST = 'mockapi.io';
export const GET_TRANSACTIONS_ERROR_MESSAGE = (errorCode: string, errorMessage: string) => `Failed to get transactions from financial institution: message: ${errorMessage}, code: ${errorCode}`;

export const STEPS = {
  GET_TRANSACTIONS: 'get-transactions',
};

export const GET_TRANSACTIONS_ERROR = {
  logId: 'financial-institution-get-transactions-error',
  logMessage: 'Failed to get transactions from financial institution',
};