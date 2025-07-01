import { STATUS_CODES } from '@repo/fastify';
import { TransactionsService } from '@repo/shared/services';
import { FastifyReply, FastifyRequest } from 'fastify';

import { ERROR_RESPONSES } from '../../transactions.endpoints.constants';
import { STEPS } from './transactions.get.handler.constants';
import { GetTransactionParams } from './transactions.get.handler.interfaces';

export const getTransactionHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const logger = request.log.child({ handler: getTransactionHandler.name });
  const logGroup = getTransactionHandler.name;
  const service = TransactionsService.getInstance();
  const { id } = request.params as GetTransactionParams;
  logger.startStep(STEPS.GET_TRANSACTION.id, logGroup);
  const transaction = await service
    .getResource(id, logger)
    .finally(() => logger.endStep(STEPS.GET_TRANSACTION.id));
  if (!transaction) {
    return reply.code(STATUS_CODES.NOT_FOUND).send(ERROR_RESPONSES.TRANSACTION_NOT_FOUND);
  }
  return reply.code(STATUS_CODES.OK).send(transaction);
};
