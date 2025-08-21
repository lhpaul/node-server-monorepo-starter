import { STATUS_CODES, transformQueryParams } from '@repo/fastify';
import { SubscriptionsService } from '@repo/shared/domain';
import { FastifyReply, FastifyRequest } from 'fastify';

import { STEPS } from './subscriptions.list.handler.constants';
import { GetSubscriptionsQueryParams } from './subscriptions.list.handler.interfaces';

export const listSubscriptionsHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const logger = request.log.child({ handler: listSubscriptionsHandler.name });
  const logGroup = listSubscriptionsHandler.name;
  const service = SubscriptionsService.getInstance();
  const query = request.query as GetSubscriptionsQueryParams;
  logger.startStep(STEPS.GET_SUBSCRIPTIONS, logGroup);
  const subscriptions = await service
    .getResourcesList(transformQueryParams(query), logger)
    .finally(() => logger.endStep(STEPS.GET_SUBSCRIPTIONS));
  return reply.code(STATUS_CODES.OK).send(subscriptions);
}; 