import { FORBIDDEN_ERROR, STATUS_CODES } from '@repo/fastify';
import { ExamplesService } from '@repo/shared/domain';
import { FastifyReply, FastifyRequest } from 'fastify';

import { AuthUser } from '../../../../definitions/auth.interfaces';
import { hasExamplesReadPermission } from '../../../../utils/permissions/permissions.utils';
import { GetExampleParams } from './examples.get.handler.interfaces';
import { STEPS } from './examples.get.handler.constants';
export async function getExampleHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const logger = request.log.child({ handler: getExampleHandler.name });
  const logGroup = getExampleHandler.name;
  const { id } = request.params as GetExampleParams;

  const authUser = request.user as AuthUser;
  if (!hasExamplesReadPermission(authUser)) {
    return reply.code(STATUS_CODES.FORBIDDEN).send({
      code: FORBIDDEN_ERROR.responseCode,
      message: FORBIDDEN_ERROR.responseMessage,
    });
  }

  logger.startStep(STEPS.GET_EXAMPLE, logGroup);
  const example = await ExamplesService.getInstance().getResource(id, logger);
  logger.endStep(STEPS.GET_EXAMPLE);

  return reply.code(STATUS_CODES.OK).send(example);
}
