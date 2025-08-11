import { STATUS_CODES } from '@repo/fastify';
import { FinancialInstitutionsService } from '@repo/shared/services';
import { DomainModelServiceError, DomainModelServiceErrorCode } from '@repo/shared/utils';
import { FastifyReply, FastifyRequest } from 'fastify';

import { ERROR_RESPONSES } from '../../../financial-institutions/financial-institutions.endpoints.constants';
import { STEPS } from './financial-institutions.delete.handler.constants';
import { DeleteFinancialInstitutionParams } from './financial-institutions.delete.handler.interfaces';

export const deleteFinancialInstitutionHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const logger = request.log.child({ handler: deleteFinancialInstitutionHandler.name });
  const logGroup = deleteFinancialInstitutionHandler.name;
  const service = FinancialInstitutionsService.getInstance();
  const params = request.params as DeleteFinancialInstitutionParams;
  
  try {
    logger.startStep(STEPS.DELETE_FINANCIAL_INSTITUTION.id, logGroup);
    await service
      .deleteResource(params.id, logger)
      .finally(() => logger.endStep(STEPS.DELETE_FINANCIAL_INSTITUTION.id));
  } catch (error) {
    if (error instanceof DomainModelServiceError && error.code === DomainModelServiceErrorCode.RESOURCE_NOT_FOUND) {
      return reply.code(STATUS_CODES.NOT_FOUND).send(ERROR_RESPONSES.FINANCIAL_INSTITUTION_NOT_FOUND);
    }
    throw error;
  }
  
  return reply.code(STATUS_CODES.NO_CONTENT).send();
}; 