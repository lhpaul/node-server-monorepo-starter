import { FastifyReply, FastifyRequest } from 'fastify';
import {
  DeleteTransactionError,
  DeleteTransactionErrorCode,
  TransactionsRepository,
} from '@repo/shared/repositories';

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
  logger.startStep(
    STEPS.DELETE_TRANSACTION.id,
    STEPS.DELETE_TRANSACTION.obfuscatedId,
  );
  try {
    await repository
      .deleteTransaction(id, { logger })
      .finally(() => logger.endStep(STEPS.DELETE_TRANSACTION.id));
  } catch (error) {
    if (
      error instanceof DeleteTransactionError &&
      error.code === DeleteTransactionErrorCode.DOCUMENT_NOT_FOUND
    ) {
      return reply.code(404).send(ERROR_RESPONSES.TRANSACTION_NOT_FOUND);
    }
    throw error;
  }
  return reply.code(204).send();
};
