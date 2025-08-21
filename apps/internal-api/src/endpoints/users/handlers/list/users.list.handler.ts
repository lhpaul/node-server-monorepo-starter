import { STATUS_CODES } from '@repo/fastify';
import { UsersService } from '@repo/shared/domain';
import { FastifyReply, FastifyRequest } from 'fastify';

import { STEPS } from './users.list.handler.constants';

export const listUsersHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const logger = request.log.child({ handler: listUsersHandler.name });
  const logGroup = listUsersHandler.name;
  const service = UsersService.getInstance();
  const query = request.query as Record<string, any>;
  
  logger.startStep(STEPS.LIST_USERS, logGroup);
  const users = await service
    .getResourcesList(query, logger)
  .finally(() => logger.endStep(STEPS.LIST_USERS));
  
  return reply.code(STATUS_CODES.OK).send(users);
};
