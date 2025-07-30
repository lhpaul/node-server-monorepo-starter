import { STATUS_CODES } from '@repo/fastify';
import { TransactionCategoriesService } from '@repo/shared/services';
import { FastifyReply, FastifyRequest } from 'fastify';

import { STEPS } from './transaction-categories.create.handler.constants';
import { CreateTransactionCategoryBody } from './transaction-categories.create.handler.interfaces';

export const createTransactionCategoryHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const logger = request.log.child({ handler: createTransactionCategoryHandler.name });
  const logGroup = createTransactionCategoryHandler.name;
  const service = TransactionCategoriesService.getInstance();
  const body = request.body as CreateTransactionCategoryBody;
  logger.startStep(STEPS.CREATE_TRANSACTION_CATEGORY.id, logGroup);
  const id = await service
    .createResource(body, logger)
    .finally(() => logger.endStep(STEPS.CREATE_TRANSACTION_CATEGORY.id));
  return reply.code(STATUS_CODES.CREATED).send({ id });
}; 