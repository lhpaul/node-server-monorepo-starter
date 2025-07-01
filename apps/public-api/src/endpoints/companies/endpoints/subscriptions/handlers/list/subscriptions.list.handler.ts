import { FORBIDDEN_ERROR, STATUS_CODES, transformQueryParams } from '@repo/fastify';
import { SubscriptionsService } from '@repo/shared/services';
import { mapDateQueryParams } from '@repo/fastify';
import { FastifyReply, FastifyRequest } from 'fastify';

import { AuthUser } from '../../../../../../definitions/auth.interfaces';
import { hasCompanySubscriptionsReadPermission } from '../../../../../../utils/auth/auth.utils';
import { STEPS } from './subscriptions.list.handler.constants';
import { GetSubscriptionsQueryParams, ListSubscriptionsParams } from './subscriptions.list.handler.interfaces';

export const listSubscriptionsHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const logger = request.log.child({ handler: listSubscriptionsHandler.name });
  const logGroup = listSubscriptionsHandler.name;
  const service = SubscriptionsService.getInstance();
  const { companyId } = request.params as ListSubscriptionsParams;
  const user = request.user as AuthUser;

  if (!hasCompanySubscriptionsReadPermission(companyId, user)) {
    return reply.code(STATUS_CODES.FORBIDDEN).send({
      code: FORBIDDEN_ERROR.responseCode,
      message: FORBIDDEN_ERROR.responseMessage,
    });
  }

  logger.startStep(STEPS.LIST_SUBSCRIPTIONS.id, logGroup);
  const query = request.query as GetSubscriptionsQueryParams;
  const subscriptions = await service
    .getResourcesList(transformQueryParams({
      companyId,
      ...mapDateQueryParams(query as Record<string, string>, ['startsAt', 'endsAt']),
    }), logger)
    .finally(() => logger.endStep(STEPS.LIST_SUBSCRIPTIONS.id));
  return reply.code(STATUS_CODES.OK).send(subscriptions);
}; 