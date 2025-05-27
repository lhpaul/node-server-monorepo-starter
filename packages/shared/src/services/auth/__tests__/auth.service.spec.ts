import { PERMISSIONS_BY_ROLE } from '../../../domain/models/user-company-relation.model';
import { ExecutionLogger } from '../../../definitions/logging.interfaces';
import { AuthService } from '../auth.service';
import { DecodeEmailTokenError, DecodeEmailTokenErrorCode } from '../auth.service.errors';
import { ERROR_MESSAGES, STEPS } from '../auth.service.constants';

const mockFirebaseAuth = {
  verifyIdToken: jest.fn(),
  createCustomToken: jest.fn(),
  setCustomUserClaims: jest.fn(),
};

jest.mock('firebase-admin', () => ({
  auth: jest.fn(() => mockFirebaseAuth),
}));

const mockUserCompanyRelationsRepo = {
  getUserCompanyRelations: jest.fn(),
};

jest.mock('../../../repositories/user-company-relations/user-company-relations.repository', () => ({
  UserCompanyRelationsRepository: {
    getInstance: jest.fn(() => mockUserCompanyRelationsRepo),
  },
}));

describe(AuthService.name, () => {
  let authService: AuthService;
  let mockLogger: jest.Mocked<ExecutionLogger>;

  beforeEach(() => {
    jest.clearAllMocks();
    authService = AuthService.getInstance();
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      fatal: jest.fn(),
      trace: jest.fn(),
      silent: jest.fn(),
      child: jest.fn(),
      level: 'info',
      lastStep: { id: '' },
      initTime: Date.now(),
      startStep: jest.fn(),
      endStep: jest.fn(),
      getStepElapsedTime: jest.fn(),
      getTotalElapsedTime: jest.fn(),
    } as unknown as jest.Mocked<ExecutionLogger>;
  });

  describe(AuthService.prototype.decodeEmailToken.name, () => {
    it('should successfully decode a valid token', async () => {
      const mockEmail = 'test@example.com';
      const mockToken = 'valid-token';

      mockFirebaseAuth.verifyIdToken.mockResolvedValue({ email: mockEmail });

      const result = await authService.decodeEmailToken(mockToken);

      expect(result).toEqual({ email: mockEmail });
      expect(mockFirebaseAuth.verifyIdToken).toHaveBeenCalledWith(mockToken);
    });

    it('should throw DecodeEmailTokenError when token has no email', async () => {
      const mockToken = 'invalid-token';

      mockFirebaseAuth.verifyIdToken.mockResolvedValue({ email: null });

      await expect(authService.decodeEmailToken(mockToken)).rejects.toThrow(
        new DecodeEmailTokenError({
          code: DecodeEmailTokenErrorCode.INVALID_TOKEN,
          message: ERROR_MESSAGES.NO_EMAIL_IN_TOKEN,
        })
      );
    });

    it('should throw DecodeEmailTokenError with Firebase error message', async () => {
      const mockToken = 'invalid-token';
      const mockError = {
        errorInfo: {
          message: 'Invalid token',
        },
      };

      mockFirebaseAuth.verifyIdToken.mockRejectedValue(mockError);

      await expect(authService.decodeEmailToken(mockToken)).rejects.toThrow(
        new DecodeEmailTokenError({
          code: DecodeEmailTokenErrorCode.INVALID_TOKEN,
          message: mockError.errorInfo.message,
        })
      );
    });
  });

  describe(AuthService.prototype.generateUserToken.name, () => {
    const mockUserId = 'user123';
    const mockToken = 'custom-token';
    const mockUserCompanyRelations = [
      {
        companyId: 'company1',
        role: 'admin',
      },
      {
        companyId: 'company2',
        role: 'member',
      },
    ];

    beforeEach(() => {
      mockUserCompanyRelationsRepo.getUserCompanyRelations.mockResolvedValue(mockUserCompanyRelations);
      mockFirebaseAuth.createCustomToken.mockResolvedValue(mockToken);
    });

    it('should generate token with user permissions', async () => {
      const result = await authService.generateUserToken(mockUserId, { logger: mockLogger });

      expect(result).toBe(mockToken);
      expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_USER_COMPANY_RELATIONS.id);
      expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_USER_COMPANY_RELATIONS.id);
      expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GENERATE_USER_TOKEN.id);
      expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GENERATE_USER_TOKEN.id);
      expect(mockUserCompanyRelationsRepo.getUserCompanyRelations).toHaveBeenCalledWith({
        userId: [{ operator: '==', value: mockUserId }],
      });
      expect(mockFirebaseAuth.createCustomToken).toHaveBeenCalledWith(mockUserId, {
        companies: {
          company1: PERMISSIONS_BY_ROLE.admin,
          company2: PERMISSIONS_BY_ROLE.member,
        },
      });
    });

    it('should use processLoggerMock when no logger is provided', async () => {
      const result = await authService.generateUserToken(mockUserId);

      expect(result).toBe(mockToken);
      expect(mockUserCompanyRelationsRepo.getUserCompanyRelations).toHaveBeenCalledWith({
        userId: [{ operator: '==', value: mockUserId }],
      });
      expect(mockFirebaseAuth.createCustomToken).toHaveBeenCalledWith(mockUserId, {
        companies: {
          company1: PERMISSIONS_BY_ROLE.admin,
          company2: PERMISSIONS_BY_ROLE.member,
        },
      });
    });
  });

  describe(AuthService.prototype.updatePermissionsToUser.name, () => {
    it('should update the permissions of a user', async () => {
      const mockUserId = 'user123';
      const mockUid = 'uid123';
      const mockUserCompanyRelations = [
        {
          companyId: 'company1',
          role: 'admin',
        },
        {
          companyId: 'company2',
          role: 'member',
        },
      ];

      mockUserCompanyRelationsRepo.getUserCompanyRelations.mockResolvedValue(mockUserCompanyRelations);
      mockFirebaseAuth.setCustomUserClaims.mockResolvedValue(mockUserCompanyRelations);

      await authService.updatePermissionsToUser({
        userId: mockUserId,
        uid: mockUid,
      }, { logger: mockLogger });

      expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_USER_COMPANY_RELATIONS.id);
      expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_USER_COMPANY_RELATIONS.id);
      expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.UPDATE_USER_PERMISSIONS.id);
      expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.UPDATE_USER_PERMISSIONS.id);
      expect(mockUserCompanyRelationsRepo.getUserCompanyRelations).toHaveBeenCalledWith({
        userId: [{ operator: '==', value: mockUserId }],
      });
      expect(mockFirebaseAuth.setCustomUserClaims).toHaveBeenCalledWith(mockUid, {
        app_user_id: mockUserId,
        companies: {
          company1: PERMISSIONS_BY_ROLE.admin,
          company2: PERMISSIONS_BY_ROLE.member,
        },
      });
    });
    it('should use processLoggerMock when no logger is provided', async () => {
      const mockUserId = 'user123';
      const mockUid = 'uid123';
      const mockUserCompanyRelations = [
        {
          companyId: 'company1',
          role: 'admin',
        },
        {
          companyId: 'company2',
          role: 'member',
        },
      ];

      mockUserCompanyRelationsRepo.getUserCompanyRelations.mockResolvedValue(mockUserCompanyRelations);
      mockFirebaseAuth.setCustomUserClaims.mockResolvedValue(mockUserCompanyRelations);

      await authService.updatePermissionsToUser({
        userId: mockUserId,
        uid: mockUid,
      });

      expect(mockLogger.startStep).not.toHaveBeenCalled();
      expect(mockLogger.endStep).not.toHaveBeenCalled();
      expect(mockUserCompanyRelationsRepo.getUserCompanyRelations).toHaveBeenCalledWith({
        userId: [{ operator: '==', value: mockUserId }],
      });
      expect(mockFirebaseAuth.setCustomUserClaims).toHaveBeenCalledWith(mockUid, {
        app_user_id: mockUserId,
        companies: {
          company1: PERMISSIONS_BY_ROLE.admin,
          company2: PERMISSIONS_BY_ROLE.member,
        },
      });
    });
  });
});
