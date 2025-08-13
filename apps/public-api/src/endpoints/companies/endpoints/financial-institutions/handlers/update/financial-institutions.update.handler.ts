import { FORBIDDEN_ERROR, STATUS_CODES } from '@repo/fastify';
import { CompaniesService, UpdateFinancialInstitutionError, UpdateFinancialInstitutionErrorCode } from '@repo/shared/domain';
import { FastifyReply, FastifyRequest } from 'fastify';

import { AuthUser } from '../../../../../../definitions/auth.interfaces';
import { hasCompanyFinancialInstitutionsUpdatePermission } from '../../../../../../utils/permissions';
import { STEPS } from './financial-institutions.update.handler.constants';
import { UpdateCompanyFinancialInstitutionBody, UpdateCompanyFinancialInstitutionParams } from './financial-institutions.update.handler.interfaces';

export const updateFinancialInstitutionHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const logger = request.log.child({ handler: updateFinancialInstitutionHandler.name });
  const logGroup = updateFinancialInstitutionHandler.name;
  const { companyId, id: financialInstitutionRelationId } = request.params as UpdateCompanyFinancialInstitutionParams;
  const user = request.user as AuthUser;
  
  if (!hasCompanyFinancialInstitutionsUpdatePermission(companyId, user)) {
    return reply.code(STATUS_CODES.FORBIDDEN).send({
      code: FORBIDDEN_ERROR.responseCode,
      message: FORBIDDEN_ERROR.responseMessage,
    });
  }
  
  const service = CompaniesService.getInstance();
  const body = request.body as UpdateCompanyFinancialInstitutionBody;
  
  try {
    logger.startStep(STEPS.UPDATE_FINANCIAL_INSTITUTION.id, logGroup);
    await service
      .updateFinancialInstitution(companyId, {
        financialInstitutionRelationId,
        credentials: body.credentials,
      }, logger)
      .finally(() => logger.endStep(STEPS.UPDATE_FINANCIAL_INSTITUTION.id));
    
    return reply.code(STATUS_CODES.NO_CONTENT).send();
  } catch (error) {
    if (error instanceof UpdateFinancialInstitutionError) {
      console.log('error code', error.code);
      if (error.code === UpdateFinancialInstitutionErrorCode.RELATION_NOT_FOUND) {
        return reply.code(STATUS_CODES.NOT_FOUND).send({
          code: error.code,
          message: error.message,
        });
      }
      return reply.code(STATUS_CODES.BAD_REQUEST).send({
        code: error.code,
        message: error.message,
      });
    }
    throw error;
  }
}; 