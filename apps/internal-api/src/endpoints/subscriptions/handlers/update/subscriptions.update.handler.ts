import { mapDateQueryParams, STATUS_CODES } from '@repo/fastify';
import { SubscriptionsRepository } from '@repo/shared/repositories';
import { RepositoryError, RepositoryErrorCode } from '@repo/shared/utils';
import { FastifyReply, FastifyRequest } from 'fastify';

import { ERROR_RESPONSES } from '../../subscriptions.endpoints.constants';
import { STEPS } from './subscriptions.update.handler.constants';
import { UpdateSubscriptionParams, UpdateSubscriptionBody } from './subscriptions.update.handler.interfaces';

export const updateSubscriptionHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const logger = request.log.child({ handler: updateSubscriptionHandler.name });
  const repository = SubscriptionsRepository.getInstance();
  const { id } = request.params as UpdateSubscriptionParams;
  const body = request.body as UpdateSubscriptionBody;
  try {
    logger.startStep(STEPS.UPDATE_SUBSCRIPTION.id);
    await repository.updateDocument(id, mapDateQueryParams(body as Record<string, string>, ['startsAt', 'endsAt']), logger);
    logger.endStep(STEPS.UPDATE_SUBSCRIPTION.id);
    return reply.code(STATUS_CODES.NO_CONTENT).send();
  } catch (error) {
    logger.endStep(STEPS.UPDATE_SUBSCRIPTION.id);
    if (error instanceof RepositoryError && error.code === RepositoryErrorCode.DOCUMENT_NOT_FOUND) {
      return reply.code(STATUS_CODES.NOT_FOUND).send(ERROR_RESPONSES.SUBSCRIPTION_NOT_FOUND);
    }
    throw error;
  }
}; 