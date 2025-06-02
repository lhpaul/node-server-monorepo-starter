import { FORBIDDEN_ERROR, STATUS_CODES } from '@repo/fastify';
import { TransactionsRepository } from '@repo/shared/repositories';
import { FastifyReply, FastifyRequest } from 'fastify';

import { AuthUser } from '../../../../../../definitions/auth.interfaces';
import { hasCompanyTransactionsDeletePermission } from '../../../../../../utils/auth/auth.utils';
import { STEPS } from './transactions.delete.constants';
import { DeleteTransactionParams } from './transactions.delete.interfaces';

export const deleteTransactionHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const logger = request.log.child({ handler: deleteTransactionHandler.name });
  const repository = TransactionsRepository.getInstance();
  const { companyId, id } = request.params as DeleteTransactionParams;
  const user = request.user as AuthUser;
  if (!hasCompanyTransactionsDeletePermission(companyId, user)) {
    return reply.code(STATUS_CODES.FORBIDDEN).send({
      code: FORBIDDEN_ERROR.responseCode,
      message: FORBIDDEN_ERROR.responseMessage,
    });
  }
  logger.startStep(
    STEPS.DELETE_TRANSACTION.id,
    STEPS.DELETE_TRANSACTION.obfuscatedId,
  );
  await repository
    .deleteDocument(id, logger)
    .finally(() => logger.endStep(STEPS.DELETE_TRANSACTION.id));
  return reply.code(STATUS_CODES.NO_CONTENT).send();
};
