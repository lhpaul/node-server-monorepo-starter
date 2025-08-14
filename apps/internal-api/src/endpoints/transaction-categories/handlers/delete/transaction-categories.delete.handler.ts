import { STATUS_CODES } from '@repo/fastify';
import { TransactionCategoriesService } from '@repo/shared/domain';
import { DomainModelServiceError, DomainModelServiceErrorCode } from '@repo/shared/utils';
import { FastifyReply, FastifyRequest } from 'fastify';

import { ERROR_RESPONSES } from '../../../transaction-categories/transaction-categories.endpoints.constants';
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
  try {
  logger.startStep(STEPS.DELETE_TRANSACTION_CATEGORY, logGroup);
  await service
    .deleteResource(params.id, logger)
    .finally(() => logger.endStep(STEPS.DELETE_TRANSACTION_CATEGORY));
  } catch (error) {
    if (error instanceof DomainModelServiceError && error.code === DomainModelServiceErrorCode.RESOURCE_NOT_FOUND) {
      return reply.code(STATUS_CODES.NOT_FOUND).send(ERROR_RESPONSES.TRANSACTION_CATEGORY_NOT_FOUND);
    }
    throw error;
  }
  return reply.code(STATUS_CODES.NO_CONTENT).send();
}; 