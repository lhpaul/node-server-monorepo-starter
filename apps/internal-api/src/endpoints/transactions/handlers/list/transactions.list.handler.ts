import { STATUS_CODES, transformQueryParams } from '@repo/fastify';
import { TransactionsRepository } from '@repo/shared/repositories';
import { FastifyReply, FastifyRequest } from 'fastify';

import { STEPS } from './transactions.list.constants';
import { GetTransactionsQueryParams } from './transactions.list.interfaces';

export const listTransactionsHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const logger = request.log.child({ handler: listTransactionsHandler.name });
  const repository = TransactionsRepository.getInstance();
  const query = request.query as GetTransactionsQueryParams;
  logger.startStep(
    STEPS.GET_TRANSACTIONS.id,
    STEPS.GET_TRANSACTIONS.obfuscatedId,
  );
  const transactions = await repository
    .getDocumentsList(transformQueryParams(query), logger)
    .finally(() => logger.endStep(STEPS.GET_TRANSACTIONS.id));
  return reply.code(STATUS_CODES.OK).send(transactions);
};
