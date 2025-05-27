import { FORBIDDEN_ERROR, STATUS_CODES, transformQueryParams } from '@repo/fastify';
import { TransactionsRepository } from '@repo/shared/repositories';
import { FastifyReply, FastifyRequest } from 'fastify';

import { STEPS } from './transactions.list.constants';
import { GetTransactionsParams, GetTransactionsQueryParams } from './transactions.list.interfaces';
import { hasCompanyTransactionsReadPermission } from '../../../../../../utils/auth/auth.utils';
import { AuthUser } from '../../../../../../definitions/auth.interfaces';

export const listTransactionsHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const logger = request.log.child({ handler: listTransactionsHandler.name });
  const repository = TransactionsRepository.getInstance();
  const { companyId } = request.params as GetTransactionsParams;
  const user = request.user as AuthUser;
  if (!hasCompanyTransactionsReadPermission(companyId, user)) {
    return reply.code(STATUS_CODES.FORBIDDEN).send({
      code: FORBIDDEN_ERROR.responseCode,
      message: FORBIDDEN_ERROR.responseMessage,
    });
  }
  const query = request.query as GetTransactionsQueryParams;
  logger.startStep(
    STEPS.GET_TRANSACTIONS.id,
    STEPS.GET_TRANSACTIONS.obfuscatedId,
  );
  const transactions = await repository
    .getTransactions(transformQueryParams(query), { logger })
    .finally(() => logger.endStep(STEPS.GET_TRANSACTIONS.id));
  return reply.code(STATUS_CODES.OK).send(transactions);
};
