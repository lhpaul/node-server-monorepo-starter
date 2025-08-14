import { STATUS_CODES } from '@repo/fastify';
import { TransactionsService } from '@repo/shared/domain';
import { DomainModelServiceError, DomainModelServiceErrorCode } from '@repo/shared/utils';
import { FastifyReply, FastifyRequest } from 'fastify';

import { ERROR_RESPONSES } from '../../transactions.endpoints.constants';
import { STEPS } from './transactions.create.handler.constants';
import { CreateTransactionBody } from './transactions.create.handler.interfaces';

export const createTransactionHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const logger = request.log.child({ handler: createTransactionHandler.name });
  const logGroup = createTransactionHandler.name;
  const service = TransactionsService.getInstance();
  const body = request.body as CreateTransactionBody;
  try {
    logger.startStep(STEPS.CREATE_TRANSACTION, logGroup);
    const id = await service
      .createResource({
        description: null,
        categoryId: null,
        ...body,
      }, logger)
      .finally(() => logger.endStep(STEPS.CREATE_TRANSACTION));
    return reply.code(STATUS_CODES.CREATED).send({ id });
  } catch (error) {
    if (error instanceof DomainModelServiceError) {
      if (error.code === DomainModelServiceErrorCode.RELATED_RESOURCE_NOT_FOUND) {
        return reply.code(STATUS_CODES.BAD_REQUEST).send({
          code: ERROR_RESPONSES.COMPANY_NOT_FOUND.code,
          message: ERROR_RESPONSES.COMPANY_NOT_FOUND.message(body.companyId),
        }); 
      }
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
