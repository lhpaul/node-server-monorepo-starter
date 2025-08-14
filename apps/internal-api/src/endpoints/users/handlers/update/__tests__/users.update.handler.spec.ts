import { STATUS_CODES } from '@repo/fastify';
import { UsersService } from '@repo/shared/domain';
import { DomainModelServiceError, DomainModelServiceErrorCode } from '@repo/shared/utils';
import { FastifyReply, FastifyRequest } from 'fastify';

import { updateUserHandler } from '../users.update.handler';
import { STEPS } from '../users.update.handler.constants';

jest.mock('@repo/shared/domain');

describe(updateUserHandler.name, () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockLogger: any;
  let mockService: Partial<UsersService>;
  const logGroup = updateUserHandler.name;

  beforeEach(() => {
    mockLogger = {
      child: jest.fn().mockReturnThis(),
      startStep: jest.fn(),
      endStep: jest.fn(),
    };

    mockRequest = {
      log: mockLogger,
      body: {
        email: 'updated@example.com',
      },
      params: {
        id: 'user-123',
      },
    };

    mockReply = {
      code: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    mockService = {
      updateResource: jest.fn(),
    };

    (UsersService.getInstance as jest.Mock).mockReturnValue(mockService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should update a user successfully', async () => {
    jest.spyOn(mockService, 'updateResource').mockResolvedValue(undefined);

    await updateUserHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.child).toHaveBeenCalledWith({
      handler: updateUserHandler.name,
    });
    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.UPDATE_USER, logGroup);
    expect(mockService.updateResource).toHaveBeenCalledWith(
      'user-123',
      { email: 'updated@example.com' },
      mockLogger,
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.UPDATE_USER);
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.NO_CONTENT);
    expect(mockReply.send).toHaveBeenCalledWith();
  });

  it('should return 404 when user is not found', async () => {
    const notFoundError = new DomainModelServiceError({
      code: DomainModelServiceErrorCode.RESOURCE_NOT_FOUND,
      message: 'User not found',
    });
    jest.spyOn(mockService, 'updateResource').mockRejectedValue(notFoundError);

    await updateUserHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.UPDATE_USER, logGroup);
    expect(mockService.updateResource).toHaveBeenCalledWith(
      'user-123',
      { email: 'updated@example.com' },
      mockLogger,
    );
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.NOT_FOUND);
    expect(mockReply.send).toHaveBeenCalledWith({
      code: DomainModelServiceErrorCode.RESOURCE_NOT_FOUND,
      message: 'User not found',
    });
  });

  it('should handle other domain service errors', async () => {
    const otherError = new DomainModelServiceError({
      code: DomainModelServiceErrorCode.RELATED_RESOURCE_NOT_FOUND,
      message: 'Related resource not found',
    });
    jest.spyOn(mockService, 'updateResource').mockRejectedValue(otherError);

    await expect(
      updateUserHandler(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      ),
    ).rejects.toThrow(otherError);

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.UPDATE_USER, logGroup);
    expect(mockService.updateResource).toHaveBeenCalledWith(
      'user-123',
      { email: 'updated@example.com' },
      mockLogger,
    );
    expect(mockReply.code).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });

  it('should handle generic errors', async () => {
    const genericError = new Error('Generic error');
    jest.spyOn(mockService, 'updateResource').mockRejectedValue(genericError);

    await expect(
      updateUserHandler(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      ),
    ).rejects.toThrow(genericError);

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.UPDATE_USER, logGroup);
    expect(mockService.updateResource).toHaveBeenCalledWith(
      'user-123',
      { email: 'updated@example.com' },
      mockLogger,
    );
    expect(mockReply.code).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });
});
