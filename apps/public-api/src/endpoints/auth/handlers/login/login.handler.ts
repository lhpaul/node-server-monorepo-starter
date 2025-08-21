import { STATUS_CODES } from '@repo/fastify';
import { UsersService } from '@repo/shared/domain';
import { FastifyReply, FastifyRequest } from 'fastify';

import { decodeEmailToken, DecodeEmailTokenError, generateUserToken } from '../../../../utils/auth';
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

  try {
    logger.startStep(STEPS.DECODE_EMAIL_TOKEN, logGroup);
    const { email } = await decodeEmailToken(emailToken)
      .finally(() => logger.endStep(STEPS.DECODE_EMAIL_TOKEN));
    logger.startStep(STEPS.FIND_USER, logGroup);
    const [user, ..._rest] = await UsersService.getInstance().getResourcesList(
      {
        email: [{ value: email, operator: '==' }],
      },
      logger,
    ).finally(() => logger.endStep(STEPS.FIND_USER));

    if (!user) {
      return reply.status(STATUS_CODES.UNAUTHORIZED).send({
        code: ERROR_RESPONSES.NO_USER_FOUND.code,
        message: ERROR_RESPONSES.NO_USER_FOUND.message(email),
      });
    }

    logger.startStep(STEPS.GENERATE_USER_TOKEN, logGroup);
    const token = await generateUserToken(user.id, logger)
      .finally(() => logger.endStep(STEPS.GENERATE_USER_TOKEN));

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
