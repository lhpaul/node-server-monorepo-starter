export const LOGS = {
  ERROR_IN_RETRIABLE_ACTION: {
    id: 'error-in-retriable-action',
    message: 'Error in retriable action',
  },
  ERROR_IN_RETRIABLE_TRANSACTION: {
    id: 'error-in-retriable-transaction',
    message: 'Error in retriable transaction',
  },
  UNHANDLED_ERROR_CODE: {
    id: 'unhandled-error-code',
    message: 'Unhandled error code',
  },
};

export const STEPS = {
  RETRIABLE_ACTION: {
    id: 'retriable-action',
  },
  RETRIABLE_TRANSACTION: {
    id: 'retriable-transaction'
  },
};

export const RETRY_CODE = 'retry';

export const ERROR_MESSAGES = {
  MAX_RETRIES_REACHED: (eventName: string, eventId: string, maxRetries: number) => `Document ${eventName}EventId ${eventId} has reached it's max retries of ${maxRetries} times.`,
  DOCUMENT_NOT_FOUND: (eventName: string, eventId: string) => `Document ${eventName}EventId ${eventId} not found.`,
  ACTION_HAS_BEEN_RETRIED: (maxRetries: number) => `Action has been retried ${maxRetries} times and did not finish successfully.`,
};

export const DEFAULT_MAX_RETRIES = 0;
export const DEFAULT_DELAY = 1000;
