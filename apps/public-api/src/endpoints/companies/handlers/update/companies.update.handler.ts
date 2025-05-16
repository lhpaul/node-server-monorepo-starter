import {
  CompaniesRepository,
  UpdateCompanyError,
  UpdateCompanyErrorCode,
} from '@repo/shared/repositories';
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
    await repository.updateCompany(id, body, { logger });
    logger.endStep(STEPS.UPDATE_COMPANY.id);
    return reply.code(204).send();
  } catch (error) {
    logger.endStep(STEPS.UPDATE_COMPANY.id);
    if (
      error instanceof UpdateCompanyError &&
      error.code === UpdateCompanyErrorCode.DOCUMENT_NOT_FOUND
    ) {
      return reply.code(404).send(ERROR_RESPONSES.COMPANY_NOT_FOUND);
    }
    throw error;
  }
};
