import { STATUS_CODES, transformQueryParams } from '@repo/fastify';
import { SubscriptionsRepository } from '@repo/shared/repositories';
import { FastifyReply, FastifyRequest } from 'fastify';

import { STEPS } from './subscriptions.list.handler.constants';
import { GetSubscriptionsQueryParams } from './subscriptions.list.handler.interfaces';

export const listSubscriptionsHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const logger = request.log.child({ handler: listSubscriptionsHandler.name });
  const repository = SubscriptionsRepository.getInstance();
  const query = request.query as GetSubscriptionsQueryParams;
  logger.startStep(STEPS.GET_SUBSCRIPTIONS.id);
  const subscriptions = await repository
    .getDocumentsList(transformQueryParams(query), logger)
    .finally(() => logger.endStep(STEPS.GET_SUBSCRIPTIONS.id));
  return reply.code(STATUS_CODES.OK).send(subscriptions);
}; 