import { STATUS_CODES, FORBIDDEN_ERROR } from '@repo/fastify';
import {
  TransactionsRepository,
  UpdateTransactionError,
} from '@repo/shared/repositories';
import { FastifyReply, FastifyRequest } from 'fastify';

import { AuthUser } from '../../../../../../definitions/auth.types';
import { hasCompanyTransactionsUpdatePermission } from '../../../../../../utils/auth/auth.utils';
import { ERROR_RESPONSES } from '../../transactions.endpoints.constants';
import { STEPS } from './transactions.update.constants';
import {
  UpdateTransactionBody,
  UpdateTransactionParams,
} from './transactions.update.interfaces';


export const updateTransactionHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const logger = request.log.child({ handler: updateTransactionHandler.name });
  const repository = TransactionsRepository.getInstance();
  const { companyId, id } = request.params as UpdateTransactionParams;
  const body = request.body as UpdateTransactionBody;
  const user = request.user as AuthUser;
  if (!hasCompanyTransactionsUpdatePermission(companyId, user)) {
    return reply.code(STATUS_CODES.FORBIDDEN).send({
      code: FORBIDDEN_ERROR.responseCode,
      message: FORBIDDEN_ERROR.responseMessage,
    });
  }
  try {
    logger.startStep(
      STEPS.UPDATE_TRANSACTION.id,
      STEPS.UPDATE_TRANSACTION.obfuscatedId,
    );
    await repository.updateTransaction(id, body, { logger })
    .finally(() => logger.endStep(STEPS.UPDATE_TRANSACTION.id));
    return reply.code(STATUS_CODES.NO_CONTENT).send();
  } catch (error) {
    if (error instanceof UpdateTransactionError) {
      return reply.code(STATUS_CODES.NOT_FOUND).send(ERROR_RESPONSES.TRANSACTION_NOT_FOUND);
    }
    throw error;
  }
};
