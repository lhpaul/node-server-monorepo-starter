import { AuthService } from '@repo/shared/services';
import { FastifyReply, FastifyRequest } from 'fastify';

import { ERROR_RESPONSES, STEPS } from './login.constants';
import { LoginBody } from './login.interfaces';


export const loginHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const logger = request.log.child({ handler: loginHandler.name });
  const body = request.body as LoginBody;
  const { email, password } = body;
  logger.startStep(STEPS.VALIDATE_CREDENTIALS.id, STEPS.VALIDATE_CREDENTIALS.obfuscatedId);
  const user = await AuthService.getInstance().validateCredentials({ email, password });
  logger.endStep(STEPS.VALIDATE_CREDENTIALS.id);
  if (!user) {
    return reply.status(401).send(ERROR_RESPONSES.INVALID_CREDENTIALS);
  }
  const permissions = await AuthService.getInstance().getUserPermissions(user.id);
  logger.startStep(STEPS.GET_PERMISSIONS.id, STEPS.GET_PERMISSIONS.obfuscatedId);
  const token = await request.server.jwt.sign({
    userId: user.id,
    ...permissions,
  });
  logger.endStep(STEPS.GET_PERMISSIONS.id);
  return reply.status(200).send({ token });
};
