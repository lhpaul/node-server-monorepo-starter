import { FinancialInstitutionsService } from '@repo/shared/domain';
import { FastifyReply, FastifyRequest } from 'fastify';

import { STEPS } from './financial-institutions.get.handler.constants';
import { GetFinancialInstitutionParams } from './financial-institutions.get.handler.interfaces';

export const getFinancialInstitutionHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const logger = request.log.child({ handler: getFinancialInstitutionHandler.name });
  const logGroup = getFinancialInstitutionHandler.name;
  const service = FinancialInstitutionsService.getInstance();
  const params = request.params as GetFinancialInstitutionParams;
  
  logger.startStep(STEPS.GET_FINANCIAL_INSTITUTION, logGroup);
  const result = await service
    .getResource(params.id, logger)
    .finally(() => logger.endStep(STEPS.GET_FINANCIAL_INSTITUTION));
  
  return reply.send(result);
}; 