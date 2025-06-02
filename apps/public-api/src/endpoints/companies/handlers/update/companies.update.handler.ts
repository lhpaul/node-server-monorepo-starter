import { FORBIDDEN_ERROR, STATUS_CODES } from '@repo/fastify';
import { CompaniesRepository } from '@repo/shared/repositories';
import { FastifyReply, FastifyRequest } from 'fastify';

import { AuthUser } from '../../../../definitions/auth.interfaces';
import { hasCompanyUpdatePermission } from '../../../../utils/auth/auth.utils';
import { STEPS } from './companies.update.constants';
import { UpdateCompanyBody, UpdateCompanyParams } from './companies.update.interfaces';

export const updateCompanyHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const logger = request.log.child({ handler: updateCompanyHandler.name });
  const repository = CompaniesRepository.getInstance();
  const { id } = request.params as UpdateCompanyParams;
  const body = request.body as UpdateCompanyBody;
  const user = request.user as AuthUser;
  if (!hasCompanyUpdatePermission(id, user)) {
    return reply.code(STATUS_CODES.FORBIDDEN).send({
      code: FORBIDDEN_ERROR.responseCode,
      message: FORBIDDEN_ERROR.responseMessage,
    });
  }
  logger.startStep(
    STEPS.UPDATE_COMPANY.id,
    STEPS.UPDATE_COMPANY.obfuscatedId,
  );
  await repository.updateDocument(id, body, logger)
    .finally(() => logger.endStep(STEPS.UPDATE_COMPANY.id));
  return reply.code(STATUS_CODES.NO_CONTENT).send();
};
