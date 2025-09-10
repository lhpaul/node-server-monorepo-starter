export const ENV_VARIABLES_KEYS = {
  APP_ENV: 'APP_ENV',
  FIREBASE_DATABASE_URL: 'FIREBASE_DATABASE_URL',
  FIREBASE_PROJECT_ID: 'FIREBASE_PROJECT_ID',
  MOCK_TRANSACTIONS_ENDPOINT: 'MOCK_TRANSACTIONS_ENDPOINT',
};
export const ENV_VALUES: Record<string, Record<string, string>> = {
  [ENV_VARIABLES_KEYS.FIREBASE_DATABASE_URL]: {
    DEV: 'https://node-starter-project-dev.firebaseio.com',
    STG: 'https://node-starter-project-stg.firebaseio.com',
    PROD: 'https://node-starter-project-prod.firebaseio.com',
  },
  [ENV_VARIABLES_KEYS.FIREBASE_PROJECT_ID]: {
    DEV: 'node-starter-project-dev',
    STG: 'node-starter-project-stg',
    PROD: 'node-starter-project-prod',
  },
  [ENV_VARIABLES_KEYS.MOCK_TRANSACTIONS_ENDPOINT]: {
    DEV: 'transactions-dev',
    STG: 'transactions-stg',
    PROD: 'transactions-prod',
  },
};