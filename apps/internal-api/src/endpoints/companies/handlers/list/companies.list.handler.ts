import { STATUS_CODES, transformQueryParams } from '@repo/fastify';
import { CompaniesRepository } from '@repo/shared/repositories';
import { FastifyReply, FastifyRequest } from 'fastify';

import { STEPS } from './companies.list.constants';
import { GetCompaniesQueryParams } from './companies.list.interfaces';

export const listCompaniesHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const logger = request.log.child({ handler: listCompaniesHandler.name });
  const repository = CompaniesRepository.getInstance();
  const query = request.query as GetCompaniesQueryParams;
  logger.startStep(STEPS.GET_COMPANIES.id, STEPS.GET_COMPANIES.obfuscatedId);
  const companies = await repository
    .getDocumentsList(transformQueryParams(query), logger)
    .finally(() => logger.endStep(STEPS.GET_COMPANIES.id));
  return reply.code(STATUS_CODES.OK).send(companies);
};
