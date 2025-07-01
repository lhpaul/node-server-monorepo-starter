import { STATUS_CODES } from '@repo/fastify';
import { AuthService } from '@repo/shared/services';
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
  const { email, password } = body;
  logger.startStep(STEPS.VALIDATE_CREDENTIALS.id, logGroup);
  const user = await AuthService.getInstance().validateCredentials({ email, password }, logger)
    .finally(() => logger.endStep(STEPS.VALIDATE_CREDENTIALS.id));
  if (!user) {
    return reply.status(STATUS_CODES.UNAUTHORIZED).send(ERROR_RESPONSES.INVALID_CREDENTIALS);
  }
  const permissions = await AuthService.getInstance().getUserPermissions(user.id, logger);
  logger.startStep(STEPS.GET_PERMISSIONS.id, logGroup);
  const token = await request.server.jwt.sign({
    userId: user.id,
    ...permissions,
  });
  logger.endStep(STEPS.GET_PERMISSIONS.id);
  return reply.status(STATUS_CODES.OK).send({ token });
};
