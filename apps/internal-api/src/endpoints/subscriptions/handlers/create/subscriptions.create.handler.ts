import { STATUS_CODES } from '@repo/fastify';
import { SubscriptionsService } from '@repo/shared/domain';
import { DomainModelServiceError, DomainModelServiceErrorCode } from '@repo/shared/utils';
import { FastifyReply, FastifyRequest } from 'fastify';

import { ERROR_RESPONSES } from '../../subscriptions.endpoints.constants';
import { STEPS } from './subscriptions.create.handler.constants';
import { CreateSubscriptionBody } from './subscriptions.create.handler.interfaces';

export const createSubscriptionHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const logger = request.log.child({ handler: createSubscriptionHandler.name });
  const logGroup = createSubscriptionHandler.name;
  const service = SubscriptionsService.getInstance();
  const body = request.body as CreateSubscriptionBody;
  try {
    logger.startStep(STEPS.CREATE_SUBSCRIPTION, logGroup);
    const id = await service
      .createResource({
        ...body,
        startsAt: new Date(body.startsAt),
        endsAt: new Date(body.endsAt),
      }, logger)
      .finally(() => logger.endStep(STEPS.CREATE_SUBSCRIPTION));
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