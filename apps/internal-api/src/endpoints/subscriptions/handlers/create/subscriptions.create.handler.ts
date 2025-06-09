import { STATUS_CODES } from '@repo/fastify';
import { SubscriptionsRepository } from '@repo/shared/repositories';
import { RepositoryError, RepositoryErrorCode } from '@repo/shared/utils';
import { FastifyReply, FastifyRequest } from 'fastify';

import { ERROR_RESPONSES } from '../../subscriptions.endpoints.constants';
import { STEPS } from './subscriptions.create.handler.constants';
import { CreateSubscriptionBody } from './subscriptions.create.handler.interfaces';

export const createSubscriptionHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const logger = request.log.child({ handler: createSubscriptionHandler.name });
  const repository = SubscriptionsRepository.getInstance();
  const body = request.body as CreateSubscriptionBody;
  logger.startStep(STEPS.CREATE_SUBSCRIPTION.id);
  try {
    const id = await repository
      .createDocument({
        ...body,
        startsAt: new Date(body.startsAt),
        endsAt: new Date(body.endsAt),
      }, logger)
      .finally(() => logger.endStep(STEPS.CREATE_SUBSCRIPTION.id));
    return reply.code(STATUS_CODES.CREATED).send({ id });
  } catch (error) {
    if (error instanceof RepositoryError && error.code === RepositoryErrorCode.RELATED_DOCUMENT_NOT_FOUND) {
      return reply.code(STATUS_CODES.BAD_REQUEST).send({
        code: ERROR_RESPONSES.COMPANY_NOT_FOUND.code,
        message: ERROR_RESPONSES.COMPANY_NOT_FOUND.message(body.companyId),
      });
    }
    throw error;
  }
};