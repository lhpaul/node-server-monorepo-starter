export const COR_CONFIG = {
  origin: ['*'],
};

export const ENVIRONMENT_VARIABLES_KEYS = {
  FIREBASE_DATABASE_URL: 'FIREBASE_DATABASE_URL',
  FIREBASE_PROJECT_ID: 'FIREBASE_PROJECT_ID',
};

export const ERROR_MESSAGES = {
  FIREBASE_PROJECT_ID_OR_DATABASE_URL_NOT_SET: 'Firebase project ID or database URL is not set',
};

export const FASTIFY_ENV_SCHEMA = {
  type: 'object',
  properties: {
    APP_ENV: { type: 'string' },
    ENCRYPTION_KEY: { type: 'string' },
    MOCK_API_PROJECT_SECRET: { type: 'string' },
  },
  required: ['APP_ENV', 'ENCRYPTION_KEY', 'MOCK_API_PROJECT_SECRET'],
} as const;
export const FASTIFY_ENV_CONFIG = {
  dotenv: true,
  schema: FASTIFY_ENV_SCHEMA,
};

export const SERVER_START_VALUES = {
  port: Number(process.env.PORT) || 4000,
  host: '0.0.0.0',
  logId: 'server-start',
  logMessage: ({ address }: { address: string }): string =>
    `Server started on ${address}`,
};
