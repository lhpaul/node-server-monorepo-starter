import { STATUS_CODES, transformQueryParams } from '@repo/fastify';
import { FinancialInstitutionsService } from '@repo/shared/domain';
import { FastifyReply, FastifyRequest } from 'fastify';

import { STEPS } from './financial-institutions.list.handler.constants';
import { ListFinancialInstitutionsQuery } from './financial-institutions.list.handler.interfaces';

export const listFinancialInstitutionsHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const logger = request.log.child({ handler: listFinancialInstitutionsHandler.name });
  const logGroup = listFinancialInstitutionsHandler.name;
  const service = FinancialInstitutionsService.getInstance();
  const query = request.query as ListFinancialInstitutionsQuery;
  
  logger.startStep(STEPS.LIST_FINANCIAL_INSTITUTIONS, logGroup);
  const result = await service
    .getResourcesList(transformQueryParams(query), logger)
    .finally(() => logger.endStep(STEPS.LIST_FINANCIAL_INSTITUTIONS));
  
  return reply.code(STATUS_CODES.OK).send(result);
}; 