import { STATUS_CODES } from '@repo/fastify';
import { UsersService } from '@repo/shared/domain';
import { FastifyReply, FastifyRequest } from 'fastify';

import { getUserHandler } from '../users.get.handler';
import { STEPS } from '../users.get.handler.constants';

jest.mock('@repo/shared/domain');

describe(getUserHandler.name, () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockLogger: any;
  let mockService: Partial<UsersService>;
  const logGroup = getUserHandler.name;

  beforeEach(() => {
    mockLogger = {
      child: jest.fn().mockReturnThis(),
      startStep: jest.fn(),
      endStep: jest.fn(),
    };

    mockRequest = {
      log: mockLogger,
      params: {
        id: 'user-123',
      },
    };

    mockReply = {
      code: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    mockService = {
      getResource: jest.fn(),
    };

    (UsersService.getInstance as jest.Mock).mockReturnValue(mockService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should get a user successfully', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    jest.spyOn(mockService, 'getResource').mockResolvedValue(mockUser);

    await getUserHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.child).toHaveBeenCalledWith({
      handler: getUserHandler.name,
    });
    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_USER, logGroup);
    expect(mockService.getResource).toHaveBeenCalledWith('user-123', mockLogger);
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_USER);
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.OK);
    expect(mockReply.send).toHaveBeenCalledWith(mockUser);
  });

  it('should return 404 when user is not found', async () => {
    jest.spyOn(mockService, 'getResource').mockResolvedValue(null);

    await getUserHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_USER, logGroup);
    expect(mockService.getResource).toHaveBeenCalledWith('user-123', mockLogger);
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_USER);
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.NOT_FOUND);
    expect(mockReply.send).toHaveBeenCalledWith({
      code: 'user-not-found',
      message: 'User not found',
    });
  });

  it('should handle service errors', async () => {
    const mockError = new Error('Service error');
    jest.spyOn(mockService, 'getResource').mockRejectedValue(mockError);

    await expect(
      getUserHandler(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      ),
    ).rejects.toThrow(mockError);

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_USER, logGroup);
    expect(mockService.getResource).toHaveBeenCalledWith('user-123', mockLogger);
    expect(mockReply.code).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });
});
