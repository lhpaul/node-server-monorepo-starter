import { STATUS_CODES } from '@repo/fastify';
import { UsersRepository } from '@repo/shared/repositories';
import { AuthService, DecodeEmailTokenError } from '@repo/shared/services';
import { FastifyReply, FastifyRequest } from 'fastify';

import { ERROR_RESPONSES, STEPS } from './login.constants';
import { LoginBody } from './login.interfaces';


export const loginHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const logger = request.log.child({ handler: loginHandler.name });
  const body = request.body as LoginBody;
  const { token: emailToken } = body;
  const authService = AuthService.getInstance();

  try {
    logger.startStep(STEPS.DECODE_EMAIL_TOKEN.id, STEPS.DECODE_EMAIL_TOKEN.obfuscatedId);
    const { email } = await authService.decodeEmailToken(emailToken);
    logger.endStep(STEPS.DECODE_EMAIL_TOKEN.id);
    logger.startStep(STEPS.FIND_USER.id, STEPS.FIND_USER.obfuscatedId);
    const [user, ..._rest] = await UsersRepository.getInstance().getDocumentsList(
      {
        email: [{ value: email, operator: '==' }],
      },
      logger,
    );
    logger.endStep(STEPS.FIND_USER.id);

    if (!user) {
      return reply.status(STATUS_CODES.UNAUTHORIZED).send({
        code: ERROR_RESPONSES.NO_USER_FOUND.code,
        message: ERROR_RESPONSES.NO_USER_FOUND.message(email),
      });
    }

    logger.startStep(STEPS.GENERATE_USER_TOKEN.id, STEPS.GENERATE_USER_TOKEN.obfuscatedId);
    const token = await authService.generateUserToken(user.id, { logger });
    logger.endStep(STEPS.GENERATE_USER_TOKEN.id);

    return reply.status(STATUS_CODES.OK).send({ token });
  } catch (err: any) {
    if (err instanceof DecodeEmailTokenError) {
      return reply.status(STATUS_CODES.BAD_REQUEST).send({
        code: err.code,
        message: err.message,
      });
    }
    throw err;
  }
};
