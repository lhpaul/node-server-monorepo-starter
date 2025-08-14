import { STATUS_CODES } from '@repo/fastify';
import { UsersService } from '@repo/shared/domain';
import { FastifyReply, FastifyRequest } from 'fastify';

import { STEPS } from './users.update.handler.constants';
import { UpdateUserBody } from './users.update.handler.interfaces';
import { DomainModelServiceError, DomainModelServiceErrorCode } from '@repo/shared/utils';

export const updateUserHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const logger = request.log.child({ handler: updateUserHandler.name });
  const logGroup = updateUserHandler.name;
  const service = UsersService.getInstance();
  const body = request.body as UpdateUserBody;
  const params = request.params as { id: string };
  
  try {
    logger.startStep(STEPS.UPDATE_USER, logGroup);
    await service
      .updateResource(params.id, body, logger)
    .finally(() => logger.endStep(STEPS.UPDATE_USER));
    return reply.code(STATUS_CODES.NO_CONTENT).send();
  } catch (error) {
    if (error instanceof DomainModelServiceError) {
      if (error.code === DomainModelServiceErrorCode.RESOURCE_NOT_FOUND) {
        return reply.code(STATUS_CODES.NOT_FOUND).send({
          code: error.code,
          message: error.message,
        });
      }
    }
    throw error;
  }
};
