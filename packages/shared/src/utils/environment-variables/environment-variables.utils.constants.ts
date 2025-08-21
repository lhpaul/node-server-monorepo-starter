export const ENV_VARIABLES_UTILS_CONSTANTS: Record<string, Record<string, string>> = {
  FIREBASE_DATABASE_URL: {
    DEV: 'https://node-starter-project-dev.firebaseio.com',
    STG: 'https://node-starter-project-stg.firebaseio.com',
    PROD: 'https://node-starter-project-prod.firebaseio.com',
  },
  FIREBASE_PROJECT_ID: {
    DEV: 'node-starter-project-dev',
    STG: 'node-starter-project-stg',
    PROD: 'node-starter-project-prod',
  },
  MOCK_TRANSACTIONS_ENDPOINT: {
    DEV: 'v1/transactions-dev',
    STG: 'v1/transactions-stg',
    PROD: 'v1/transactions-prod',
  },
};

export const APP_ENV_NOT_SET_ERROR_MESSAGE = 'APP_ENV is not set';
