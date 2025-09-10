import { ENV_VARIABLES_KEYS, SECRETS } from '@repo/shared/constants';

import packageJson from '../../package.json';

export const COR_CONFIG = {
  origin: ['*'],
};

export const FASTIFY_ENV_SCHEMA = {
  type: 'object',
  properties: {
    [ENV_VARIABLES_KEYS.APP_ENV]: { type: 'string' },
    [ENV_VARIABLES_KEYS.FIREBASE_DATABASE_URL]: { type: 'string' },
    [ENV_VARIABLES_KEYS.FIREBASE_PROJECT_ID]: { type: 'string' },
    [SECRETS.ENCRYPTION_KEY]: { type: 'string' },
    [SECRETS.MOCK_API_PROJECT_SECRET]: { type: 'string' },
  },
  required: [
    ENV_VARIABLES_KEYS.APP_ENV,
    ENV_VARIABLES_KEYS.FIREBASE_DATABASE_URL,
    ENV_VARIABLES_KEYS.FIREBASE_PROJECT_ID,
    SECRETS.ENCRYPTION_KEY,
    SECRETS.MOCK_API_PROJECT_SECRET
  ],
} as const;
export const FASTIFY_ENV_CONFIG = {
  dotenv: true,
  schema: FASTIFY_ENV_SCHEMA,
};

export const SERVER_START_VALUES = {
  port: Number(process.env.PORT) || 4001,
  host: '0.0.0.0',
  logId: 'server-start',
  logMessage: ({ address }: { address: string }): string =>
    `Server started on ${address}`,
};

export const MCP_SERVER_CONFIG = {
  name: 'mcp-server',
  version: packageJson.version,
};
