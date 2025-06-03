import { FORBIDDEN_ERROR, STATUS_CODES } from '@repo/fastify';
import { TransactionsRepository } from '@repo/shared/repositories';
import { FastifyReply, FastifyRequest } from 'fastify';

import { AuthUser } from '../../../../../../definitions/auth.types';
import { hasCompanyTransactionsCreatePermission } from '../../../../../../utils/auth/auth.utils';
import { STEPS } from './transactions.create.constants';
import { CreateCompanyTransactionBody, CreateCompanyTransactionParams } from './transactions.create.interfaces';

export const createTransactionHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const logger = request.log.child({ handler: createTransactionHandler.name });
  const { companyId } = request.params as CreateCompanyTransactionParams;
  const user = request.user as AuthUser;
  if (!hasCompanyTransactionsCreatePermission(companyId, user)) {
    return reply.code(STATUS_CODES.FORBIDDEN).send({
      code: FORBIDDEN_ERROR.responseCode,
      message: FORBIDDEN_ERROR.responseMessage,
    });
  }
  const repository = TransactionsRepository.getInstance();
  const body = request.body as CreateCompanyTransactionBody;
  logger.startStep(STEPS.CREATE_TRANSACTION.id);
  const id = await repository
    .createDocument({
      ...body,
      companyId,
    }, logger)
    .finally(() => logger.endStep(STEPS.CREATE_TRANSACTION.id));
  return reply.code(STATUS_CODES.CREATED).send({ id });
};
