import { STATUS_CODES } from '@repo/fastify';
import { CompaniesService } from '@repo/shared/services';
import { DomainModelServiceError, DomainModelServiceErrorCode } from '@repo/shared/utils';
import { FastifyReply, FastifyRequest } from 'fastify';

import { ERROR_RESPONSES } from '../../companies.endpoints.constants';
import { STEPS } from './companies.update.handler.constants';
import {
  UpdateCompanyBody,
  UpdateCompanyParams,
} from './companies.update.handler.interfaces';

export const updateCompanyHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const logger = request.log.child({ handler: updateCompanyHandler.name });
  const logGroup = updateCompanyHandler.name;
  const service = CompaniesService.getInstance();
  const { id } = request.params as UpdateCompanyParams;
  const body = request.body as UpdateCompanyBody;
  try {
    logger.startStep(STEPS.UPDATE_COMPANY.id, logGroup);
    await service.updateResource(id, body, logger)
      .finally(() => logger.endStep(STEPS.UPDATE_COMPANY.id));
    return reply.code(STATUS_CODES.NO_CONTENT).send();
  } catch (error) {
    if (
      error instanceof DomainModelServiceError &&
      error.code === DomainModelServiceErrorCode.RESOURCE_NOT_FOUND
    ) {
      return reply.code(STATUS_CODES.NOT_FOUND).send(ERROR_RESPONSES.COMPANY_NOT_FOUND);
    }
    throw error;
  }
};
