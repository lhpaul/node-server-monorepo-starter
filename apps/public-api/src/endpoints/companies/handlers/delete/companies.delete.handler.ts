import { FastifyReply, FastifyRequest } from 'fastify';
import {
  DeleteCompanyError,
  CompaniesRepository,
  DeleteCompanyErrorCode,
} from '@repo/shared/repositories';

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
  logger.startStep(STEPS.DELETE_COMPANY.id, STEPS.DELETE_COMPANY.obfuscatedId);
  try {
    await repository
      .deleteCompany(id, { logger })
      .finally(() => logger.endStep(STEPS.DELETE_COMPANY.id));
  } catch (error) {
    if (
      error instanceof DeleteCompanyError &&
      error.code === DeleteCompanyErrorCode.DOCUMENT_NOT_FOUND
    ) {
      return reply.code(404).send(ERROR_RESPONSES.COMPANY_NOT_FOUND);
    }
    throw error;
  }
  return reply.code(204).send();
};
