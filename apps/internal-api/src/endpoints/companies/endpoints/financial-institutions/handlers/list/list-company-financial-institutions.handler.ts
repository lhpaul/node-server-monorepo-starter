import { STATUS_CODES } from '@repo/fastify';
import { CompaniesService } from '@repo/shared/services';
import { maskFields } from '@repo/shared/utils';
import { FastifyReply, FastifyRequest } from 'fastify';

import { CREDENTIALS_FIELDS_TO_MASK } from '../../financial-institutions.endpoints.constants';
import { STEPS } from './list-company-financial-institutions.handler.constants';
import { ListCompanyFinancialInstitutionsParams } from './list-company-financial-institutions.handler.interfaces';

export const listCompanyFinancialInstitutionsHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const logger = request.log.child({ handler: listCompanyFinancialInstitutionsHandler.name });
  const logGroup = listCompanyFinancialInstitutionsHandler.name;
  const { companyId } = request.params as ListCompanyFinancialInstitutionsParams;
  
  const service = CompaniesService.getInstance();
  
  logger.startStep(STEPS.GET_FINANCIAL_INSTITUTIONS.id, logGroup);
  const financialInstitutions = await service
    .listFinancialInstitutions(companyId, logger)
    .finally(() => logger.endStep(STEPS.GET_FINANCIAL_INSTITUTIONS.id));
  
    const data = financialInstitutions.map(fi => ({
      ...fi,
      credentials: maskFields(fi.credentials, CREDENTIALS_FIELDS_TO_MASK),
    }));
    
    return reply.code(STATUS_CODES.OK).send(data);
}; 