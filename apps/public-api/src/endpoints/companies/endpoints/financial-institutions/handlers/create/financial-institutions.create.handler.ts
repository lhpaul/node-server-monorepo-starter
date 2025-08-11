import { FORBIDDEN_ERROR, STATUS_CODES } from '@repo/fastify';
import { AddFinancialInstitutionError, CompaniesService } from '@repo/shared/services';
import { FastifyReply, FastifyRequest } from 'fastify';

import { AuthUser } from '../../../../../../definitions/auth.interfaces';
import { hasCompanyFinancialInstitutionsCreatePermission } from '../../../../../../utils/auth/auth.utils';
import { STEPS } from './financial-institutions.create.handler.constants';
import { CreateCompanyFinancialInstitutionBody, CreateCompanyFinancialInstitutionParams } from './financial-institutions.create.handler.interfaces';

export const createFinancialInstitutionHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const logger = request.log.child({ handler: createFinancialInstitutionHandler.name });
  const logGroup = createFinancialInstitutionHandler.name;
  const { companyId } = request.params as CreateCompanyFinancialInstitutionParams;
  const user = request.user as AuthUser;
  
  if (!hasCompanyFinancialInstitutionsCreatePermission(companyId, user)) {
    return reply.code(STATUS_CODES.FORBIDDEN).send({
      code: FORBIDDEN_ERROR.responseCode,
      message: FORBIDDEN_ERROR.responseMessage,
    });
  }
  
  const service = CompaniesService.getInstance();
  const body = request.body as CreateCompanyFinancialInstitutionBody;
  
  try {
    logger.startStep(STEPS.ADD_FINANCIAL_INSTITUTION.id, logGroup);
    const id = await service
      .addFinancialInstitution(companyId, {
        financialInstitutionId: body.financialInstitutionId,
        credentials: body.credentials,
      }, logger)
      .finally(() => logger.endStep(STEPS.ADD_FINANCIAL_INSTITUTION.id));
    
    return reply.code(STATUS_CODES.CREATED).send({ id });
  } catch (error) {
    if (error instanceof AddFinancialInstitutionError) {
      return reply.code(STATUS_CODES.BAD_REQUEST).send({
        code: error.code,
        message: error.message,
        data: error.data,
      });
    }
    throw error;
  }
}; 