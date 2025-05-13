import { FastifyReply, FastifyRequest } from 'fastify';
import { CompaniesRepository } from '@repo/shared/repositories';

import { ERROR_RESPONSES } from '../../companies.endpoints.constants';
import { STEPS } from './companies.get.constants';
import { GetCompanyParams } from './companies.get.interfaces';

export const getCompanyHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const logger = request.log.child({ handler: getCompanyHandler.name });
  const repository = CompaniesRepository.getInstance();
  const { id } = request.params as GetCompanyParams;
  logger.startStep(STEPS.GET_COMPANY.id, STEPS.GET_COMPANY.obfuscatedId);
  const company = await repository
    .getCompanyById(id, { logger })
    .finally(() => logger.endStep(STEPS.GET_COMPANY.id));
  if (!company) {
    return reply.code(404).send(ERROR_RESPONSES.COMPANY_NOT_FOUND);
  }
  return reply.code(200).send(company);
};
