import { STATUS_CODES, transformQueryParams } from '@repo/fastify';
import { TransactionsService } from '@repo/shared/services';
import { FastifyReply, FastifyRequest } from 'fastify';

import { STEPS } from './transactions.list.handler.constants';
import { GetTransactionsQueryParams } from './transactions.list.handler.interfaces';

export const listTransactionsHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const logger = request.log.child({ handler: listTransactionsHandler.name });
  const service = TransactionsService.getInstance();
  const query = request.query as GetTransactionsQueryParams;
  logger.startStep(STEPS.GET_TRANSACTIONS.id);
  const transactions = await service
    .getResourcesList(transformQueryParams(query), logger)
    .finally(() => logger.endStep(STEPS.GET_TRANSACTIONS.id));
  return reply.code(STATUS_CODES.OK).send(transactions);
};
