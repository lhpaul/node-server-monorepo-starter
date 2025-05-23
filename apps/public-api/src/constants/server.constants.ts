export const COR_CONFIG = {
  origin: ['*'],
};

export const FASTIFY_ENV_SCHEMA = {
  type: 'object',
  required: ['JWT_SECRET'],
  properties: {
    JWT_SECRET: { type: 'string' },
  },
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
