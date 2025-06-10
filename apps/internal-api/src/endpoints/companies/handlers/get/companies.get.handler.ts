import { STATUS_CODES } from '@repo/fastify';
import { CompaniesService } from '@repo/shared/services';
import { FastifyReply, FastifyRequest } from 'fastify';

import { ERROR_RESPONSES } from '../../companies.endpoints.constants';
import { STEPS } from './companies.get.handler.constants';
import { GetCompanyParams } from './companies.get.handler.interfaces';

export const getCompanyHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const logger = request.log.child({ handler: getCompanyHandler.name });
  const service = CompaniesService.getInstance();
  const { id } = request.params as GetCompanyParams;
  logger.startStep(STEPS.GET_COMPANY.id);
  const company = await service
    .getResource(id, logger)
    .finally(() => logger.endStep(STEPS.GET_COMPANY.id));
  if (!company) {
    return reply.code(STATUS_CODES.NOT_FOUND).send(ERROR_RESPONSES.COMPANY_NOT_FOUND);
  }
  return reply.code(STATUS_CODES.OK).send(company);
};
