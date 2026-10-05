import { FORBIDDEN_ERROR, RESOURCE_NOT_FOUND_ERROR, STATUS_CODES } from '@repo/fastify';
import { ExamplesService } from '@repo/shared/domain';
import { FastifyBaseLogger, FastifyReply, FastifyRequest } from 'fastify';

import { AuthUser } from '../../../../../definitions/auth.interfaces';
import { hasExamplesDeletePermission } from '../../../../../utils/permissions';
import { STEPS } from '../examples.delete.handler.constants';
import { deleteExampleHandler } from '../examples.delete.handler';
import { DomainModelServiceError, DomainModelServiceErrorCode } from '@repo/shared/utils';
import { EXAMPLE_NOT_FOUND_ERROR } from '../../../examples.endpoints.constants';

jest.mock('@repo/shared/domain', () => ({
  ...jest.requireActual('@repo/shared/domain'),
  ExamplesService: {
    getInstance: jest.fn(),
  },
}));

jest.mock('../../../../../utils/permissions', () => ({
  hasExamplesDeletePermission: jest.fn(),
}));

describe(deleteExampleHandler.name, () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockLogger: {
    startStep: jest.Mock;
    endStep: jest.Mock;
  } & Partial<FastifyBaseLogger>;
  let mockService: Partial<ExamplesService>;

  const mockParams = { id: 'example123' };
  const mockUser = { app_user_id: 'user123' } as AuthUser;
  const logGroup = deleteExampleHandler.name;
  beforeEach(() => {
    mockLogger = {
      child: jest.fn().mockReturnThis(),
      startStep: jest.fn(),
      endStep: jest.fn(),
    };

    mockRequest = {
      log: mockLogger as FastifyBaseLogger,
      params: mockParams,
      user: mockUser as unknown as AuthUser,
    };

    mockReply = {
      code: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    mockService = {
      deleteResource: jest.fn(),
      getResource: jest.fn(),
    };

    (ExamplesService.getInstance as jest.Mock).mockReturnValue(
      mockService,
    );

    (hasExamplesDeletePermission as jest.Mock).mockReturnValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return forbidden when user lacks delete permission', async () => {
    (hasExamplesDeletePermission as jest.Mock).mockReturnValue(false);

    await deleteExampleHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockReply.code).toHaveBeenCalledWith(403);
    expect(mockReply.send).toHaveBeenCalledWith({
      code: FORBIDDEN_ERROR.responseCode,
      message: FORBIDDEN_ERROR.responseMessage,
    });
    expect(mockService.deleteResource).not.toHaveBeenCalled();
  });

  it('should handle example not found', async () => {
    jest.spyOn(mockService, 'deleteResource').mockRejectedValue(
      new DomainModelServiceError({
        code: DomainModelServiceErrorCode.RESOURCE_NOT_FOUND,
        message: 'Example not found',
      }),
    );

    await deleteExampleHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.DELETE_EXAMPLE, logGroup);
    expect(mockService.deleteResource).toHaveBeenCalledWith(mockParams.id, mockLogger);
    expect(mockLogger.endStep).not.toHaveBeenCalledWith(STEPS.DELETE_EXAMPLE);
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.NOT_FOUND);
    expect(mockReply.send).toHaveBeenCalledWith({
      code: RESOURCE_NOT_FOUND_ERROR.responseCode,
      message: EXAMPLE_NOT_FOUND_ERROR(mockParams.id),
    });
  });

  it('should successfully delete a example', async () => {
    (hasExamplesDeletePermission as jest.Mock).mockReturnValue(true);
    jest.spyOn(mockService, 'deleteResource').mockResolvedValue(undefined);
    await deleteExampleHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.DELETE_EXAMPLE, logGroup);
    expect(mockService.deleteResource).toHaveBeenCalledWith(
      mockParams.id,
      mockLogger,
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.DELETE_EXAMPLE);
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.NO_CONTENT);
    expect(mockReply.send).toHaveBeenCalled();
  });
});
