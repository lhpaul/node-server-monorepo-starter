import { FinancialInstitutionsService } from '@repo/shared/services';
import { FastifyReply, FastifyRequest } from 'fastify';

import { STEPS } from './financial-institutions.update.handler.constants';
import {
  UpdateFinancialInstitutionBody,
  UpdateFinancialInstitutionParams,
} from './financial-institutions.update.handler.interfaces';

export const updateFinancialInstitutionHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const logger = request.log.child({ handler: updateFinancialInstitutionHandler.name });
  const logGroup = updateFinancialInstitutionHandler.name;
  const service = FinancialInstitutionsService.getInstance('admin');
  const body = request.body as UpdateFinancialInstitutionBody;
  const params = request.params as UpdateFinancialInstitutionParams;
  
  logger.startStep(STEPS.UPDATE_FINANCIAL_INSTITUTION.id, logGroup);
  const result = await service
    .updateResource(params.id, body, logger)
    .finally(() => logger.endStep(STEPS.UPDATE_FINANCIAL_INSTITUTION.id));
  
  return reply.send(result);
}; 