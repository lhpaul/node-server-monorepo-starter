import { STATUS_CODES, transformQueryParams } from '@repo/fastify';
import { TransactionCategoriesService } from '@repo/shared/domain';
import { FastifyReply, FastifyRequest } from 'fastify';

import { parseTransactionCategoryToResource } from '../../transaction-categories.endpoint.utils';
import { STEPS } from './transaction-categories.list.handler.constants';
import { ListTransactionCategoriesQuery } from './transaction-categories.list.handler.interfaces';

export const listTransactionCategoriesHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const logger = request.log.child({ handler: listTransactionCategoriesHandler.name });
  const logGroup = listTransactionCategoriesHandler.name;
  const service = TransactionCategoriesService.getInstance();
  const query = request.query as ListTransactionCategoriesQuery;
  logger.startStep(STEPS.LIST_TRANSACTION_CATEGORIES, logGroup);
  const result = await service
    .getResourcesList(transformQueryParams(query), logger)
    .finally(() => logger.endStep(STEPS.LIST_TRANSACTION_CATEGORIES));
  return reply.code(STATUS_CODES.OK).send(result.map((transactionCategory) => parseTransactionCategoryToResource(transactionCategory)));
}; 