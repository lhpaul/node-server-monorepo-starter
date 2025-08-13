import { STATUS_CODES, FORBIDDEN_ERROR } from '@repo/fastify';
import { TransactionsService } from '@repo/shared/domain';
import { DomainModelServiceError, DomainModelServiceErrorCode } from '@repo/shared/utils';
import { FastifyReply, FastifyRequest } from 'fastify';

import { AuthUser } from '../../../../../../definitions/auth.interfaces';
import { hasCompanyTransactionsUpdatePermission } from '../../../../../../utils/permissions';
import { ERROR_RESPONSES } from '../../transactions.endpoints.constants';
import { STEPS } from './transactions.update.handler.constants';
import {
  UpdateTransactionBody,
  UpdateTransactionParams,
} from './transactions.update.handler.interfaces';

export const updateTransactionHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const logger = request.log.child({ handler: updateTransactionHandler.name });
  const logGroup = updateTransactionHandler.name;
  const service = TransactionsService.getInstance();
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
    logger.startStep(STEPS.UPDATE_TRANSACTION.id, logGroup);
    await service.updateResource(id, body, logger)
    .finally(() => logger.endStep(STEPS.UPDATE_TRANSACTION.id));
    return reply.code(STATUS_CODES.NO_CONTENT).send();
  } catch (error) {
    if (error instanceof DomainModelServiceError) {
      if (error.code === DomainModelServiceErrorCode.INVALID_INPUT) {
        return reply.code(STATUS_CODES.BAD_REQUEST).send({
          code: error.code,
          message: error.message,
          data: error.data,
        });
      }
      if (error.code === DomainModelServiceErrorCode.RESOURCE_NOT_FOUND) {
        return reply.code(STATUS_CODES.NOT_FOUND).send(ERROR_RESPONSES.TRANSACTION_NOT_FOUND);
      }
    }
    throw error;
  }
};
