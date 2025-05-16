import { FastifyReply } from 'fastify';
import pino from 'pino';

// this will be the config for the logger
// TODO: Improve logs to work well with GCP following this [article](https://cloud.google.com/trace/docs/setup/nodejs-ot)
export const SERVER_LOGGER_CONFIG: pino.LoggerOptions = {
  messageKey: 'message',
  timestamp() {
    return `,"timestamp":"${new Date(Date.now()).toISOString()}"`;
  },
};

export const COR_CONFIG = {
  origin: ['*'],
};

export const RESOURCE_NOT_FOUND_ERROR = {
  logId: 'resource-not-found',
  logMessage: 'The requested resource was not found',
  responseCode: 'not-found',
  responseMessage: 'The requested resource was not found',
};

export const INTERNAL_ERROR_VALUES = {
  logId: 'internal-error',
  logMessage: ({ error, step }: { error: Error; step: string }): string =>
    `An internal error occurred: ${error.message} at step: ${step}`,
  responseMessage: 'An internal error occurred',
};

export const TIMEOUT_ERROR = {
  logId: 'request-timeout',
  logMessage: ({ reply }: { reply: FastifyReply }): string =>
    `Request timed out after ${reply.elapsedTime}ms`,
};

export const SERVER_START_VALUES = {
  port: Number(process.env.PORT) || 4000,
  host: '0.0.0.0',
  logId: 'server-start',
  logMessage: ({ address }: { address: string }): string =>
    `Server started on ${address}`,
};

export const UNHANDLED_REJECTION_ERROR = {
  logId: 'unhandled-rejection',
  logMessage: ({ err }: { err: Error }): string =>
    `Unhandled rejection: ${err.message}`,
};

export const UNCAUGHT_EXCEPTION_ERROR = {
  logId: 'uncaught-exception',
  logMessage: ({ err }: { err: Error }): string =>
    `Uncaught exception: ${err.message}`,
};
