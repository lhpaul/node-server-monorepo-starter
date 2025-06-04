import { FastifyInstance } from 'fastify';
import {
  INTERNAL_ERROR_VALUES,
  RESOURCE_NOT_FOUND_ERROR,
  STATUS_CODES,
  TIMEOUT_ERROR,
  UNCAUGHT_EXCEPTION_ERROR,
  UNHANDLED_REJECTION_ERROR,
  VALIDATION_ERROR,
  VALIDATION_ERROR_CODE,
} from '../../constants/server.constants';
import { RequestLogger } from '../request-logger/request-logger.class';

export function setServerErrorHandlers(server: FastifyInstance): void {
  // Handle 404 errors
  server.setNotFoundHandler((request, reply) => {
    request.log.warn(
      {
        logId: RESOURCE_NOT_FOUND_ERROR.logId,
        requestId: request.id,
        url: request.url,
      },
      RESOURCE_NOT_FOUND_ERROR.logMessage,
    );
    reply.status(STATUS_CODES.NOT_FOUND).send({
      code: RESOURCE_NOT_FOUND_ERROR.responseCode,
      message: RESOURCE_NOT_FOUND_ERROR.responseMessage,
    });
  });

  // Handle validation and unhandled errors
  server.setErrorHandler((error, request, reply) => {
    const lastStep = request.log.lastStep;
    const obfuscatedErrorCode = request.log.stepsCounter.toString(); // This is to return a code to the user that doesn't give away any internal information but can be later used to identify the step that caused the error in case the user reports it
    if (error.statusCode === STATUS_CODES.BAD_REQUEST && error.code === VALIDATION_ERROR_CODE) {
      request.log.warn(
        {
          logId: VALIDATION_ERROR.logId,
          error,
        },
        VALIDATION_ERROR.logMessage({ error }),
      );
      return reply.code(error.statusCode).send({
        code: VALIDATION_ERROR.responseCode,
        message: VALIDATION_ERROR.responseMessage,
        details: error.validation?.map((validation) => validation.message),
      });
    }
    request.log.error(
      {
        logId: INTERNAL_ERROR_VALUES.logId,
        errorCode: lastStep?.id ?? null,
        error,
        step: lastStep ?? null,
      },
      INTERNAL_ERROR_VALUES.logMessage({ error, step: lastStep?.id ?? null }),
    );
    return reply.code(STATUS_CODES.INTERNAL_ERROR).send({
      code: obfuscatedErrorCode,
      message: INTERNAL_ERROR_VALUES.responseMessage,
    });
  });
}
export function setServerHooks(server: FastifyInstance): void {
  // Wrap request logger
  server.addHook('onRequest', (request, _reply, done) => {
    request.log = new RequestLogger({
      logger: request.log,
    });
    done();
  });

  // Add hook for timeout
  server.addHook('onTimeout', (request, reply, done) => {
    request.log.error(
      {
        logId: TIMEOUT_ERROR.logId,
        requestId: request.id,
        elapsedTime: reply.elapsedTime,
      },
      TIMEOUT_ERROR.logMessage({ reply }),
    );
    done();
  });
}

export function setServerProcessErrorHandlers(server: FastifyInstance): void {
  process.on('unhandledRejection', (err: Error) => {
    server.log.error(
      {
        logId: UNHANDLED_REJECTION_ERROR.logId,
        error: err,
      },
      UNHANDLED_REJECTION_ERROR.logMessage({ err }),
    );
    console.error('unhandledRejection', err);
    process.exit(1);
  });
  
  process.on('uncaughtException', (err: Error) => {
    server.log.error(
      {
        logId: UNCAUGHT_EXCEPTION_ERROR.logId,
        error: err,
      },
      UNCAUGHT_EXCEPTION_ERROR.logMessage({ err }),
    );
    console.error('uncaughtException', err);
    process.exit(1);
  });
}
