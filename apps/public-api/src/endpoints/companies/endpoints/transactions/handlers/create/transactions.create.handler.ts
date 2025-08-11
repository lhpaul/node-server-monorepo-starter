import { FORBIDDEN_ERROR, STATUS_CODES } from '@repo/fastify';
import { TransactionSourceType } from '@repo/shared/domain';
import { TransactionsService } from '@repo/shared/domain';
import { DomainModelServiceError, DomainModelServiceErrorCode } from '@repo/shared/utils';
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
  const logGroup = createTransactionHandler.name;
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
  try {
    logger.startStep(STEPS.CREATE_TRANSACTION.id, logGroup);
    const id = await service
      .createResource({
        categoryId: null,
        description: null,
        ...body,
        sourceId: user.userId,
        sourceTransactionId: new Date().getTime().toString(),
        sourceType: TransactionSourceType.USER,
        companyId,
      }, logger)
      .finally(() => logger.endStep(STEPS.CREATE_TRANSACTION.id));
    return reply.code(STATUS_CODES.CREATED).send({ id });
  } catch (error) {
    if (error instanceof DomainModelServiceError) {
      if (error.code === DomainModelServiceErrorCode.INVALID_INPUT) {
        return reply.code(STATUS_CODES.BAD_REQUEST).send({
          code: error.code,
          message: error.message,
          data: error.data,
        });
      }
    }
    throw error;
  }
};
