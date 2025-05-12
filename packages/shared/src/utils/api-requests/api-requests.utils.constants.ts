export const LOGS = {
  API_REQUEST_START: {
    logId: 'api-request-start',
    logMessage: ({ url, method }: { url: string; method: string }) =>
      `Making ${method} HTTP request to ${url}`,
  },
  API_REQUEST_SUCCESS: {
    logId: 'api-request-success',
    logMessage: ({
      url,
      method,
      duration,
    }: {
      url: string;
      method: string;
      duration: number;
    }) => `HTTP ${method} request to ${url} successful in ${duration}ms`,
  },
  API_REQUEST_ERROR: {
    logId: 'api-request-error',
    logMessage: ({
      url,
      method,
      error,
      duration,
    }: {
      url: string;
      method: string;
      error: Error;
      duration: number;
    }) =>
      `HTTP ${method} request to ${url} failed with error: ${error.message} in ${duration}ms `,
  },
};

export const DEFAULT_ERROR_CODE = 'unknown-error';
