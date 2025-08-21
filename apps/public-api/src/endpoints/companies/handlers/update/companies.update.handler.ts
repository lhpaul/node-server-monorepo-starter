import { FORBIDDEN_ERROR, STATUS_CODES } from '@repo/fastify';
import { CompaniesService } from '@repo/shared/domain';
import { DomainModelServiceError, DomainModelServiceErrorCode } from '@repo/shared/utils';
import { FastifyReply, FastifyRequest } from 'fastify';

import { AuthUser } from '../../../../definitions/auth.interfaces';
import { hasCompanyUpdatePermission } from '../../../../utils/permissions';
import { COMPANY_NOT_FOUND_ERROR } from '../../companies.endpoints.constants';
import { STEPS } from './companies.update.handler.constants';
import { UpdateCompanyBody, UpdateCompanyParams } from './companies.update.handler.interfaces';

export const updateCompanyHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const logger = request.log.child({ handler: updateCompanyHandler.name });
  const logGroup = updateCompanyHandler.name;
  const service = CompaniesService.getInstance();
  const { id } = request.params as UpdateCompanyParams;
  const body = request.body as UpdateCompanyBody;
  const user = request.user as AuthUser;
  if (!hasCompanyUpdatePermission(id, user)) {
    return reply.code(STATUS_CODES.FORBIDDEN).send({
      code: FORBIDDEN_ERROR.responseCode,
      message: FORBIDDEN_ERROR.responseMessage,
    });
  }
  try {
    logger.startStep(STEPS.UPDATE_COMPANY, logGroup);
    await service.updateResource(id, body, logger)
      .finally(() => logger.endStep(STEPS.UPDATE_COMPANY));
    return reply.code(STATUS_CODES.NO_CONTENT).send();
  } catch (error) {
    if (
      error instanceof DomainModelServiceError &&
      error.code === DomainModelServiceErrorCode.RESOURCE_NOT_FOUND
    ) { // this should never happen since the user has permission to update the company so it should exist
      throw new Error(COMPANY_NOT_FOUND_ERROR(id));
    }
    throw error;
  }
};
