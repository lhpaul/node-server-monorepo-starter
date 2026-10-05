import { FORBIDDEN_ERROR, STATUS_CODES } from '@repo/fastify';
import { ExamplesService } from '@repo/shared/domain';
import { FastifyReply, FastifyRequest } from 'fastify';

import { hasExamplesCreatePermission } from '../../../../utils/permissions/permissions.utils';
import { STEPS } from './examples.create.handler.constants';
import { CreateExampleBody } from './examples.create.handler.interfaces';


export const createExampleHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const logger = request.log.child({ handler: createExampleHandler.name });
  const logGroup = createExampleHandler.name;
  const authUser = request.user;
  if (!hasExamplesCreatePermission(authUser)) {
    return reply.code(STATUS_CODES.FORBIDDEN).send({
      code: FORBIDDEN_ERROR.responseCode,
      message: FORBIDDEN_ERROR.responseMessage,
    });
  }
  const service = ExamplesService.getInstance();
  const body = request.body as CreateExampleBody;
  logger.startStep(STEPS.CREATE_EXAMPLE, logGroup);
  const id = await service
    .createResource({
      description: null,
      ...body,
    }, logger);
  logger.endStep(STEPS.CREATE_EXAMPLE);
  return reply.code(STATUS_CODES.CREATED).send({ id });
};
