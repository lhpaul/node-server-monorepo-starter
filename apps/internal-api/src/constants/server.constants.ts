import packageJson from '../../package.json';

export const COR_CONFIG = {
  origin: ['*'],
};

export const FASTIFY_ENV_SCHEMA = {
  type: 'object',
  required: ['FIREBASE_PROJECT_ID', 'FIREBASE_DATABASE_URL'],
  properties: {
    FIREBASE_PROJECT_ID: { type: 'string' },
    FIREBASE_DATABASE_URL: { type: 'string' },
  },
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
