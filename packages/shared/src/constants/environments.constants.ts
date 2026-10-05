/*
  This file contains the constants for the environment variables.
  It is used to get the environment variables for the project.
*/
export const ENV_VARIABLES_KEYS = {
  APP_ENV: 'APP_ENV',
  FIREBASE_DATABASE_URL: 'FIREBASE_DATABASE_URL',
  FIREBASE_PROJECT_ID: 'FIREBASE_PROJECT_ID',
};
export const ENV_VALUES: Record<string, Record<string, string>> = {
  [ENV_VARIABLES_KEYS.FIREBASE_DATABASE_URL]: {
    DEV: 'https://<DEV_PROJECT_ID>.firebaseio.com',
    STG: 'https://<STG_PROJECT_ID>.firebaseio.com',
    PROD: 'https://<PROD_PROJECT_ID>.firebaseio.com',
  },
  [ENV_VARIABLES_KEYS.FIREBASE_PROJECT_ID]: {
    DEV: '<DEV_PROJECT_ID>',
    STG: '<STG_PROJECT_ID>',
    PROD: '<PROD_PROJECT_ID>',
  },
};