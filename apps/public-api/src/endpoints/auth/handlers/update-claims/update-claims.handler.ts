import { STATUS_CODES } from '@repo/fastify';
import { UsersRepository } from '@repo/shared/repositories';
import { AuthService } from '@repo/shared/services';
import { FastifyReply, FastifyRequest } from 'fastify';

import { ERROR_RESPONSES, STEPS } from './update-claims.handler.constants';


export const updateClaimsHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  const logger = request.log.child({ handler: updateClaimsHandler.name });
  let { app_user_id, email } = request.user;

  if (!app_user_id) {
    if (!email) {
      return reply.status(STATUS_CODES.FORBIDDEN).send({
        code: ERROR_RESPONSES.INVALID_TOKEN.code,
        message: ERROR_RESPONSES.INVALID_TOKEN.message,
      });
    }
    logger.startStep(STEPS.FIND_USER.id, STEPS.FIND_USER.obfuscatedId);
    const [user, ..._rest] = await UsersRepository.getInstance().getDocumentsList(
      {
        email: [{ value: email, operator: '==' }],
      },
      logger,
    );
    logger.endStep(STEPS.FIND_USER.id);
    if (!user) {
      return reply.status(STATUS_CODES.FORBIDDEN).send({
        code: ERROR_RESPONSES.NO_USER_FOUND.code,
        message: ERROR_RESPONSES.NO_USER_FOUND.message(email),
      });
    }
    app_user_id = user.id;
  }
  logger.startStep(STEPS.UPDATE_CLAIMS.id, STEPS.UPDATE_CLAIMS.obfuscatedId);
  await AuthService.getInstance().updatePermissionsToUser({
    userId: app_user_id,
    uid: request.user.uid,
  }, { logger });
  logger.endStep(STEPS.UPDATE_CLAIMS.id);
  return reply.status(STATUS_CODES.NO_CONTENT).send();
};