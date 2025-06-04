import { STATUS_CODES } from '@repo/fastify';
import { TransactionsRepository } from '@repo/shared/repositories';
import { FastifyReply, FastifyRequest } from 'fastify';

import { ERROR_RESPONSES, STEPS } from './transactions.create.constants';
import { CreateTransactionBody } from './transactions.create.interfaces';
import { RepositoryError, RepositoryErrorCode } from '@repo/shared/utils';

export const createTransactionHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const logger = request.log.child({ handler: createTransactionHandler.name });
  const repository = TransactionsRepository.getInstance();
  const body = request.body as CreateTransactionBody;
  logger.startStep(STEPS.CREATE_TRANSACTION.id);
  try {
    const id = await repository
      .createDocument(body, logger)
      .finally(() => logger.endStep(STEPS.CREATE_TRANSACTION.id));
    return reply.code(STATUS_CODES.CREATED).send({ id });
  } catch (error) {
    if (error instanceof RepositoryError && error.code === RepositoryErrorCode.RELATED_DOCUMENT_NOT_FOUND) {
      return reply.code(STATUS_CODES.BAD_REQUEST).send(ERROR_RESPONSES.COMPANY_NOT_FOUND);
    }
    throw error;
  }
};
