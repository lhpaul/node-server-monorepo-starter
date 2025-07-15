export const COR_CONFIG = {
  origin: ['*'],
};

export const FASTIFY_ENV_SCHEMA = {
  type: 'object',
  required: ['APP_ENV'],
  properties: {
    APP_ENV: { type: 'string', enum: ['DEV', 'STG', 'PROD'] },
  },
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
