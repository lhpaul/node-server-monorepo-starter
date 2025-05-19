import {
  TransactionsRepository,
  UpdateTransactionError,
} from '@repo/shared/repositories';
import { FastifyReply, FastifyRequest } from 'fastify';

import { ERROR_RESPONSES } from '../../transactions.endpoints.constants';
import { STEPS } from './transactions.update.constants';
import {
  UpdateTransactionBody,
  UpdateTransactionParams,
} from './transactions.update.interfaces';

export const updateTransactionHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const logger = request.log.child({ handler: updateTransactionHandler.name });
  const repository = TransactionsRepository.getInstance();
  const { id } = request.params as UpdateTransactionParams;
  const body = request.body as UpdateTransactionBody;
  try {
    logger.startStep(
      STEPS.UPDATE_TRANSACTION.id,
      STEPS.UPDATE_TRANSACTION.obfuscatedId,
    );
    await repository.updateTransaction(id, body, { logger });
    logger.endStep(STEPS.UPDATE_TRANSACTION.id);
    return reply.code(204).send();
  } catch (error) {
    logger.endStep(STEPS.UPDATE_TRANSACTION.id);
    if (error instanceof UpdateTransactionError) {
      return reply.code(404).send(ERROR_RESPONSES.TRANSACTION_NOT_FOUND);
    }
    throw error;
  }
};
