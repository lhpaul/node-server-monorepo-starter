import { STATUS_CODES } from '@repo/fastify';
import { CompaniesRepository } from '@repo/shared/repositories';
import { RepositoryError, RepositoryErrorCode } from '@repo/shared/utils';
import { FastifyReply, FastifyRequest } from 'fastify';

import { ERROR_RESPONSES } from '../../companies.endpoints.constants';
import { STEPS } from './companies.update.constants';
import {
  UpdateCompanyBody,
  UpdateCompanyParams,
} from './companies.update.interfaces';

export const updateCompanyHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const logger = request.log.child({ handler: updateCompanyHandler.name });
  const repository = CompaniesRepository.getInstance();
  const { id } = request.params as UpdateCompanyParams;
  const body = request.body as UpdateCompanyBody;
  try {
    logger.startStep(
      STEPS.UPDATE_COMPANY.id,
      STEPS.UPDATE_COMPANY.obfuscatedId,
    );
    await repository.updateDocument(id, body, logger);
    logger.endStep(STEPS.UPDATE_COMPANY.id);
    return reply.code(STATUS_CODES.NO_CONTENT).send();
  } catch (error: any) {
    logger.endStep(STEPS.UPDATE_COMPANY.id);
    if (
      error instanceof RepositoryError &&
      error.code === RepositoryErrorCode.DOCUMENT_NOT_FOUND
    ) {
      return reply.code(STATUS_CODES.NOT_FOUND).send(ERROR_RESPONSES.COMPANY_NOT_FOUND);
    }
    throw error;
  }
};
