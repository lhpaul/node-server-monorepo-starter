import { FORBIDDEN_ERROR, STATUS_CODES } from '@repo/fastify';
import { TransactionsService } from '@repo/shared/services';
import { FastifyReply, FastifyRequest } from 'fastify';

import { AuthUser } from '../../../../../../definitions/auth.interfaces';
import { hasCompanyTransactionsCreatePermission } from '../../../../../../utils/auth/auth.utils';
import { STEPS } from './transactions.create.handler.constants';
import { CreateCompanyTransactionBody, CreateCompanyTransactionParams } from './transactions.create.handler.interfaces';

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
  const service = TransactionsService.getInstance();
  const body = request.body as CreateCompanyTransactionBody;
  logger.startStep(STEPS.CREATE_TRANSACTION.id);
  const id = await service
    .createResource({
      ...body,
      companyId,
    }, logger)
    .finally(() => logger.endStep(STEPS.CREATE_TRANSACTION.id));
  return reply.code(STATUS_CODES.CREATED).send({ id });
};
