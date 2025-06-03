import { STATUS_CODES } from '@repo/fastify';
import { TransactionsRepository } from '@repo/shared/repositories';
import { RepositoryError, RepositoryErrorCode } from '@repo/shared/utils';
import { FastifyReply, FastifyRequest } from 'fastify';

import { ERROR_RESPONSES } from '../../transactions.endpoints.constants';
import { STEPS } from './transactions.delete.constants';
import { DeleteTransactionParams } from './transactions.delete.interfaces';

export const deleteTransactionHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const logger = request.log.child({ handler: deleteTransactionHandler.name });
  const repository = TransactionsRepository.getInstance();
  const { id } = request.params as DeleteTransactionParams;
  logger.startStep(STEPS.DELETE_TRANSACTION.id);
  try {
    await repository
      .deleteDocument(id, logger)
      .finally(() => logger.endStep(STEPS.DELETE_TRANSACTION.id));
  } catch (error) {
    if (
      error instanceof RepositoryError &&
      error.code === RepositoryErrorCode.DOCUMENT_NOT_FOUND
    ) {
      return reply.code(STATUS_CODES.NOT_FOUND).send(ERROR_RESPONSES.TRANSACTION_NOT_FOUND);
    }
    throw error;
  }
  return reply.code(STATUS_CODES.NO_CONTENT).send();
};
