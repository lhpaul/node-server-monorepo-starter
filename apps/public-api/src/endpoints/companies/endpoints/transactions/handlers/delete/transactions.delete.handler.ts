import { FORBIDDEN_ERROR, RESOURCE_NOT_FOUND_ERROR, STATUS_CODES } from '@repo/fastify';
import { FastifyReply, FastifyRequest } from 'fastify';
import {
  DeleteTransactionError,
  DeleteTransactionErrorCode,
  TransactionsRepository,
} from '@repo/shared/repositories';

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
  try {
    await repository
      .deleteTransaction(id, { logger })
      .finally(() => logger.endStep(STEPS.DELETE_TRANSACTION.id));
  } catch (error) {
    if (
      error instanceof DeleteTransactionError &&
      error.code === DeleteTransactionErrorCode.DOCUMENT_NOT_FOUND
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
