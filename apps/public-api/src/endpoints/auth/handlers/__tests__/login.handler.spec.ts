import { AuthService } from '@repo/shared/services';
import { User } from '@repo/shared/domain';
import { UserPermissions } from '@repo/shared/services';
import { FastifyReply, FastifyRequest, FastifyInstance } from 'fastify';
import { loginHandler } from '../login.handler';
import { ERROR_RESPONSES, STEPS } from '../login.constants';

jest.mock('@repo/shared/services', () => ({
  AuthService: {
    getInstance: jest.fn(),
  },
}));

describe(loginHandler.name, () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockAuthService: jest.Mocked<AuthService>;
  let mockLogger: any;

  beforeEach(() => {
    mockLogger = {
      child: jest.fn().mockReturnThis(),
      startStep: jest.fn(),
      endStep: jest.fn(),
    };

    const mockServer = {
      jwt: {
        sign: jest.fn().mockResolvedValue('mock-jwt-token'),
        options: {
          decode: {},
          sign: {},
          verify: {},
        },
        verify: jest.fn(),
        decode: jest.fn(),
        lookupToken: jest.fn(),
      },
    } as unknown as FastifyInstance;

    mockRequest = {
      body: {
        email: 'test@example.com',
        password: 'password123',
      },
      log: mockLogger,
      server: mockServer,
    };

    mockReply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    mockAuthService = {
      validateCredentials: jest.fn(),
      getUserPermissions: jest.fn(),
    } as any;

    (AuthService.getInstance as jest.Mock).mockReturnValue(mockAuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully login with valid credentials', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      currentPasswordHash: 'hashed_password',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const mockPermissions: UserPermissions = {
      companies: {
        'company-1': ['admin'],
      },
    };

    mockAuthService.validateCredentials.mockResolvedValue(mockUser);
    mockAuthService.getUserPermissions.mockResolvedValue(mockPermissions);

    await loginHandler(mockRequest as FastifyRequest, mockReply as FastifyReply);

    expect(mockAuthService.validateCredentials).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(mockLogger.startStep).toHaveBeenCalledWith(
      STEPS.VALIDATE_CREDENTIALS.id,
      STEPS.VALIDATE_CREDENTIALS.obfuscatedId
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.VALIDATE_CREDENTIALS.id);

    expect(mockAuthService.getUserPermissions).toHaveBeenCalledWith('user-123');
    expect(mockLogger.startStep).toHaveBeenCalledWith(
      STEPS.GET_PERMISSIONS.id,
      STEPS.GET_PERMISSIONS.obfuscatedId
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_PERMISSIONS.id);

    expect(mockRequest.server?.jwt.sign).toHaveBeenCalledWith({
      userId: 'user-123',
      ...mockPermissions,
    });

    expect(mockReply.status).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({ token: 'mock-jwt-token' });
  });

  it('should return 401 for invalid credentials', async () => {
    mockAuthService.validateCredentials.mockResolvedValue(null);

    await loginHandler(mockRequest as FastifyRequest, mockReply as FastifyReply);

    expect(mockAuthService.validateCredentials).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(mockLogger.startStep).toHaveBeenCalledWith(
      STEPS.VALIDATE_CREDENTIALS.id,
      STEPS.VALIDATE_CREDENTIALS.obfuscatedId
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.VALIDATE_CREDENTIALS.id);

    expect(mockAuthService.getUserPermissions).not.toHaveBeenCalled();
    expect(mockRequest.server?.jwt.sign).not.toHaveBeenCalled();

    expect(mockReply.status).toHaveBeenCalledWith(401);
    expect(mockReply.send).toHaveBeenCalledWith(ERROR_RESPONSES.INVALID_CREDENTIALS);
  });
});
