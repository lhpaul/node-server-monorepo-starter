import { FORBIDDEN_ERROR, STATUS_CODES, transformQueryParams } from '@repo/fastify';
import { ExamplesService } from '@repo/shared/domain';
import { FastifyReply, FastifyRequest } from 'fastify';

import { AuthUser } from '../../../../definitions/auth.interfaces';
import { hasExamplesReadPermission } from '../../../../utils/permissions';
import { STEPS } from './examples.list.handler.constants';
import { GetExamplesQueryParams } from './examples.list.handler.interfaces';

export const listExamplesHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const logger = request.log.child({ handler: listExamplesHandler.name });
  const logGroup = listExamplesHandler.name;
  const authUser = request.user as AuthUser;
  if (!hasExamplesReadPermission(authUser)) {
    return reply.code(STATUS_CODES.FORBIDDEN).send({
      code: FORBIDDEN_ERROR.responseCode,
      message: FORBIDDEN_ERROR.responseMessage,
    });
  }
  const query = request.query as GetExamplesQueryParams;
  logger.startStep(STEPS.GET_EXAMPLES, logGroup);
  const examples = await ExamplesService.getInstance().getResourcesList(transformQueryParams(query), logger);
  logger.endStep(STEPS.GET_EXAMPLES);
  return reply.code(STATUS_CODES.OK).send(examples);
};
