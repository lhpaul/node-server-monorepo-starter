import { STATUS_CODES } from '@repo/fastify';
import { UsersService } from '@repo/shared/domain';
import { FastifyReply, FastifyRequest } from 'fastify';

import { listUsersHandler } from '../users.list.handler';
import { STEPS } from '../users.list.handler.constants';

jest.mock('@repo/shared/domain');

describe(listUsersHandler.name, () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockLogger: any;
  let mockService: Partial<UsersService>;
  const logGroup = listUsersHandler.name;

  beforeEach(() => {
    mockLogger = {
      child: jest.fn().mockReturnThis(),
      startStep: jest.fn(),
      endStep: jest.fn(),
    };

    mockRequest = {
      log: mockLogger,
      query: {},
    };

    mockReply = {
      code: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    mockService = {
      getResourcesList: jest.fn(),
    };

    (UsersService.getInstance as jest.Mock).mockReturnValue(mockService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should list users successfully without query parameters', async () => {
    const mockUsers = [
      {
        id: 'user-1',
        email: 'user1@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'user-2',
        email: 'user2@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    jest.spyOn(mockService, 'getResourcesList').mockResolvedValue(mockUsers);

    await listUsersHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.child).toHaveBeenCalledWith({
      handler: listUsersHandler.name,
    });
    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.LIST_USERS, logGroup);
    expect(mockService.getResourcesList).toHaveBeenCalledWith({}, mockLogger);
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.LIST_USERS);
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.OK);
    expect(mockReply.send).toHaveBeenCalledWith(mockUsers);
  });

  it('should list users successfully with query parameters', async () => {
    const queryParams = {
      'email[eq]': 'test@example.com',
    };
    mockRequest.query = queryParams;

    const mockUsers = [
      {
        id: 'user-1',
        email: 'test@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    jest.spyOn(mockService, 'getResourcesList').mockResolvedValue(mockUsers);

    await listUsersHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.LIST_USERS, logGroup);
    expect(mockService.getResourcesList).toHaveBeenCalledWith(queryParams, mockLogger);
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.LIST_USERS);
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.OK);
    expect(mockReply.send).toHaveBeenCalledWith(mockUsers);
  });

  it('should return empty array when no users found', async () => {
    jest.spyOn(mockService, 'getResourcesList').mockResolvedValue([]);

    await listUsersHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.LIST_USERS, logGroup);
    expect(mockService.getResourcesList).toHaveBeenCalledWith({}, mockLogger);
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.LIST_USERS);
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.OK);
    expect(mockReply.send).toHaveBeenCalledWith([]);
  });

  it('should handle service errors', async () => {
    const mockError = new Error('Service error');
    jest.spyOn(mockService, 'getResourcesList').mockRejectedValue(mockError);

    await expect(
      listUsersHandler(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      ),
    ).rejects.toThrow(mockError);

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.LIST_USERS, logGroup);
    expect(mockService.getResourcesList).toHaveBeenCalledWith({}, mockLogger);
    expect(mockReply.code).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });
});
