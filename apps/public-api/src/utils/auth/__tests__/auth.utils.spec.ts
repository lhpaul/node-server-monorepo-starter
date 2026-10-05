import { ExecutionLogger } from '@repo/shared/definitions';
import { UsersService, User, UserRole } from '@repo/shared/domain';
import * as admin from 'firebase-admin';

import { decodeEmailToken, generateUserToken, updatePermissionsToUser } from '../auth.utils';
import { 
  DECODE_EMAIL_TOKEN_ERROR_MESSAGES,
  GENERATE_USER_TOKEN_STEPS,
  LOG_GROUP_NAME,
  UPDATE_USER_PERMISSIONS_STEPS,
  UPDATE_USER_PERMISSIONS_ERROR_MESSAGES,
} from '../auth.utils.constants';
import { DecodeEmailTokenError, DecodeEmailTokenErrorCode, UpdateUserPermissionsError, UpdateUserPermissionsErrorCode } from '../auth.utils.errors';

// Mock the shared domain services
jest.mock('@repo/shared/domain');

// Mock Firebase Admin SDK
jest.mock('firebase-admin', () => ({
  auth: jest.fn(),
}));

describe(decodeEmailToken.name, () => {
  let mockAuth: jest.Mocked<admin.auth.Auth>;
  let mockVerifyIdToken: jest.Mock;

  beforeEach(() => {
    mockVerifyIdToken = jest.fn();
    mockAuth = {
      verifyIdToken: mockVerifyIdToken,
    } as unknown as jest.Mocked<admin.auth.Auth>;
    
    (admin.auth as jest.Mock).mockReturnValue(mockAuth);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should decode email token successfully', async () => {
    const token = 'valid-token';
    const expectedEmail = 'user@example.com';
    
    mockVerifyIdToken.mockResolvedValue({ email: expectedEmail });

    const result = await decodeEmailToken(token);

    expect(mockAuth.verifyIdToken).toHaveBeenCalledWith(token);
    expect(result).toEqual({ email: expectedEmail });
  });

  it('should throw DecodeEmailTokenError when token has no email', async () => {
    const token = 'token-without-email';
    
    mockVerifyIdToken.mockResolvedValue({ email: null });

    await expect(decodeEmailToken(token)).rejects.toThrow(DecodeEmailTokenError);
    await expect(decodeEmailToken(token)).rejects.toThrow(DECODE_EMAIL_TOKEN_ERROR_MESSAGES.NO_EMAIL_IN_TOKEN);
    
    expect(mockAuth.verifyIdToken).toHaveBeenCalledWith(token);
  });

  it('should throw DecodeEmailTokenError when token has undefined email', async () => {
    const token = 'token-with-undefined-email';
    
    mockVerifyIdToken.mockResolvedValue({ email: undefined });

    await expect(decodeEmailToken(token)).rejects.toThrow(DecodeEmailTokenError);
    await expect(decodeEmailToken(token)).rejects.toThrow(DECODE_EMAIL_TOKEN_ERROR_MESSAGES.NO_EMAIL_IN_TOKEN);
    
    expect(mockAuth.verifyIdToken).toHaveBeenCalledWith(token);
  });

  it('should throw DecodeEmailTokenError when token has empty string email', async () => {
    const token = 'token-with-empty-email';
    
    mockVerifyIdToken.mockResolvedValue({ email: '' });

    await expect(decodeEmailToken(token)).rejects.toThrow(DecodeEmailTokenError);
    await expect(decodeEmailToken(token)).rejects.toThrow(DECODE_EMAIL_TOKEN_ERROR_MESSAGES.NO_EMAIL_IN_TOKEN);
    
    expect(mockAuth.verifyIdToken).toHaveBeenCalledWith(token);
  });

  it('should throw DecodeEmailTokenError with Firebase error message when verifyIdToken fails with errorInfo', async () => {
    const token = 'invalid-token';
    const firebaseError = {
      errorInfo: {
        message: 'Firebase ID token has expired',
      },
    };
    
    mockVerifyIdToken.mockRejectedValue(firebaseError);

    await expect(decodeEmailToken(token)).rejects.toThrow(DecodeEmailTokenError);
    await expect(decodeEmailToken(token)).rejects.toThrow('Firebase ID token has expired');
    
    expect(mockAuth.verifyIdToken).toHaveBeenCalledWith(token);
  });

  it('should throw DecodeEmailTokenError with Firebase error message for malformed token', async () => {
    const token = 'malformed-token';
    const firebaseError = {
      errorInfo: {
        message: 'Firebase ID token has incorrect "aud" (audience) claim',
      },
    };
    
    mockVerifyIdToken.mockRejectedValue(firebaseError);

    await expect(decodeEmailToken(token)).rejects.toThrow(DecodeEmailTokenError);
    await expect(decodeEmailToken(token)).rejects.toThrow('Firebase ID token has incorrect "aud" (audience) claim');
    
    expect(mockAuth.verifyIdToken).toHaveBeenCalledWith(token);
  });

  it('should re-throw error when verifyIdToken fails without errorInfo', async () => {
    const token = 'token-causing-unknown-error';
    const unknownError = new Error('Unknown error');
    
    mockVerifyIdToken.mockRejectedValue(unknownError);

    await expect(decodeEmailToken(token)).rejects.toThrow('Unknown error');
    await expect(decodeEmailToken(token)).rejects.not.toThrow(DecodeEmailTokenError);
    
    expect(mockAuth.verifyIdToken).toHaveBeenCalledWith(token);
  });

  it('should handle network errors from Firebase', async () => {
    const token = 'token-causing-network-error';
    const networkError = {
      errorInfo: {
        message: 'Network error occurred while verifying token',
      },
    };
    
    mockVerifyIdToken.mockRejectedValue(networkError);

    await expect(decodeEmailToken(token)).rejects.toThrow(DecodeEmailTokenError);
    await expect(decodeEmailToken(token)).rejects.toThrow('Network error occurred while verifying token');
    
    expect(mockAuth.verifyIdToken).toHaveBeenCalledWith(token);
  });

  it('should handle token with additional claims but valid email', async () => {
    const token = 'token-with-claims';
    const expectedEmail = 'user@example.com';
    const tokenPayload = {
      email: expectedEmail,
      name: 'John Doe',
      picture: 'https://example.com/photo.jpg',
      iss: 'https://securetoken.google.com/project-id',
      aud: 'project-id',
      exp: 1234567890,
    };
    
    mockVerifyIdToken.mockResolvedValue(tokenPayload);

    const result = await decodeEmailToken(token);

    expect(mockAuth.verifyIdToken).toHaveBeenCalledWith(token);
    expect(result).toEqual({ email: expectedEmail });
  });
});

describe(generateUserToken.name, () => {
  let mockAuth: jest.Mocked<admin.auth.Auth>;
  let mockCreateCustomToken: jest.Mock;
  let mockLogger: jest.Mocked<ExecutionLogger>;

  beforeEach(() => {
    mockCreateCustomToken = jest.fn();
    mockAuth = {
      createCustomToken: mockCreateCustomToken,
    } as unknown as jest.Mocked<admin.auth.Auth>;
    
    (admin.auth as jest.Mock).mockReturnValue(mockAuth);

    // Setup mock logger
    mockLogger = {
      startStep: jest.fn(),
      endStep: jest.fn(),
      child: jest.fn(),
      level: 'info',
      fatal: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      info: jest.fn(),
      debug: jest.fn(),
      trace: jest.fn(),
      silent: jest.fn(),
    } as unknown as jest.Mocked<ExecutionLogger>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should generate user token successfully', async () => {
    const userId = 'user-123';
    const expectedToken = 'generated-custom-token';
    
    mockCreateCustomToken.mockResolvedValue(expectedToken);

    const result = await generateUserToken(userId, mockLogger);

    expect(mockLogger.startStep).toHaveBeenCalledWith(
      GENERATE_USER_TOKEN_STEPS.GENERATE_USER_TOKEN,
      `${LOG_GROUP_NAME}.${generateUserToken.name}`
    );
    expect(mockAuth.createCustomToken).toHaveBeenCalledWith(userId, {
      app_user_id: userId,
    });
    expect(mockLogger.endStep).toHaveBeenCalledWith(
      GENERATE_USER_TOKEN_STEPS.GENERATE_USER_TOKEN
    );
    expect(result).toBe(expectedToken);
  });

  it('should handle Firebase createCustomToken errors', async () => {
    const userId = 'user-123';
    const error = new Error('Firebase createCustomToken error');
    
    mockCreateCustomToken.mockRejectedValue(error);

    await expect(generateUserToken(userId, mockLogger)).rejects.toThrow('Firebase createCustomToken error');

    expect(mockLogger.startStep).toHaveBeenCalledWith(
      GENERATE_USER_TOKEN_STEPS.GENERATE_USER_TOKEN,
      `${LOG_GROUP_NAME}.${generateUserToken.name}`
    );
    expect(mockAuth.createCustomToken).toHaveBeenCalledWith(userId, {
      app_user_id: userId,
    });
    expect(mockLogger.endStep).not.toHaveBeenCalled();
  });

  it('should generate token with correct claims structure', async () => {
    const userId = 'user-456';
    const expectedToken = 'another-custom-token';

    mockCreateCustomToken.mockResolvedValue(expectedToken);

    await generateUserToken(userId, mockLogger);

    expect(mockAuth.createCustomToken).toHaveBeenCalledWith(userId, {
      app_user_id: userId,
    });
  });
});

describe(updatePermissionsToUser.name, () => {
  let mockAuth: jest.Mocked<admin.auth.Auth>;
  let mockSetCustomUserClaims: jest.Mock;
  let mockLogger: jest.Mocked<ExecutionLogger>;
  let mockUsersService: jest.Mocked<UsersService>;
  let mockGetResource: jest.Mock;

  beforeEach(() => {
    mockSetCustomUserClaims = jest.fn();
    mockAuth = {
      setCustomUserClaims: mockSetCustomUserClaims,
    } as unknown as jest.Mocked<admin.auth.Auth>;
    
    (admin.auth as jest.Mock).mockReturnValue(mockAuth);

    // Setup mock logger
    mockLogger = {
      startStep: jest.fn(),
      endStep: jest.fn(),
      child: jest.fn(),
      level: 'info',
      fatal: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      info: jest.fn(),
      debug: jest.fn(),
      trace: jest.fn(),
      silent: jest.fn(),
    } as unknown as jest.Mocked<ExecutionLogger>;

    // Setup mock UsersService
    mockGetResource = jest.fn();
    mockUsersService = {
      getResource: mockGetResource,
    } as unknown as jest.Mocked<UsersService>;
    
    (UsersService.getInstance as jest.Mock).mockReturnValue(mockUsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should update user permissions successfully', async () => {
    const userId = 'user-123';
    const uid = 'firebase-uid-456';
    const userRole = UserRole.ADMIN;
    
    const mockUser = {
      id: userId,
      email: 'user@example.com',
      role: userRole,
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
    } as User;

    mockGetResource.mockResolvedValue(mockUser);
    mockSetCustomUserClaims.mockResolvedValue(undefined);

    await updatePermissionsToUser({ userId, uid }, mockLogger);

    expect(mockLogger.startStep).toHaveBeenCalledWith(
      UPDATE_USER_PERMISSIONS_STEPS.GET_USER,
      `${LOG_GROUP_NAME}.${updatePermissionsToUser.name}`
    );
    expect(mockUsersService.getResource).toHaveBeenCalledWith(userId, mockLogger);
    expect(mockLogger.endStep).toHaveBeenCalledWith(UPDATE_USER_PERMISSIONS_STEPS.GET_USER);
    
    expect(mockLogger.startStep).toHaveBeenCalledWith(
      UPDATE_USER_PERMISSIONS_STEPS.UPDATE_USER_PERMISSIONS,
      `${LOG_GROUP_NAME}.${updatePermissionsToUser.name}`
    );
    expect(mockAuth.setCustomUserClaims).toHaveBeenCalledWith(uid, {
      role: userRole,
    });
    expect(mockLogger.endStep).toHaveBeenCalledWith(UPDATE_USER_PERMISSIONS_STEPS.UPDATE_USER_PERMISSIONS);
  });

  it('should update user permissions with VIEWER role', async () => {
    const userId = 'user-456';
    const uid = 'firebase-uid-789';
    const userRole = UserRole.VIEWER;
    
    const mockUser = {
      id: userId,
      email: 'viewer@example.com',
      role: userRole,
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
    } as User;

    mockGetResource.mockResolvedValue(mockUser);
    mockSetCustomUserClaims.mockResolvedValue(undefined);

    await updatePermissionsToUser({ userId, uid }, mockLogger);

    expect(mockAuth.setCustomUserClaims).toHaveBeenCalledWith(uid, {
      role: userRole,
    });
  });

  it('should throw UpdateUserPermissionsError when user is not found', async () => {
    const userId = 'non-existent-user';
    const uid = 'firebase-uid-123';
    
    mockGetResource.mockResolvedValue(null);

    await expect(updatePermissionsToUser({ userId, uid }, mockLogger)).rejects.toThrow(UpdateUserPermissionsError);
    await expect(updatePermissionsToUser({ userId, uid }, mockLogger)).rejects.toThrow(
      UPDATE_USER_PERMISSIONS_ERROR_MESSAGES.USER_NOT_FOUND(userId)
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(
      UPDATE_USER_PERMISSIONS_STEPS.GET_USER,
      `${LOG_GROUP_NAME}.${updatePermissionsToUser.name}`
    );
    expect(mockUsersService.getResource).toHaveBeenCalledWith(userId, mockLogger);
    expect(mockLogger.endStep).toHaveBeenCalledWith(UPDATE_USER_PERMISSIONS_STEPS.GET_USER);
    expect(mockAuth.setCustomUserClaims).not.toHaveBeenCalled();
  });

  it('should throw UpdateUserPermissionsError with correct error code when user is not found', async () => {
    const userId = 'non-existent-user';
    const uid = 'firebase-uid-123';
    
    mockGetResource.mockResolvedValue(null);

    await expect(updatePermissionsToUser({ userId, uid }, mockLogger)).rejects.toThrow(UpdateUserPermissionsError);
    await expect(updatePermissionsToUser({ userId, uid }, mockLogger)).rejects.toMatchObject({
      code: UpdateUserPermissionsErrorCode.USER_NOT_FOUND,
    });
  });

  it('should handle Firebase setCustomUserClaims errors', async () => {
    const userId = 'user-123';
    const uid = 'firebase-uid-456';
    const userRole = UserRole.ADMIN;
    const firebaseError = new Error('Firebase setCustomUserClaims error');
    
    const mockUser = {
      id: userId,
      email: 'user@example.com',
      role: userRole,
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
    } as User;

    mockGetResource.mockResolvedValue(mockUser);
    mockSetCustomUserClaims.mockRejectedValue(firebaseError);

    await expect(updatePermissionsToUser({ userId, uid }, mockLogger)).rejects.toThrow('Firebase setCustomUserClaims error');

    expect(mockLogger.startStep).toHaveBeenCalledWith(
      UPDATE_USER_PERMISSIONS_STEPS.GET_USER,
      `${LOG_GROUP_NAME}.${updatePermissionsToUser.name}`
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(UPDATE_USER_PERMISSIONS_STEPS.GET_USER);
    expect(mockLogger.startStep).toHaveBeenCalledWith(
      UPDATE_USER_PERMISSIONS_STEPS.UPDATE_USER_PERMISSIONS,
      `${LOG_GROUP_NAME}.${updatePermissionsToUser.name}`
    );
    expect(mockAuth.setCustomUserClaims).toHaveBeenCalledWith(uid, {
      role: userRole,
    });
    expect(mockLogger.endStep).not.toHaveBeenCalledWith(UPDATE_USER_PERMISSIONS_STEPS.UPDATE_USER_PERMISSIONS);
  });

  it('should handle UsersService getResource errors', async () => {
    const userId = 'user-123';
    const uid = 'firebase-uid-456';
    const serviceError = new Error('UsersService getResource error');
    
    mockGetResource.mockRejectedValue(serviceError);

    await expect(updatePermissionsToUser({ userId, uid }, mockLogger)).rejects.toThrow('UsersService getResource error');

    expect(mockLogger.startStep).toHaveBeenCalledWith(
      UPDATE_USER_PERMISSIONS_STEPS.GET_USER,
      `${LOG_GROUP_NAME}.${updatePermissionsToUser.name}`
    );
    expect(mockUsersService.getResource).toHaveBeenCalledWith(userId, mockLogger);
    expect(mockLogger.endStep).not.toHaveBeenCalledWith(UPDATE_USER_PERMISSIONS_STEPS.GET_USER);
    expect(mockAuth.setCustomUserClaims).not.toHaveBeenCalled();
  });

  it('should call setCustomUserClaims with correct claims structure', async () => {
    const userId = 'user-789';
    const uid = 'firebase-uid-999';
    const userRole = UserRole.ADMIN;
    
    const mockUser = {
      id: userId,
      email: 'admin@example.com',
      role: userRole,
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
    } as User;

    mockGetResource.mockResolvedValue(mockUser);
    mockSetCustomUserClaims.mockResolvedValue(undefined);

    await updatePermissionsToUser({ userId, uid }, mockLogger);

    expect(mockAuth.setCustomUserClaims).toHaveBeenCalledWith(uid, {
      role: userRole,
    });
  });

  it('should handle different user roles correctly', async () => {
    const testCases = [
      { role: UserRole.ADMIN, expectedRole: UserRole.ADMIN },
      { role: UserRole.VIEWER, expectedRole: UserRole.VIEWER },
    ];

    for (const testCase of testCases) {
      const userId = `user-${testCase.role}`;
      const uid = `firebase-uid-${testCase.role}`;
      
      const mockUser = {
        id: userId,
        email: `${testCase.role}@example.com`,
        role: testCase.role,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
      } as User;

      mockGetResource.mockResolvedValue(mockUser);
      mockSetCustomUserClaims.mockResolvedValue(undefined);

      await updatePermissionsToUser({ userId, uid }, mockLogger);

      expect(mockAuth.setCustomUserClaims).toHaveBeenCalledWith(uid, {
        role: testCase.expectedRole,
      });

      jest.clearAllMocks();
    }
  });

  it('should log all steps in correct order', async () => {
    const userId = 'user-123';
    const uid = 'firebase-uid-456';
    const userRole = UserRole.ADMIN;
    
    const mockUser = {
      id: userId,
      email: 'user@example.com',
      role: userRole,
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
    } as User;

    mockGetResource.mockResolvedValue(mockUser);
    mockSetCustomUserClaims.mockResolvedValue(undefined);

    await updatePermissionsToUser({ userId, uid }, mockLogger);

    expect(mockLogger.startStep).toHaveBeenNthCalledWith(1,
      UPDATE_USER_PERMISSIONS_STEPS.GET_USER,
      `${LOG_GROUP_NAME}.${updatePermissionsToUser.name}`
    );
    expect(mockLogger.endStep).toHaveBeenNthCalledWith(1, UPDATE_USER_PERMISSIONS_STEPS.GET_USER);
    expect(mockLogger.startStep).toHaveBeenNthCalledWith(2,
      UPDATE_USER_PERMISSIONS_STEPS.UPDATE_USER_PERMISSIONS,
      `${LOG_GROUP_NAME}.${updatePermissionsToUser.name}`
    );
    expect(mockLogger.endStep).toHaveBeenNthCalledWith(2, UPDATE_USER_PERMISSIONS_STEPS.UPDATE_USER_PERMISSIONS);
  });
});
