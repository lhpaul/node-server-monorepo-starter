import { FastifyReply, FastifyRequest } from 'fastify';
import { TransactionsRepository } from '@repo/shared/repositories';

import { ERROR_RESPONSES } from '../../transactions.endpoints.constants';
import { STEPS } from './transactions.get.constants';
import { GetTransactionParams } from './transactions.get.interfaces';
export const getTransactionHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const logger = request.log.child({ handler: getTransactionHandler.name });
  const repository = TransactionsRepository.getInstance();
  const { id } = request.params as GetTransactionParams;
  logger.startStep(
    STEPS.GET_TRANSACTION.id,
    STEPS.GET_TRANSACTION.obfuscatedId,
  );
  const transaction = await repository
    .getDocument(id, logger)
    .finally(() => logger.endStep(STEPS.GET_TRANSACTION.id));
  if (!transaction) {
    return reply.code(404).send(ERROR_RESPONSES.TRANSACTION_NOT_FOUND);
  }
  return reply.code(200).send(transaction);
};
