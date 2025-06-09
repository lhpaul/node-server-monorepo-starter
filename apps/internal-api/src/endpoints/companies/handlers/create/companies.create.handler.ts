import { STATUS_CODES } from '@repo/fastify';
import { CompaniesRepository } from '@repo/shared/repositories';
import { FastifyReply, FastifyRequest } from 'fastify';

import { STEPS } from './companies.create.handler.constants';
import { CreateCompanyBody } from './companies.create.handler.interfaces';

export const createCompanyHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const logger = request.log.child({ handler: createCompanyHandler.name });
  const repository = CompaniesRepository.getInstance();
  const body = request.body as CreateCompanyBody;
  logger.startStep(STEPS.CREATE_COMPANY.id);
  const id = await repository
    .createDocument(body, logger)
    .finally(() => logger.endStep(STEPS.CREATE_COMPANY.id));
  return reply.code(STATUS_CODES.CREATED).send({ id });
};
