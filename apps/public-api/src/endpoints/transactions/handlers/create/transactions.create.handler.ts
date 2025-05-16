import { TransactionsRepository } from '@repo/shared/repositories';
import { FastifyReply, FastifyRequest } from 'fastify';

import { STEPS } from './transactions.create.constants';
import { CreateTransactionBody } from './transactions.create.interfaces';

export const createTransactionHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const logger = request.log.child({ handler: createTransactionHandler.name });
  const repository = TransactionsRepository.getInstance();
  const body = request.body as CreateTransactionBody;
  logger.startStep(
    STEPS.CREATE_TRANSACTION.id,
    STEPS.CREATE_TRANSACTION.obfuscatedId,
  );
  const { id } = await repository
    .createTransaction(body, { logger })
    .finally(() => logger.endStep(STEPS.CREATE_TRANSACTION.id));
  return reply.code(201).send({ id });
};
