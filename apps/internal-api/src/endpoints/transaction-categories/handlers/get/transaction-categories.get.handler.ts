import { STATUS_CODES } from '@repo/fastify';
import { TransactionCategoriesService } from '@repo/shared/domain';
import { FastifyReply, FastifyRequest } from 'fastify';

import { STEPS } from './transaction-categories.get.handler.constants';
import { GetTransactionCategoryParams } from './transaction-categories.get.handler.interfaces';
import { parseTransactionCategoryToResource } from '../../transaction-categories.endpoint.utils';

export const getTransactionCategoryHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const logger = request.log.child({ handler: getTransactionCategoryHandler.name });
  const logGroup = getTransactionCategoryHandler.name;
  const service = TransactionCategoriesService.getInstance();
  const params = request.params as GetTransactionCategoryParams;
  logger.startStep(STEPS.GET_TRANSACTION_CATEGORY.id, logGroup);
  const result = await service
    .getResource(params.id, logger)
    .finally(() => logger.endStep(STEPS.GET_TRANSACTION_CATEGORY.id));
  
  if (!result) {
    return reply.code(STATUS_CODES.NOT_FOUND).send({
      code: 'transaction-category-not-found',
      message: 'Transaction category not found',
    });
  }
  
  return reply.send(parseTransactionCategoryToResource(result));
}; 