import { STATUS_CODES, FORBIDDEN_ERROR, RESOURCE_NOT_FOUND_ERROR } from '@repo/fastify';
import { ExamplesService } from '@repo/shared/domain';
import { DomainModelServiceError, DomainModelServiceErrorCode } from '@repo/shared/utils';
import { FastifyReply, FastifyRequest } from 'fastify';

import { AuthUser } from '../../../../definitions/auth.interfaces';
import { hasExamplesUpdatePermission } from '../../../../utils/permissions';
import { EXAMPLE_NOT_FOUND_ERROR } from '../../examples.endpoints.constants';
import { STEPS } from './examples.update.handler.constants';
import { UpdateExampleBody, UpdateExampleParams } from './examples.update.handler.interfaces';

export const updateExampleHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const logger = request.log.child({ handler: updateExampleHandler.name });
  const logGroup = updateExampleHandler.name;
  const service = ExamplesService.getInstance();
  const { id } = request.params as UpdateExampleParams;
  const body = request.body as UpdateExampleBody;
  const user = request.user as AuthUser;
  if (!hasExamplesUpdatePermission(user)) {
    return reply.code(STATUS_CODES.FORBIDDEN).send({
      code: FORBIDDEN_ERROR.responseCode,
      message: FORBIDDEN_ERROR.responseMessage,
    });
  }
  try {
    logger.startStep(STEPS.UPDATE_EXAMPLE, logGroup);
    await service.updateResource(id, body, logger);
    logger.endStep(STEPS.UPDATE_EXAMPLE);
    return reply.code(STATUS_CODES.NO_CONTENT).send();
  } catch (error) {
    if (error instanceof DomainModelServiceError) {
      if (error.code === DomainModelServiceErrorCode.RESOURCE_NOT_FOUND) {
        return reply.code(STATUS_CODES.NOT_FOUND).send({
          code: RESOURCE_NOT_FOUND_ERROR.responseCode,
          message: EXAMPLE_NOT_FOUND_ERROR(id),
        });
      }
    }
    throw error;
  }
};
