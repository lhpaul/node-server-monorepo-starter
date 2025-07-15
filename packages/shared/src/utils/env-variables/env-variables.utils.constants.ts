export const ENV_VARIABLES_UTILS_CONSTANTS: Record<string, Record<string, string>> = {
  FIREBASE_PROJECT_ID: {
    DEV: 'node-starter-project-dev',
    STG: 'node-starter-project-stg',
    PROD: 'node-starter-project-prod',
  },
  FIREBASE_DATABASE_URL: {
    DEV: 'https://node-starter-project-dev.firebaseio.com',
    STG: 'https://node-starter-project-stg.firebaseio.com',
    PROD: 'https://node-starter-project-prod.firebaseio.com',
  },
};
