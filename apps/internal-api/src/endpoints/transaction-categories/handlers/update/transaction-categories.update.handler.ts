import { TransactionCategoriesService } from '@repo/shared/services';
import { FastifyReply, FastifyRequest } from 'fastify';

import { STEPS } from './transaction-categories.update.handler.constants';
import { 
  UpdateTransactionCategoryBody, 
  UpdateTransactionCategoryParams 
} from './transaction-categories.update.handler.interfaces';

export const updateTransactionCategoryHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const logger = request.log.child({ handler: updateTransactionCategoryHandler.name });
  const logGroup = updateTransactionCategoryHandler.name;
  const service = TransactionCategoriesService.getInstance();
  const body = request.body as UpdateTransactionCategoryBody;
  const params = request.params as UpdateTransactionCategoryParams;
  logger.startStep(STEPS.UPDATE_TRANSACTION_CATEGORY.id, logGroup);
  await service
    .updateResource(params.id, body, logger)
    .finally(() => logger.endStep(STEPS.UPDATE_TRANSACTION_CATEGORY.id));
  return reply.send();
}; 