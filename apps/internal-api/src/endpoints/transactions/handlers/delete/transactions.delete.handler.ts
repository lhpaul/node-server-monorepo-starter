import { STATUS_CODES } from '@repo/fastify';
import { TransactionsService } from '@repo/shared/services';
import { DomainModelServiceError, DomainModelServiceErrorCode } from '@repo/shared/utils';
import { FastifyReply, FastifyRequest } from 'fastify';

import { ERROR_RESPONSES } from '../../transactions.endpoints.constants';
import { STEPS } from './transactions.delete.handler.constants';
import { DeleteTransactionParams } from './transactions.delete.handler.interfaces';

export const deleteTransactionHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const logger = request.log.child({ handler: deleteTransactionHandler.name });
  const logGroup = deleteTransactionHandler.name;
  const service = TransactionsService.getInstance();
  const { id } = request.params as DeleteTransactionParams;
  logger.startStep(STEPS.DELETE_TRANSACTION.id, logGroup);
  try {
    await service
      .deleteResource(id, logger)
      .finally(() => logger.endStep(STEPS.DELETE_TRANSACTION.id));
  } catch (error) {
    if (
      error instanceof DomainModelServiceError &&
      error.code === DomainModelServiceErrorCode.RESOURCE_NOT_FOUND
    ) {
      return reply.code(STATUS_CODES.NOT_FOUND).send(ERROR_RESPONSES.TRANSACTION_NOT_FOUND);
    }
    throw error;
  }
  return reply.code(STATUS_CODES.NO_CONTENT).send();
};
