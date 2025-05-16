import { CompaniesRepository } from '@repo/shared/repositories';
import { FastifyReply, FastifyRequest } from 'fastify';

import { STEPS } from './companies.create.constants';
import { CreateCompanyBody } from './companies.create.interfaces';

export const createCompanyHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const logger = request.log.child({ handler: createCompanyHandler.name });
  const repository = CompaniesRepository.getInstance();
  const body = request.body as CreateCompanyBody;
  logger.startStep(STEPS.CREATE_COMPANY.id, STEPS.CREATE_COMPANY.obfuscatedId);
  const { id } = await repository
    .createCompany(body, { logger })
    .finally(() => logger.endStep(STEPS.CREATE_COMPANY.id));
  return reply.code(201).send({ id });
};
