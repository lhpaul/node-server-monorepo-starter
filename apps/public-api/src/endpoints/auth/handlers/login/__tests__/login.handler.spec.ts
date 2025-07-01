import { STATUS_CODES } from '@repo/fastify';
import { AuthService, DecodeEmailTokenError, DecodeEmailTokenErrorCode, UsersService } from '@repo/shared/services';
import { FastifyReply, FastifyRequest } from 'fastify';

import { ERROR_RESPONSES, STEPS } from '../login.handler.constants';
import { loginHandler } from '../login.handler';

jest.mock('@repo/shared/services', () => ({
  ...jest.requireActual('@repo/shared/services'),
  AuthService: {
    getInstance: jest.fn(),
  },
  UsersService: {
    getInstance: jest.fn(),
  }
}));

describe(loginHandler.name, () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockLogger: any;
  let mockAuthService: jest.SpyInstance;
  let mockUsersService: jest.SpyInstance;

  const mockEmail = 'test@example.com';
  const mockUserId = 'user-123';
  const mockEmailToken = 'valid-email-token';
  const mockUserToken = 'valid-user-token';
  const mockLogGroup = 'loginHandler';

  beforeEach(() => {
    mockLogger = {
      child: jest.fn().mockReturnThis(),
      startStep: jest.fn(),
      endStep: jest.fn(),
    };

    mockRequest = {
      log: mockLogger,
      body: {
        token: mockEmailToken,
      },
    };

    mockReply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    // Mock AuthService
    mockAuthService = jest.spyOn(AuthService, 'getInstance').mockReturnValue({
      decodeEmailToken: jest.fn(),
      generateUserToken: jest.fn(),
    } as any);

    // Mock UsersRepository
    mockUsersService = jest.spyOn(UsersService, 'getInstance').mockReturnValue({
      getResourcesList: jest.fn(),
    } as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully login a user with valid credentials', async () => {
    // Arrange
    const mockUser = { id: mockUserId, email: mockEmail };
    mockAuthService.mockReturnValue({
      decodeEmailToken: jest.fn().mockResolvedValue({ email: mockEmail }),
      generateUserToken: jest.fn().mockResolvedValue(mockUserToken),
    } as any);

    mockUsersService.mockReturnValue({
      getResourcesList: jest.fn().mockResolvedValue([mockUser]),
    } as any);

    // Act
    await loginHandler(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.DECODE_EMAIL_TOKEN.id, mockLogGroup);
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.DECODE_EMAIL_TOKEN.id);
    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.FIND_USER.id, mockLogGroup);
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.FIND_USER.id);
    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GENERATE_USER_TOKEN.id, mockLogGroup);
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GENERATE_USER_TOKEN.id);
    expect(mockReply.status).toHaveBeenCalledWith(STATUS_CODES.OK);
    expect(mockReply.send).toHaveBeenCalledWith({ token: mockUserToken });
  });

  it('should return unauthorized when user is not found', async () => {
    // Arrange
    mockAuthService.mockReturnValue({
      decodeEmailToken: jest.fn().mockResolvedValue({ email: mockEmail }),
    } as any);

    mockUsersService.mockReturnValue({
      getResourcesList: jest.fn().mockResolvedValue([]),
    } as any);

    // Act
    await loginHandler(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    expect(mockReply.status).toHaveBeenCalledWith(STATUS_CODES.UNAUTHORIZED);
    expect(mockReply.send).toHaveBeenCalledWith({
      code: ERROR_RESPONSES.NO_USER_FOUND.code,
      message: ERROR_RESPONSES.NO_USER_FOUND.message(mockEmail),
    });
  });

  it('should return bad request when email token is invalid', async () => {
    // Arrange
    const mockError = new DecodeEmailTokenError({ code: DecodeEmailTokenErrorCode.INVALID_TOKEN, message: 'Invalid token' });
    mockAuthService.mockReturnValue({
      decodeEmailToken: jest.fn().mockRejectedValue(mockError),
    } as any);

    // Act
    await loginHandler(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    expect(mockReply.status).toHaveBeenCalledWith(STATUS_CODES.BAD_REQUEST);
    expect(mockReply.send).toHaveBeenCalledWith({
      code: mockError.code,
      message: mockError.message,
    });
  });

  it('should throw error for unexpected errors', async () => {
    // Arrange
    const unexpectedError = new Error('Unexpected error');
    mockAuthService.mockReturnValue({
      decodeEmailToken: jest.fn().mockRejectedValue(unexpectedError),
    } as any);

    // Act & Assert
    await expect(loginHandler(mockRequest as FastifyRequest, mockReply as FastifyReply))
      .rejects
      .toThrow(unexpectedError);
  });
});
