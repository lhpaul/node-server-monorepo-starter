import { FORBIDDEN_ERROR, RESOURCE_NOT_FOUND_ERROR, STATUS_CODES } from '@repo/fastify';
import { ExamplesService } from '@repo/shared/domain';
import { DomainModelServiceError, DomainModelServiceErrorCode } from '@repo/shared/utils';
import { FastifyReply, FastifyRequest } from 'fastify';

import { AuthUser } from '../../../../definitions/auth.interfaces';
import { hasExamplesDeletePermission } from '../../../../utils/permissions';
import { EXAMPLE_NOT_FOUND_ERROR } from '../../examples.endpoints.constants';
import { STEPS } from './examples.delete.handler.constants';
import { DeleteExampleParams } from './examples.delete.handler.interfaces';

export const deleteExampleHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const logger = request.log.child({ handler: deleteExampleHandler.name });
  const logGroup = deleteExampleHandler.name;
  const service = ExamplesService.getInstance();
  const { id } = request.params as DeleteExampleParams;
  const authUser = request.user as AuthUser;
  if (!hasExamplesDeletePermission(authUser)) {
    return reply.code(STATUS_CODES.FORBIDDEN).send({
      code: FORBIDDEN_ERROR.responseCode,
      message: FORBIDDEN_ERROR.responseMessage,
    });
  }
  try {
    logger.startStep(STEPS.DELETE_EXAMPLE, logGroup);
    await service
      .deleteResource(id, logger)
    logger.endStep(STEPS.DELETE_EXAMPLE);
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
