import { FORBIDDEN_ERROR, RESOURCE_NOT_FOUND_ERROR, STATUS_CODES } from '@repo/fastify';
import { ExamplesService } from '@repo/shared/domain';
import { DomainModelServiceError, DomainModelServiceErrorCode } from '@repo/shared/utils';
import { FastifyBaseLogger, FastifyReply, FastifyRequest } from 'fastify';

import { AuthUser } from '../../../../../definitions/auth.interfaces';
import { hasExamplesUpdatePermission } from '../../../../../utils/permissions';
import { EXAMPLE_NOT_FOUND_ERROR } from '../../../examples.endpoints.constants';
import { STEPS } from '../examples.update.handler.constants';
import { updateExampleHandler } from '../examples.update.handler';

jest.mock('@repo/shared/domain', () => ({
  ...jest.requireActual('@repo/shared/domain'),
  ExamplesService: {
    getInstance: jest.fn(),
  },
}));

jest.mock('../../../../../utils/permissions', () => ({
  hasExamplesUpdatePermission: jest.fn(),
}));

describe(updateExampleHandler.name, () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockLogger: {
    startStep: jest.Mock;
    endStep: jest.Mock;
  } & Partial<FastifyBaseLogger>;
  let mockService: Partial<ExamplesService>;
  const logGroup = updateExampleHandler.name;
  const mockParams = { id: 'example123' };
  const mockBody = { description: 'Some description', name: 'name' };
  const mockUser = { app_user_id: 'user123' } as AuthUser;

  beforeEach(() => {
    mockLogger = {
      child: jest.fn().mockReturnThis(),
      startStep: jest.fn(),
      endStep: jest.fn(),
    };

    mockRequest = {
      log: mockLogger as FastifyBaseLogger,
      params: mockParams,
      body: mockBody,
      user: mockUser,
    };

    mockReply = {
      code: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    mockService = {
      updateResource: jest.fn(),
    };

    (ExamplesService.getInstance as jest.Mock).mockReturnValue(
      mockService,
    );

    (hasExamplesUpdatePermission as jest.Mock).mockReturnValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should return forbidden when user lacks update permission', async () => {
    (hasExamplesUpdatePermission as jest.Mock).mockReturnValue(false);

    await updateExampleHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.FORBIDDEN);
    expect(mockReply.send).toHaveBeenCalledWith({
      code: FORBIDDEN_ERROR.responseCode,
      message: FORBIDDEN_ERROR.responseMessage,
    });
    expect(mockService.updateResource).not.toHaveBeenCalled();
  });

  it('should successfully update a example', async () => {
    jest.spyOn(mockService, 'updateResource').mockResolvedValue(undefined);

    await updateExampleHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.UPDATE_EXAMPLE, logGroup);
    expect(mockService.updateResource).toHaveBeenCalledWith(
      mockParams.id,
      mockBody,
      mockLogger,
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.UPDATE_EXAMPLE);
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.NO_CONTENT);
    expect(mockReply.send).toHaveBeenCalled();
  });

  it('should handle example not found', async () => {
    jest.spyOn(mockService, 'updateResource').mockRejectedValue(
      new DomainModelServiceError({
        code: DomainModelServiceErrorCode.RESOURCE_NOT_FOUND,
        message: 'Example not found',
      }),
    );

    await updateExampleHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.UPDATE_EXAMPLE, logGroup);
    expect(mockService.updateResource).toHaveBeenCalledWith(
      mockParams.id,
      mockBody,
      mockLogger,
    );
    expect(mockLogger.endStep).not.toHaveBeenCalledWith(STEPS.UPDATE_EXAMPLE);
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.NOT_FOUND);
    expect(mockReply.send).toHaveBeenCalledWith({
      code: RESOURCE_NOT_FOUND_ERROR.responseCode,
      message: EXAMPLE_NOT_FOUND_ERROR(mockParams.id),
    });
  });

});
