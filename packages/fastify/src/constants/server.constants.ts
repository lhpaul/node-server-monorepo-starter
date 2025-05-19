import { FastifyReply } from 'fastify';
import pino from 'pino';

export const API_KEY_HEADER = 'x-api-key';
export const SERVER_LOGGER_CONFIG: pino.LoggerOptions = {
  messageKey: 'message',
  timestamp() {
    return `,"timestamp":"${new Date(Date.now()).toISOString()}"`;
  },
};

export const RESOURCE_NOT_FOUND_ERROR = {
  logId: 'resource-not-found',
  logMessage: 'The requested resource was not found',
  responseCode: 'not-found',
  responseMessage: 'The requested resource was not found',
};

export const UNAUTHORIZED_ERROR_STATUS_CODE = 401;
export const UNAUTHORIZED_ERROR = {
  logId: 'unauthorized',
  logMessage: 'Unauthorized request',
  responseCode: 'unauthorized',
  responseMessage: 'Unauthorized request',
};

export const FORBIDDEN_ERROR_STATUS_CODE = 403;
export const FORBIDDEN_ERROR = {
  logId: 'forbidden',
  logMessage: 'Forbidden request',
  responseCode: 'forbidden',
  responseMessage: 'Forbidden request',
};

export const VALIDATION_ERROR_STATUS_CODE = 400;
export const VALIDATION_ERROR_CODE = 'FST_ERR_VALIDATION';

export const VALIDATION_ERROR = {
  logId: 'validation-error',
  logMessage: ({ error }: { error: { code: string} }): string =>
    `Validation error: ${error.code}`,
  responseCode: 'invalid-parameters',
  responseMessage: 'Invalid parameters',
};

export const INTERNAL_ERROR_VALUES = {
  logId: 'internal-error',
  logMessage: ({ error, step }: { error: Error; step: string | null }): string =>
    `An internal error occurred: ${error.message} at step: ${step}`,
  responseMessage: 'An internal error occurred',
};

export const TIMEOUT_ERROR = {
  logId: 'request-timeout',
  logMessage: ({ reply }: { reply: FastifyReply }): string =>
    `Request timed out after ${reply.elapsedTime}ms`,
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