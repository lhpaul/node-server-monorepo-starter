import { STATUS_CODES } from '@repo/fastify';
import { AuthService, DecodeEmailTokenError, UsersService } from '@repo/shared/services';
import { FastifyReply, FastifyRequest } from 'fastify';

import { ERROR_RESPONSES, STEPS } from './login.handler.constants';
import { LoginBody } from './login.handler.interfaces';

export const loginHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const logger = request.log.child({ handler: loginHandler.name });
  const logGroup = `${loginHandler.name}`;
  const body = request.body as LoginBody;
  const { token: emailToken } = body;
  const authService = AuthService.getInstance();

  try {
    logger.startStep(STEPS.DECODE_EMAIL_TOKEN.id, logGroup);
    const { email } = await authService.decodeEmailToken(emailToken)
      .finally(() => logger.endStep(STEPS.DECODE_EMAIL_TOKEN.id));
    logger.startStep(STEPS.FIND_USER.id, logGroup);
    const [user, ..._rest] = await UsersService.getInstance().getResourcesList(
      {
        email: [{ value: email, operator: '==' }],
      },
      logger,
    ).finally(() => logger.endStep(STEPS.FIND_USER.id));

    if (!user) {
      return reply.status(STATUS_CODES.UNAUTHORIZED).send({
        code: ERROR_RESPONSES.NO_USER_FOUND.code,
        message: ERROR_RESPONSES.NO_USER_FOUND.message(email),
      });
    }

    logger.startStep(STEPS.GENERATE_USER_TOKEN.id, logGroup);
    const token = await authService.generateUserToken(user.id, logger)
      .finally(() => logger.endStep(STEPS.GENERATE_USER_TOKEN.id));

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
