import { STATUS_CODES } from '@repo/fastify';
import { CompaniesService } from '@repo/shared/domain';
import { FastifyReply, FastifyRequest } from 'fastify';

import { STEPS } from './companies.create.handler.constants';
import { CreateCompanyBody } from './companies.create.handler.interfaces';

export const createCompanyHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const logger = request.log.child({ handler: createCompanyHandler.name });
  const logGroup = createCompanyHandler.name;
  const service = CompaniesService.getInstance();
  const body = request.body as CreateCompanyBody;
  logger.startStep(STEPS.CREATE_COMPANY, logGroup);
  const id = await service
    .createResource(body, logger)
    .finally(() => logger.endStep(STEPS.CREATE_COMPANY));
  return reply.code(STATUS_CODES.CREATED).send({ id });
};
