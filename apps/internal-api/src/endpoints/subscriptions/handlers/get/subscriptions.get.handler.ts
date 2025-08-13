import { STATUS_CODES } from '@repo/fastify';
import { SubscriptionsService } from '@repo/shared/domain';
import { FastifyReply, FastifyRequest } from 'fastify';

import { ERROR_RESPONSES } from '../../subscriptions.endpoints.constants';
import { STEPS } from './subscriptions.get.handler.constants';
import { GetSubscriptionParams } from './subscriptions.get.handler.interfaces';

export const getSubscriptionHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const logger = request.log.child({ handler: getSubscriptionHandler.name });
  const logGroup = getSubscriptionHandler.name;
  const service = SubscriptionsService.getInstance();
  const { id } = request.params as GetSubscriptionParams;
  logger.startStep(STEPS.GET_SUBSCRIPTION.id, logGroup);
  const subscription = await service
    .getResource(id, logger)
    .finally(() => logger.endStep(STEPS.GET_SUBSCRIPTION.id));
  if (!subscription) {
    return reply.code(STATUS_CODES.NOT_FOUND).send(ERROR_RESPONSES.SUBSCRIPTION_NOT_FOUND);
  }
  return reply.code(STATUS_CODES.OK).send(subscription);
}; 