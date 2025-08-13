import { STATUS_CODES, transformQueryParams } from '@repo/fastify';
import { CompaniesService } from '@repo/shared/domain';
import { FastifyReply, FastifyRequest } from 'fastify';

import { STEPS } from './companies.list.handler.constants';
import { GetCompaniesQueryParams } from './companies.list.handler.interfaces';

export const listCompaniesHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const logger = request.log.child({ handler: listCompaniesHandler.name });
  const logGroup = listCompaniesHandler.name;
  const service = CompaniesService.getInstance();
  const query = request.query as GetCompaniesQueryParams;
  logger.startStep(STEPS.GET_COMPANIES.id, logGroup);
  const companies = await service
    .getResourcesList(transformQueryParams(query), logger)
    .finally(() => logger.endStep(STEPS.GET_COMPANIES.id));
  return reply.code(STATUS_CODES.OK).send(companies);
};
