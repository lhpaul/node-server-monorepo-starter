import { STATUS_CODES } from '@repo/fastify';
import { CompaniesService } from '@repo/shared/services';
import { DomainModelServiceError, DomainModelServiceErrorCode } from '@repo/shared/utils';
import { FastifyReply, FastifyRequest } from 'fastify';

import { ERROR_RESPONSES } from '../../companies.endpoints.constants';
import { STEPS } from './companies.delete.handler.constants';
import { DeleteCompanyParams } from './companies.delete.handler.interfaces';


export const deleteCompanyHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const logger = request.log.child({ handler: deleteCompanyHandler.name });
  const service = CompaniesService.getInstance();
  const { id } = request.params as DeleteCompanyParams;
  logger.startStep(STEPS.DELETE_COMPANY.id);
  try {
    await service
      .deleteResource(id, logger)
      .finally(() => logger.endStep(STEPS.DELETE_COMPANY.id));
  } catch (error) {
    if (
      error instanceof DomainModelServiceError &&
      error.code === DomainModelServiceErrorCode.RESOURCE_NOT_FOUND
    ) {
      return reply.code(STATUS_CODES.NOT_FOUND).send(ERROR_RESPONSES.COMPANY_NOT_FOUND);
    }
    throw error;
  }
  return reply.code(STATUS_CODES.NO_CONTENT).send();
};
