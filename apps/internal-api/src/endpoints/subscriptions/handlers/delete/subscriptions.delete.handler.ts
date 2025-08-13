import { STATUS_CODES } from '@repo/fastify';
import { SubscriptionsService } from '@repo/shared/domain';
import { DomainModelServiceError, DomainModelServiceErrorCode } from '@repo/shared/utils';
import { FastifyReply, FastifyRequest } from 'fastify';

import { ERROR_RESPONSES } from '../../subscriptions.endpoints.constants';
import { STEPS } from './subscriptions.delete.handler.constants';
import { DeleteSubscriptionParams } from './subscriptions.delete.handler.interfaces';

export const deleteSubscriptionHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const logger = request.log.child({ handler: deleteSubscriptionHandler.name });
  const logGroup = deleteSubscriptionHandler.name;
  const service = SubscriptionsService.getInstance();
  const { id } = request.params as DeleteSubscriptionParams;
  logger.startStep(STEPS.DELETE_SUBSCRIPTION.id, logGroup);
  try {
    await service
      .deleteResource(id, logger)
      .finally(() => logger.endStep(STEPS.DELETE_SUBSCRIPTION.id));
  } catch (error) {
    if (
      error instanceof DomainModelServiceError &&
      error.code === DomainModelServiceErrorCode.RESOURCE_NOT_FOUND
    ) {
      return reply.code(STATUS_CODES.NOT_FOUND).send(ERROR_RESPONSES.SUBSCRIPTION_NOT_FOUND);
    }
    throw error;
  }
  return reply.code(STATUS_CODES.NO_CONTENT).send();
}; 