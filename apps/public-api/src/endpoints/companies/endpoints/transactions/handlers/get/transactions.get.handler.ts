import { STATUS_CODES, FORBIDDEN_ERROR, RESOURCE_NOT_FOUND_ERROR } from '@repo/fastify';
import { TransactionsRepository } from '@repo/shared/repositories';
import { FastifyReply, FastifyRequest } from 'fastify';

import { AuthUser } from '../../../../../../definitions/auth.interfaces';
import { hasCompanyTransactionsReadPermission } from '../../../../../../utils/auth/auth.utils';
import { STEPS } from './transactions.get.constants';
import { GetTransactionParams } from './transactions.get.interfaces';
export const getTransactionHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const logger = request.log.child({ handler: getTransactionHandler.name });
  const repository = TransactionsRepository.getInstance();
  const { companyId, id } = request.params as GetTransactionParams;
  const user = request.user as AuthUser;
  if (!hasCompanyTransactionsReadPermission(companyId, user)) {
    return reply.code(STATUS_CODES.FORBIDDEN).send({
      code: FORBIDDEN_ERROR.responseCode,
      message: FORBIDDEN_ERROR.responseMessage,
    });
  }
  logger.startStep(
    STEPS.GET_TRANSACTION.id,
    STEPS.GET_TRANSACTION.obfuscatedId,
  );
  const transaction = await repository
    .getTransactionById(id, { logger })
    .finally(() => logger.endStep(STEPS.GET_TRANSACTION.id));
  if (!transaction) {
    return reply.code(STATUS_CODES.NOT_FOUND).send({
      code: RESOURCE_NOT_FOUND_ERROR.responseCode,
      message: RESOURCE_NOT_FOUND_ERROR.responseMessage,
    });
  }
  return reply.code(STATUS_CODES.OK).send(transaction);
};
