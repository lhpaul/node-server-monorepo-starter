import { FORBIDDEN_ERROR, STATUS_CODES } from '@repo/fastify';
import { CompaniesService, RemoveFinancialInstitutionError } from '@repo/shared/services';
import { DomainModelServiceError, DomainModelServiceErrorCode } from '@repo/shared/utils';
import { FastifyReply, FastifyRequest } from 'fastify';

import { AuthUser } from '../../../../../../definitions/auth.interfaces';
import { hasCompanyFinancialInstitutionsDeletePermission } from '../../../../../../utils/auth/auth.utils';
import { ERROR_RESPONSES } from '../../financial-institutions.endpoints.constants';
import { STEPS } from './financial-institutions.delete.handler.constants';
import { DeleteCompanyFinancialInstitutionParams } from './financial-institutions.delete.handler.interfaces';

export const deleteFinancialInstitutionHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const logger = request.log.child({ handler: deleteFinancialInstitutionHandler.name });
  const logGroup = deleteFinancialInstitutionHandler.name;
  const { companyId, id: financialInstitutionRelationId } = request.params as DeleteCompanyFinancialInstitutionParams;
  const user = request.user as AuthUser;
  
  if (!hasCompanyFinancialInstitutionsDeletePermission(companyId, user)) {
    return reply.code(STATUS_CODES.FORBIDDEN).send({
      code: FORBIDDEN_ERROR.responseCode,
      message: FORBIDDEN_ERROR.responseMessage,
    });
  }
  
  const service = CompaniesService.getInstance();
  
  try {
    logger.startStep(STEPS.REMOVE_FINANCIAL_INSTITUTION.id, logGroup);
    await service
      .removeFinancialInstitution(companyId, {
        financialInstitutionRelationId,
      }, logger)
      .finally(() => logger.endStep(STEPS.REMOVE_FINANCIAL_INSTITUTION.id));
    
    return reply.code(STATUS_CODES.NO_CONTENT).send();
  } catch (error) {
    if (error instanceof RemoveFinancialInstitutionError) {
      return reply.code(STATUS_CODES.NOT_FOUND).send({
        code: error.code,
        message: error.message,
      });
    }
    throw error;
  }
}; 