import { FORBIDDEN_ERROR, STATUS_CODES, RESOURCE_NOT_FOUND_ERROR } from '@repo/fastify';
import { SubscriptionsService } from '@repo/shared/domain';
import { FastifyReply, FastifyRequest } from 'fastify';

import { AuthUser } from '../../../../../../definitions/auth.interfaces';
import { hasCompanySubscriptionsReadPermission } from '../../../../../../utils/auth/auth.utils';
import { STEPS } from './subscriptions.get.handler.constants';
import { GetSubscriptionParams } from './subscriptions.get.handler.interfaces';

export const getSubscriptionHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const logger = request.log.child({ handler: getSubscriptionHandler.name });
  const logGroup = getSubscriptionHandler.name;
  const { companyId, id } = request.params as GetSubscriptionParams;
  const user = request.user as AuthUser;

  if (!hasCompanySubscriptionsReadPermission(companyId, user)) {
    return reply.code(STATUS_CODES.FORBIDDEN).send({
      code: FORBIDDEN_ERROR.responseCode,
      message: FORBIDDEN_ERROR.responseMessage,
    });
  }

  logger.startStep(STEPS.GET_SUBSCRIPTION.id, logGroup);
  const service = SubscriptionsService.getInstance();
  const subscription = await service
    .getResource(id, logger)
    .finally(() => logger.endStep(STEPS.GET_SUBSCRIPTION.id));

  if (!subscription || subscription.companyId !== companyId) {
    return reply.code(STATUS_CODES.NOT_FOUND).send({
      code: RESOURCE_NOT_FOUND_ERROR.responseCode,
      message: RESOURCE_NOT_FOUND_ERROR.responseMessage,
    });
  }

  return reply.code(STATUS_CODES.OK).send(subscription);
}; 