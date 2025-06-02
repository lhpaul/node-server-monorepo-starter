import { STATUS_CODES } from '@repo/fastify';
import { TransactionsRepository } from '@repo/shared/repositories';
import { FastifyReply, FastifyRequest } from 'fastify';

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
  await repository
    .deleteDocument(id, logger)
    .finally(() => logger.endStep(STEPS.DELETE_TRANSACTION.id));
  return reply.code(STATUS_CODES.NO_CONTENT).send();
};
