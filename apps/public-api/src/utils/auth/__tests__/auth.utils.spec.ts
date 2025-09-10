import { ExecutionLogger } from '@repo/shared/definitions';
import {
  CompaniesService,
  UserCompanyRelationsService,
  UserCompanyRole,
} from '@repo/shared/domain';
import * as admin from 'firebase-admin';

import { decodeEmailToken, generateUserToken, getUserPermissions, updatePermissionsToUser } from '../auth.utils';
import { PERMISSIONS_BY_ROLE } from '../../../constants/permissions.constants';
import { 
  DECODE_EMAIL_TOKEN_ERROR_MESSAGES,
  GENERATE_USER_TOKEN_STEPS,
  GET_USER_PERMISSIONS_STEPS, 
  LOG_GROUP_NAME, 
  PERMISSIONS_SUFFIXES,
  UPDATE_USER_PERMISSIONS_LOGS,
  UPDATE_USER_PERMISSIONS_STEPS,
} from '../auth.utils.constants';
import { DecodeEmailTokenError, DecodeEmailTokenErrorCode } from '../auth.utils.errors';

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
  let mockUserCompanyRelationsService: Partial<UserCompanyRelationsService>;
  let mockCompaniesService: Partial<CompaniesService>;
  let mockUserCompanyRelations: any[];
  let mockCompanySubscriptions: any[][];

  const userId = 'user-123';
  const uid = 'firebase-uid-123';
  const companyId1 = 'company-1';

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

    // Setup mock user company relations
    mockUserCompanyRelations = [
      {
        id: 'relation-1',
        companyId: companyId1,
        userId: userId,
        role: UserCompanyRole.ADMIN,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Setup mock company subscriptions
    mockCompanySubscriptions = [
      [{ id: 'subscription-1', status: 'active' }], // Company has active subscription
    ];

    // Setup mock services
    mockUserCompanyRelationsService = {
      getUserCompanyRelations: jest.fn().mockResolvedValue(mockUserCompanyRelations),
    };

    mockCompaniesService = {
      getActiveSubscriptions: jest.fn().mockResolvedValue(mockCompanySubscriptions[0]),
    };

    // Mock service getInstance methods
    (UserCompanyRelationsService.getInstance as jest.Mock).mockReturnValue(mockUserCompanyRelationsService);
    (CompaniesService.getInstance as jest.Mock).mockReturnValue(mockCompaniesService);

    mockSetCustomUserClaims.mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should update user permissions successfully', async () => {
    const input = { userId, uid };
    const expectedPermissions = {
      companies: {
        [companyId1]: PERMISSIONS_BY_ROLE[UserCompanyRole.ADMIN],
      },
    };

    await updatePermissionsToUser(input, mockLogger);

    // Verify logger calls for getUserPermissions
    expect(mockLogger.startStep).toHaveBeenCalledWith(
      UPDATE_USER_PERMISSIONS_STEPS.GET_USER_PERMISSIONS,
      `${LOG_GROUP_NAME}.${updatePermissionsToUser.name}`
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(
      UPDATE_USER_PERMISSIONS_STEPS.GET_USER_PERMISSIONS
    );

    // Verify permissions logging
    expect(mockLogger.info).toHaveBeenCalledWith(
      {
        logId: UPDATE_USER_PERMISSIONS_LOGS.GET_USER_PERMISSIONS.logId,
        permissions: expectedPermissions,
      },
      UPDATE_USER_PERMISSIONS_LOGS.GET_USER_PERMISSIONS.message
    );

    // Verify logger calls for setCustomUserClaims
    expect(mockLogger.startStep).toHaveBeenCalledWith(
      UPDATE_USER_PERMISSIONS_STEPS.UPDATE_USER_PERMISSIONS,
      `${LOG_GROUP_NAME}.${updatePermissionsToUser.name}`
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(
      UPDATE_USER_PERMISSIONS_STEPS.UPDATE_USER_PERMISSIONS
    );

    // Verify Firebase call
    expect(mockAuth.setCustomUserClaims).toHaveBeenCalledWith(uid, expectedPermissions);
  });

  it('should handle getUserPermissions errors', async () => {
    const input = { userId, uid };
    const error = new Error('getUserPermissions error');
    
    (mockUserCompanyRelationsService.getUserCompanyRelations as jest.Mock).mockRejectedValue(error);

    await expect(updatePermissionsToUser(input, mockLogger)).rejects.toThrow('getUserPermissions error');

    expect(mockLogger.startStep).toHaveBeenCalledWith(
      UPDATE_USER_PERMISSIONS_STEPS.GET_USER_PERMISSIONS,
      `${LOG_GROUP_NAME}.${updatePermissionsToUser.name}`
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(
      UPDATE_USER_PERMISSIONS_STEPS.GET_USER_PERMISSIONS
    );
    expect(mockLogger.info).not.toHaveBeenCalled();
    expect(mockAuth.setCustomUserClaims).not.toHaveBeenCalled();
  });

  it('should handle setCustomUserClaims errors', async () => {
    const input = { userId, uid };
    const error = new Error('setCustomUserClaims error');
    
    mockSetCustomUserClaims.mockRejectedValue(error);

    await expect(updatePermissionsToUser(input, mockLogger)).rejects.toThrow('setCustomUserClaims error');

    expect(mockLogger.startStep).toHaveBeenCalledWith(
      UPDATE_USER_PERMISSIONS_STEPS.UPDATE_USER_PERMISSIONS,
      `${LOG_GROUP_NAME}.${updatePermissionsToUser.name}`
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(
      UPDATE_USER_PERMISSIONS_STEPS.UPDATE_USER_PERMISSIONS
    );
    expect(mockAuth.setCustomUserClaims).toHaveBeenCalledWith(uid, {
      companies: {
        [companyId1]: PERMISSIONS_BY_ROLE[UserCompanyRole.ADMIN],
      },
    });
  });

  it('should handle user with no company relations', async () => {
    const input = { userId, uid };
    mockUserCompanyRelations = [];
    (mockUserCompanyRelationsService.getUserCompanyRelations as jest.Mock).mockResolvedValue(mockUserCompanyRelations);

    await updatePermissionsToUser(input, mockLogger);

    const expectedPermissions = { companies: {} };

    expect(mockLogger.info).toHaveBeenCalledWith(
      {
        logId: UPDATE_USER_PERMISSIONS_LOGS.GET_USER_PERMISSIONS.logId,
        permissions: expectedPermissions,
      },
      UPDATE_USER_PERMISSIONS_LOGS.GET_USER_PERMISSIONS.message
    );

    expect(mockAuth.setCustomUserClaims).toHaveBeenCalledWith(uid, expectedPermissions);
  });

  it('should handle user with company relations but no subscriptions', async () => {
    const input = { userId, uid };
    mockCompanySubscriptions = [[]]; // No subscriptions
    (mockCompaniesService.getActiveSubscriptions as jest.Mock).mockResolvedValue(mockCompanySubscriptions[0]);

    await updatePermissionsToUser(input, mockLogger);

    // Get expected permissions for admin role with write permissions converted to read
    const adminPermissions = PERMISSIONS_BY_ROLE[UserCompanyRole.ADMIN];
    const expectedAdminPermissions = adminPermissions.map(permission =>
      permission.replace(PERMISSIONS_SUFFIXES.WRITE, PERMISSIONS_SUFFIXES.READ)
    );

    const expectedPermissions = {
      companies: {
        [companyId1]: expectedAdminPermissions,
      },
    };

    expect(mockAuth.setCustomUserClaims).toHaveBeenCalledWith(uid, expectedPermissions);
  });

  it('should ensure finally blocks are called even when errors occur', async () => {
    const input = { userId, uid };
    const error = new Error('getUserPermissions error');
    
    (mockUserCompanyRelationsService.getUserCompanyRelations as jest.Mock).mockRejectedValue(error);

    await expect(updatePermissionsToUser(input, mockLogger)).rejects.toThrow('getUserPermissions error');

    // Verify that the finally block in getUserPermissions is called
    expect(mockLogger.endStep).toHaveBeenCalledWith(
      UPDATE_USER_PERMISSIONS_STEPS.GET_USER_PERMISSIONS
    );
  });

  it('should ensure finally blocks are called for setCustomUserClaims errors', async () => {
    const input = { userId, uid };
    const error = new Error('setCustomUserClaims error');
    
    mockSetCustomUserClaims.mockRejectedValue(error);

    await expect(updatePermissionsToUser(input, mockLogger)).rejects.toThrow('setCustomUserClaims error');

    // Verify that the finally block in setCustomUserClaims is called
    expect(mockLogger.endStep).toHaveBeenCalledWith(
      UPDATE_USER_PERMISSIONS_STEPS.UPDATE_USER_PERMISSIONS
    );
  });
});

describe(getUserPermissions.name, () => {
  let mockUserCompanyRelationsService: Partial<UserCompanyRelationsService>;
  let mockCompaniesService: Partial<CompaniesService>;
  let mockLogger: jest.Mocked<ExecutionLogger>;
  let mockUserCompanyRelations: any[];
  let mockCompanySubscriptions: any[][];

  const userId = 'user-123';
  const companyId1 = 'company-1';
  const companyId2 = 'company-2';

  beforeEach(() => {
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

    // Setup mock user company relations
    mockUserCompanyRelations = [
      {
        id: 'relation-1',
        companyId: companyId1,
        userId: userId,
        role: UserCompanyRole.ADMIN,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'relation-2',
        companyId: companyId2,
        userId: userId,
        role: UserCompanyRole.MEMBER,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Setup mock company subscriptions
    mockCompanySubscriptions = [
      [{ id: 'subscription-1', status: 'active' }], // Company 1 has active subscription
      [], // Company 2 has no subscription
    ];

    // Setup mock services
    mockUserCompanyRelationsService = {
      getUserCompanyRelations: jest.fn().mockResolvedValue(mockUserCompanyRelations),
    };

    mockCompaniesService = {
      getActiveSubscriptions: jest.fn(),
    };

    // Mock service getInstance methods
    (UserCompanyRelationsService.getInstance as jest.Mock).mockReturnValue(mockUserCompanyRelationsService);
    (CompaniesService.getInstance as jest.Mock).mockReturnValue(mockCompaniesService);

    // Setup getActiveSubscriptions to return different results for each company
    (mockCompaniesService.getActiveSubscriptions as jest.Mock)
      .mockResolvedValueOnce(mockCompanySubscriptions[0]) // For company 1
      .mockResolvedValueOnce(mockCompanySubscriptions[1]); // For company 2
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should get user permissions successfully with active subscriptions', async () => {
    const result = await getUserPermissions(userId, mockLogger);

    // Verify logger calls
    expect(mockLogger.startStep).toHaveBeenCalledWith(
      GET_USER_PERMISSIONS_STEPS.GET_USER_COMPANY_RELATIONS,
      `${LOG_GROUP_NAME}.${getUserPermissions.name}`
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(
      GET_USER_PERMISSIONS_STEPS.GET_USER_COMPANY_RELATIONS
    );
    expect(mockLogger.startStep).toHaveBeenCalledWith(
      GET_USER_PERMISSIONS_STEPS.GET_SUBSCRIPTIONS,
      `${LOG_GROUP_NAME}.${getUserPermissions.name}`
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(
      GET_USER_PERMISSIONS_STEPS.GET_SUBSCRIPTIONS
    );

    // Verify service calls
    expect(mockUserCompanyRelationsService.getUserCompanyRelations).toHaveBeenCalledWith(userId, mockLogger);
    expect(mockCompaniesService.getActiveSubscriptions).toHaveBeenCalledWith(companyId1, mockLogger);
    expect(mockCompaniesService.getActiveSubscriptions).toHaveBeenCalledWith(companyId2, mockLogger);

    // Verify result structure
    expect(result).toEqual({
      companies: {
        [companyId1]: PERMISSIONS_BY_ROLE[UserCompanyRole.ADMIN], // Admin permissions unchanged (has subscription)
        [companyId2]: PERMISSIONS_BY_ROLE[UserCompanyRole.MEMBER], // Member permissions unchanged (no write permissions to convert)
      },
    });
  });

  it('should convert write permissions to read permissions when company has no active subscriptions', async () => {
    // Setup: Company 1 (ADMIN) has no subscriptions, Company 2 (MEMBER) has subscriptions
    mockCompanySubscriptions = [
      [], // Company 1 has no subscription
      [{ id: 'subscription-2', status: 'active' }], // Company 2 has active subscription
    ];

    // Reset the mock to ensure proper setup
    (mockCompaniesService.getActiveSubscriptions as jest.Mock).mockReset();
    (mockCompaniesService.getActiveSubscriptions as jest.Mock)
      .mockResolvedValueOnce(mockCompanySubscriptions[0]) // For company 1
      .mockResolvedValueOnce(mockCompanySubscriptions[1]); // For company 2

    const result = await getUserPermissions(userId, mockLogger);

    // Get expected permissions for admin role
    const adminPermissions = PERMISSIONS_BY_ROLE[UserCompanyRole.ADMIN];
    const expectedAdminPermissions = adminPermissions.map(permission =>
      permission.replace(PERMISSIONS_SUFFIXES.WRITE, PERMISSIONS_SUFFIXES.READ)
    );

    expect(result).toEqual({
      companies: {
        [companyId1]: expectedAdminPermissions, // Write permissions converted to read
        [companyId2]: PERMISSIONS_BY_ROLE[UserCompanyRole.MEMBER], // Member permissions unchanged
      },
    });
  });

  it('should handle user with no company relations', async () => {
    mockUserCompanyRelations = [];
    (mockUserCompanyRelationsService.getUserCompanyRelations as jest.Mock).mockResolvedValue(mockUserCompanyRelations);

    const result = await getUserPermissions(userId, mockLogger);

    expect(result).toEqual({
      companies: {},
    });

    expect(mockCompaniesService.getActiveSubscriptions).not.toHaveBeenCalled();
  });

  it('should handle user with single company relation', async () => {
    mockUserCompanyRelations = [mockUserCompanyRelations[0]]; // Only admin relation
    mockCompanySubscriptions = [[{ id: 'subscription-1', status: 'active' }]];

    (mockUserCompanyRelationsService.getUserCompanyRelations as jest.Mock).mockResolvedValue(mockUserCompanyRelations);
    (mockCompaniesService.getActiveSubscriptions as jest.Mock).mockResolvedValue(mockCompanySubscriptions[0]);

    const result = await getUserPermissions(userId, mockLogger);

    expect(result).toEqual({
      companies: {
        [companyId1]: PERMISSIONS_BY_ROLE[UserCompanyRole.ADMIN],
      },
    });

    expect(mockCompaniesService.getActiveSubscriptions).toHaveBeenCalledTimes(1);
    expect(mockCompaniesService.getActiveSubscriptions).toHaveBeenCalledWith(companyId1, mockLogger);
  });

  it('should handle service errors gracefully', async () => {
    const error = new Error('Service error');
    (mockUserCompanyRelationsService.getUserCompanyRelations as jest.Mock).mockRejectedValue(error);

    await expect(getUserPermissions(userId, mockLogger)).rejects.toThrow('Service error');

    expect(mockLogger.startStep).toHaveBeenCalledWith(
      GET_USER_PERMISSIONS_STEPS.GET_USER_COMPANY_RELATIONS,
      `${LOG_GROUP_NAME}.${getUserPermissions.name}`
    );
    expect(mockLogger.endStep).not.toHaveBeenCalled();
  });

  it('should handle subscription service errors gracefully', async () => {
    const error = new Error('Subscription service error');
    
    // Reset the mock to ensure proper setup for error scenario
    (mockCompaniesService.getActiveSubscriptions as jest.Mock).mockReset();
    (mockCompaniesService.getActiveSubscriptions as jest.Mock).mockRejectedValue(error);

    await expect(getUserPermissions(userId, mockLogger)).rejects.toThrow('Subscription service error');

    expect(mockLogger.startStep).toHaveBeenCalledWith(
      GET_USER_PERMISSIONS_STEPS.GET_SUBSCRIPTIONS,
      `${LOG_GROUP_NAME}.${getUserPermissions.name}`
    );
    expect(mockLogger.endStep).not.toHaveBeenCalledWith(
      GET_USER_PERMISSIONS_STEPS.GET_SUBSCRIPTIONS
    );
  });

  it('should handle mixed subscription scenarios correctly', async () => {
    // Setup: Multiple companies with different subscription states
    mockUserCompanyRelations = [
      {
        id: 'relation-1',
        companyId: 'company-admin-with-sub',
        userId: userId,
        role: UserCompanyRole.ADMIN,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'relation-2',
        companyId: 'company-admin-without-sub',
        userId: userId,
        role: UserCompanyRole.ADMIN,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'relation-3',
        companyId: 'company-member',
        userId: userId,
        role: UserCompanyRole.MEMBER,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    mockCompanySubscriptions = [
      [{ id: 'subscription-1', status: 'active' }], // Admin with subscription
      [], // Admin without subscription
      [{ id: 'subscription-3', status: 'active' }], // Member with subscription
    ];

    (mockUserCompanyRelationsService.getUserCompanyRelations as jest.Mock).mockResolvedValue(mockUserCompanyRelations);
    (mockCompaniesService.getActiveSubscriptions as jest.Mock)
      .mockResolvedValueOnce(mockCompanySubscriptions[0])
      .mockResolvedValueOnce(mockCompanySubscriptions[1])
      .mockResolvedValueOnce(mockCompanySubscriptions[2]);

    const result = await getUserPermissions(userId, mockLogger);

    // Get expected permissions for admin role with write permissions converted to read
    const adminPermissions = PERMISSIONS_BY_ROLE[UserCompanyRole.ADMIN];
    const expectedAdminPermissionsWithoutSub = adminPermissions.map(permission =>
      permission.replace(PERMISSIONS_SUFFIXES.WRITE, PERMISSIONS_SUFFIXES.READ)
    );

    expect(result).toEqual({
      companies: {
        'company-admin-with-sub': PERMISSIONS_BY_ROLE[UserCompanyRole.ADMIN], // Unchanged (has subscription)
        'company-admin-without-sub': expectedAdminPermissionsWithoutSub, // Write permissions converted to read
        'company-member': PERMISSIONS_BY_ROLE[UserCompanyRole.MEMBER], // Unchanged (no write permissions)
      },
    });
  });
});
