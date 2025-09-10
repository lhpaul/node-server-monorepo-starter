import { ENV_VARIABLES_KEYS, SECRETS } from '@repo/shared/constants';

export const COR_CONFIG = {
  origin: ['*'],
};

export const ERROR_MESSAGES = {
  FIREBASE_PROJECT_ID_OR_DATABASE_URL_NOT_SET: 'Firebase project ID or database URL is not set',
};

export const FASTIFY_ENV_SCHEMA = {
  type: 'object',
  properties: {
    [ENV_VARIABLES_KEYS.APP_ENV]: { type: 'string' },
    [SECRETS.ENCRYPTION_KEY]: { type: 'string' },
    [SECRETS.JWT_SECRET]: { type: 'string' },
    [SECRETS.MOCK_API_PROJECT_SECRET]: { type: 'string' },
  },
  required: [ENV_VARIABLES_KEYS.APP_ENV, SECRETS.ENCRYPTION_KEY, SECRETS.JWT_SECRET, SECRETS.MOCK_API_PROJECT_SECRET],
} as const;
export const FASTIFY_ENV_CONFIG = {
  dotenv: true,
  schema: FASTIFY_ENV_SCHEMA,
};

export const JWT_OPTIONS = {
  expiresIn: '1h'
};

export const SERVER_START_VALUES = {
  port: Number(process.env.PORT) || 4000,
  host: '0.0.0.0',
  logId: 'server-start',
  logMessage: ({ address }: { address: string }): string =>
    `Server started on ${address}`,
};
