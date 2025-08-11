export const DATE_FORMAT = 'YYYY-MM-DD';
export const ERRORS_MESSAGES = {
  INVALID_DATE_FORMAT: `Invalid date format. Please use ${DATE_FORMAT} format.`,
  INVALID_TRANSACTION_SOURCE_TYPE: (transactionSourceType: string | null | undefined, transactionId: string) => `Invalid transaction source type: ${transactionSourceType} in document ${transactionId}`,
  INVALID_TRANSACTION_TYPE: (transactionType: string | null | undefined, transactionId: string) => `Invalid transaction type: ${transactionType} in document ${transactionId}`,
};

export const SYNC_WITH_FINANCIAL_INSTITUTION_STEPS = {
  GET_TRANSACTIONS: 'get-transactions',
  CREATE_TRANSACTIONS: 'create-transactions',
  UPDATE_TRANSACTIONS: 'update-transactions',
  DELETE_TRANSACTIONS: 'delete-transactions',
};