import { STATUS_CODES } from '@repo/fastify';
import { AuthService } from '@repo/shared/domain';
import { FastifyReply, FastifyRequest } from 'fastify';

import { getUserPermissions } from '../../../../utils/auth';
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
  logger.startStep(STEPS.VALIDATE_CREDENTIALS, logGroup);
  const user = await AuthService.getInstance().validateCredentials({ email, password }, logger);
  logger.endStep(STEPS.VALIDATE_CREDENTIALS);
  if (!user) {
    return reply.status(STATUS_CODES.UNAUTHORIZED).send(ERROR_RESPONSES.INVALID_CREDENTIALS);
  }
  logger.startStep(STEPS.GET_PERMISSIONS, logGroup);
  const permissions = await getUserPermissions(user.id, logger);
  logger.endStep(STEPS.GET_PERMISSIONS);
  logger.startStep(STEPS.GENERATE_USER_TOKEN, logGroup);
  const token = await request.server.jwt.sign({
    userId: user.id,
    ...permissions,
  });
  logger.endStep(STEPS.GENERATE_USER_TOKEN);
  return reply.status(STATUS_CODES.OK).send({ token });
};
