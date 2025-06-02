import { STATUS_CODES } from '@repo/fastify';
import {
  CompaniesRepository,
} from '@repo/shared/repositories';
import { FastifyReply, FastifyRequest } from 'fastify';

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
  await repository
      .deleteDocument(id, logger)
      .finally(() => logger.endStep(STEPS.DELETE_COMPANY.id));
  return reply.code(STATUS_CODES.NO_CONTENT).send();
};
