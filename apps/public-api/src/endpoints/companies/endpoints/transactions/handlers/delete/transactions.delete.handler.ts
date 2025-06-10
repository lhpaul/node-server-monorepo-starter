import { FORBIDDEN_ERROR, RESOURCE_NOT_FOUND_ERROR, STATUS_CODES } from '@repo/fastify';
import { TransactionsService } from '@repo/shared/services';
import { DomainModelServiceError, DomainModelServiceErrorCode } from '@repo/shared/utils';
import { FastifyReply, FastifyRequest } from 'fastify';

import { AuthUser } from '../../../../../../definitions/auth.interfaces';
import { hasCompanyTransactionsDeletePermission } from '../../../../../../utils/auth/auth.utils';
import { STEPS } from './transactions.delete.handler.constants';
import { DeleteTransactionParams } from './transactions.delete.handler.interfaces';

export const deleteTransactionHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const logger = request.log.child({ handler: deleteTransactionHandler.name });
  const service = TransactionsService.getInstance();
  const { companyId, id } = request.params as DeleteTransactionParams;
  const user = request.user as AuthUser;
  if (!hasCompanyTransactionsDeletePermission(companyId, user)) {
    return reply.code(STATUS_CODES.FORBIDDEN).send({
      code: FORBIDDEN_ERROR.responseCode,
      message: FORBIDDEN_ERROR.responseMessage,
    });
  }
  logger.startStep(STEPS.DELETE_TRANSACTION.id);
  try {
    await service
      .deleteResource(id, logger)
      .finally(() => logger.endStep(STEPS.DELETE_TRANSACTION.id));
  } catch (error) {
    if (
      error instanceof DomainModelServiceError &&
      error.code === DomainModelServiceErrorCode.RESOURCE_NOT_FOUND
    ) {
      return reply.code(STATUS_CODES.NOT_FOUND).send({
        code: RESOURCE_NOT_FOUND_ERROR.responseCode,
        message: RESOURCE_NOT_FOUND_ERROR.responseMessage,
      });
    }
    throw error;
  }
  return reply.code(STATUS_CODES.NO_CONTENT).send();
};
