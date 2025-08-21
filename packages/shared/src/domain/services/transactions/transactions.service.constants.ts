export const DATE_FORMAT = 'YYYY-MM-DD';
export const ERRORS_MESSAGES = {
  INVALID_DATE_FORMAT: `Invalid date format. Please use ${DATE_FORMAT} format.`,
  INVALID_TRANSACTION_SOURCE_TYPE: (transactionSourceType: string | null | undefined, transactionId: string) => `Invalid transaction source type: ${transactionSourceType} in document ${transactionId}`,
  INVALID_TRANSACTION_TYPE: (transactionType: string | null | undefined, transactionId: string) => `Invalid transaction type: ${transactionType} in document ${transactionId}`,
};

export const SYNC_WITH_FINANCIAL_INSTITUTION_LOGS = {
  SYNC_ACTIONS: {
    logId: 'sync-actions',
    logMessage: 'Sync actions',
  },
};

export const SYNC_WITH_FINANCIAL_INSTITUTION_STEPS = {
  GET_TRANSACTIONS: 'get-transactions',
  CREATE_TRANSACTIONS: 'create-transactions',
  CREATE_TRANSACTIONS_PARTIAL_COMMIT: 'create-transactions-partial-commit',
  CREATE_TRANSACTIONS_FINAL_COMMIT: 'create-transactions-final-commit',
  UPDATE_TRANSACTIONS: 'update-transactions',
  UPDATE_TRANSACTIONS_PARTIAL_COMMIT: 'update-transactions-partial-commit',
  UPDATE_TRANSACTIONS_FINAL_COMMIT: 'update-transactions-final-commit',
  DELETE_TRANSACTIONS: 'delete-transactions',
  DELETE_TRANSACTIONS_PARTIAL_COMMIT: 'delete-transactions-partial-commit',
  DELETE_TRANSACTIONS_FINAL_COMMIT: 'delete-transactions-final-commit',
};
