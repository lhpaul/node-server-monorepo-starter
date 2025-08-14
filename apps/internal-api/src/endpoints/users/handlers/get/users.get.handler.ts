import { STATUS_CODES } from '@repo/fastify';
import { UsersService } from '@repo/shared/domain';
import { FastifyReply, FastifyRequest } from 'fastify';

import { STEPS } from './users.get.handler.constants';

export const getUserHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const logger = request.log.child({ handler: getUserHandler.name });
  const logGroup = getUserHandler.name;
  const service = UsersService.getInstance();
  const params = request.params as { id: string };
  
  logger.startStep(STEPS.GET_USER, logGroup);
  const user = await service
    .getResource(params.id, logger);
  logger.endStep(STEPS.GET_USER);
    
  if (!user) {
    return reply.code(STATUS_CODES.NOT_FOUND).send({
      code: 'user-not-found',
      message: 'User not found',
    });
  }
  
  return reply.code(STATUS_CODES.OK).send(user);
};
