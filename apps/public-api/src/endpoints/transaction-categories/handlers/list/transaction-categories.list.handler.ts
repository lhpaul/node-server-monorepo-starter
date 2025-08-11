import { ACCEPT_LANGUAGE_HEADER_NAME, STATUS_CODES, transformQueryParams } from '@repo/fastify';
import { TransactionCategoriesService } from '@repo/shared/domain';
import { FastifyReply, FastifyRequest } from 'fastify';

import { parseTransactionCategoryToResponseResource } from '../../transaction-categories.endpoint.utils';
import { STEPS } from './transaction-categories.list.handler.constants';
import { ListTransactionCategoriesQuery } from './transaction-categories.list.handler.interfaces';

export const listTransactionCategoriesHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> => {
  const logger = request.log.child({ handler: listTransactionCategoriesHandler.name });
  const logGroup = listTransactionCategoriesHandler.name;
  const service = TransactionCategoriesService.getInstance();
  const query = request.query as ListTransactionCategoriesQuery;
  
  logger.startStep(STEPS.LIST_TRANSACTION_CATEGORIES.id, logGroup);
  const result = await service
    .getResourcesList(transformQueryParams(query), logger)
    .finally(() => logger.endStep(STEPS.LIST_TRANSACTION_CATEGORIES.id));
  
  // Get Accept-Language header
  const acceptLanguage = request.headers[ACCEPT_LANGUAGE_HEADER_NAME] as string;
  
  // Transform the response to show names in the preferred language
  const transformedResult = result.map(category => parseTransactionCategoryToResponseResource(category, acceptLanguage));
  
  return reply.code(STATUS_CODES.OK).send(transformedResult);
};
