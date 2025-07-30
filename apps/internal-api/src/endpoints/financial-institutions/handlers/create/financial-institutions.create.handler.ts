import { STATUS_CODES } from '@repo/fastify';
import { FinancialInstitutionsService } from '@repo/shared/services';
import { FastifyReply, FastifyRequest } from 'fastify';

import { STEPS } from './financial-institutions.create.handler.constants';
import { CreateFinancialInstitutionBody } from './financial-institutions.create.handler.interfaces';

export const createFinancialInstitutionHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const logger = request.log.child({ handler: createFinancialInstitutionHandler.name });
  const logGroup = createFinancialInstitutionHandler.name;
  const service = FinancialInstitutionsService.getInstance('admin');
  const body = request.body as CreateFinancialInstitutionBody;
  
  logger.startStep(STEPS.CREATE_FINANCIAL_INSTITUTION.id, logGroup);
  const id = await service
    .createResource(body, logger)
    .finally(() => logger.endStep(STEPS.CREATE_FINANCIAL_INSTITUTION.id));
  
  return reply.code(STATUS_CODES.CREATED).send({ id });
}; 