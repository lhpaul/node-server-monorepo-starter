import { STATUS_CODES } from '@repo/fastify';
import { CompaniesRepository } from '@repo/shared/repositories';
import { RepositoryError, RepositoryErrorCode } from '@repo/shared/utils';
import { FastifyReply, FastifyRequest } from 'fastify';

import { ERROR_RESPONSES } from '../../companies.endpoints.constants';
import { STEPS } from './companies.delete.constants';
import { DeleteCompanyParams } from './companies.delete.interfaces';


export const deleteCompanyHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const logger = request.log.child({ handler: deleteCompanyHandler.name });
  const repository = CompaniesRepository.getInstance();
  const { id } = request.params as DeleteCompanyParams;
  logger.startStep(STEPS.DELETE_COMPANY.id);
  try {
    await repository
      .deleteDocument(id, logger)
      .finally(() => logger.endStep(STEPS.DELETE_COMPANY.id));
  } catch (error) {
    if (
      error instanceof RepositoryError &&
      error.code === RepositoryErrorCode.DOCUMENT_NOT_FOUND
    ) {
      return reply.code(STATUS_CODES.NOT_FOUND).send(ERROR_RESPONSES.COMPANY_NOT_FOUND);
    }
    throw error;
  }
  return reply.code(STATUS_CODES.NO_CONTENT).send();
};
