import { FORBIDDEN_ERROR, STATUS_CODES } from '@repo/fastify';
import { CompaniesRepository } from '@repo/shared/repositories';
import { FastifyReply, FastifyRequest } from 'fastify';

import { AuthUser } from '../../../../definitions/auth.types';
import { hasCompanyReadPermission } from '../../../../utils/auth/auth.utils';
import { COMPANY_NOT_FOUND_ERROR } from '../../companies.endpoints.constants';
import { STEPS } from './companies.get.constants';
import { GetCompanyParams } from './companies.get.interfaces';

export const getCompanyHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const logger = request.log.child({ handler: getCompanyHandler.name });
  const repository = CompaniesRepository.getInstance();
  const { id } = request.params as GetCompanyParams;
  const user = request.user as AuthUser;
  if (!hasCompanyReadPermission(id, user)) {
    return reply.code(STATUS_CODES.FORBIDDEN).send({
      code: FORBIDDEN_ERROR.responseCode,
      message: FORBIDDEN_ERROR.responseMessage,
    });
  }
  logger.startStep(STEPS.GET_COMPANY.id);
  const company = await repository
    .getDocument(id, logger)
    .finally(() => logger.endStep(STEPS.GET_COMPANY.id));
  if (!company) { // this should never happen since the user has permission to read the company so it should exist
    throw new Error(COMPANY_NOT_FOUND_ERROR(id));
  }
  return reply.code(STATUS_CODES.OK).send(company);
};
