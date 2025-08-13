import { FORBIDDEN_ERROR, STATUS_CODES } from '@repo/fastify';
import { CompaniesService } from '@repo/shared/domain';
import { maskFields } from '@repo/shared/utils';
import { FastifyReply, FastifyRequest } from 'fastify';

import { AuthUser } from '../../../../../../definitions/auth.interfaces';
import { hasCompanyFinancialInstitutionsGetPermission } from '../../../../../../utils/permissions';
import { CREDENTIALS_FIELDS_TO_MASK, ERROR_RESPONSES } from '../../financial-institutions.endpoints.constants';
import { STEPS } from './financial-institutions.get.handler.constants';
import { GetCompanyFinancialInstitutionParams } from './financial-institutions.get.handler.interfaces';

export const getFinancialInstitutionHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const logger = request.log.child({ handler: getFinancialInstitutionHandler.name });
  const logGroup = getFinancialInstitutionHandler.name;
  const { companyId, id: financialInstitutionRelationId } = request.params as GetCompanyFinancialInstitutionParams;
  const user = request.user as AuthUser;
  
  if (!hasCompanyFinancialInstitutionsGetPermission(companyId, user)) {
    return reply.code(STATUS_CODES.FORBIDDEN).send({
      code: FORBIDDEN_ERROR.responseCode,
      message: FORBIDDEN_ERROR.responseMessage,
    });
  }
  
  const companiesService = CompaniesService.getInstance();
  
  logger.startStep(STEPS.GET_FINANCIAL_INSTITUTION.id, logGroup);
    const financialInstitution = await companiesService
      .getFinancialInstitution(companyId, { financialInstitutionRelationId }, logger)
      .finally(() => logger.endStep(STEPS.GET_FINANCIAL_INSTITUTION.id));
    
    if (!financialInstitution) {
      return reply.code(STATUS_CODES.NOT_FOUND).send({
        code: ERROR_RESPONSES.FINANCIAL_INSTITUTION_RELATION_NOT_FOUND.code,
        message: ERROR_RESPONSES.FINANCIAL_INSTITUTION_RELATION_NOT_FOUND.message,
      });
    }
    
    return reply.code(STATUS_CODES.OK).send({
      ...financialInstitution,
      credentials: maskFields(financialInstitution.credentials, CREDENTIALS_FIELDS_TO_MASK),
    });
}; 