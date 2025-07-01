import { STATUS_CODES } from '@repo/fastify';
import { TransactionsService } from '@repo/shared/services';
import { DomainModelServiceError, DomainModelServiceErrorCode } from '@repo/shared/utils';
import { FastifyReply, FastifyRequest } from 'fastify';

import { ERROR_RESPONSES } from '../../transactions.endpoints.constants';
import { STEPS } from './transactions.update.handler.constants';
import {
  UpdateTransactionBody,
  UpdateTransactionParams,
} from './transactions.update.handler.interfaces';

export const updateTransactionHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const logger = request.log.child({ handler: updateTransactionHandler.name });
  const logGroup = updateTransactionHandler.name;
  const service = TransactionsService.getInstance();
  const { id } = request.params as UpdateTransactionParams;
  const body = request.body as UpdateTransactionBody;
  try {
    logger.startStep(STEPS.UPDATE_TRANSACTION.id, logGroup);
    await service.updateResource(id, body, logger)
    .finally(() => logger.endStep(STEPS.UPDATE_TRANSACTION.id));
    return reply.code(STATUS_CODES.NO_CONTENT).send();
  } catch (error) {
    if (error instanceof DomainModelServiceError) {
      if (error.code === DomainModelServiceErrorCode.RESOURCE_NOT_FOUND) {
        return reply.code(STATUS_CODES.NOT_FOUND).send(ERROR_RESPONSES.TRANSACTION_NOT_FOUND);
      }
      if (error.code === DomainModelServiceErrorCode.INVALID_INPUT) {
        return reply.code(STATUS_CODES.BAD_REQUEST).send({
          code: error.code,
          message: error.message,
          data: error.data,
        });
      }
    }
    throw error;
  }
};
