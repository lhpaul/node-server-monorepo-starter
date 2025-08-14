import { FORBIDDEN_ERROR, STATUS_CODES } from '@repo/fastify';
import { CompaniesService } from '@repo/shared/domain';
import { maskFields } from '@repo/shared/utils';
import { FastifyReply, FastifyRequest } from 'fastify';

import { AuthUser } from '../../../../../../definitions/auth.interfaces';
import { hasCompanyFinancialInstitutionsListPermission } from '../../../../../../utils/permissions';
import { CREDENTIALS_FIELDS_TO_MASK } from '../../financial-institutions.endpoints.constants';
import { STEPS } from './financial-institutions.list.handler.constants';
import { ListCompanyFinancialInstitutionsParams } from './financial-institutions.list.handler.interfaces';

export const listFinancialInstitutionsHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const logger = request.log.child({ handler: listFinancialInstitutionsHandler.name });
  const logGroup = listFinancialInstitutionsHandler.name;
  const { companyId } = request.params as ListCompanyFinancialInstitutionsParams;
  const user = request.user as AuthUser;
  
  if (!hasCompanyFinancialInstitutionsListPermission(companyId, user)) {
    return reply.code(STATUS_CODES.FORBIDDEN).send({
      code: FORBIDDEN_ERROR.responseCode,
      message: FORBIDDEN_ERROR.responseMessage,
    });
  }
  
  const service = CompaniesService.getInstance();
  
  logger.startStep(STEPS.GET_FINANCIAL_INSTITUTIONS, logGroup);
  const financialInstitutions = await service
    .listFinancialInstitutions(companyId, logger)
    .finally(() => logger.endStep(STEPS.GET_FINANCIAL_INSTITUTIONS));
  
  const data = financialInstitutions.map(fi => ({
    ...fi,
    credentials: maskFields(fi.credentials, CREDENTIALS_FIELDS_TO_MASK),
  }));
  
  return reply.code(STATUS_CODES.OK).send(data);
}; 