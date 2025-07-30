import { TransactionCategoriesService } from '@repo/shared/services';
import { FastifyReply, FastifyRequest } from 'fastify';

import { STEPS } from './transaction-categories.delete.handler.constants';
import { DeleteTransactionCategoryParams } from './transaction-categories.delete.handler.interfaces';

export const deleteTransactionCategoryHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const logger = request.log.child({ handler: deleteTransactionCategoryHandler.name });
  const logGroup = deleteTransactionCategoryHandler.name;
  const service = TransactionCategoriesService.getInstance();
  const params = request.params as DeleteTransactionCategoryParams;
  logger.startStep(STEPS.DELETE_TRANSACTION_CATEGORY.id, logGroup);
  await service
    .deleteResource(params.id, logger)
    .finally(() => logger.endStep(STEPS.DELETE_TRANSACTION_CATEGORY.id));
  return reply.send();
}; 