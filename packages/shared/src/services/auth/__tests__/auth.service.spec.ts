import { PERMISSIONS_BY_ROLE } from '../../../domain';
import { ExecutionLogger } from '../../../definitions';
import { AuthService } from '../auth.service';
import { ERROR_MESSAGES, PERMISSIONS_SUFFIXES, STEPS } from '../auth.service.constants';
import { DecodeEmailTokenError, DecodeEmailTokenErrorCode } from '../auth.service.errors';


jest.mock('firebase-admin', () => ({
  auth: jest.fn(() => mockFirebaseAuth),
}));
jest.mock('../../../repositories/subscriptions/subscriptions.repository', () => ({
  SubscriptionsRepository: {
    getInstance: jest.fn(() => mockSubscriptionsRepo),
  },
}));
jest.mock('../../../repositories/user-company-relations/user-company-relations.repository', () => ({
  UserCompanyRelationsRepository: {
    getInstance: jest.fn(() => mockUserCompanyRelationsRepo),
  },
}));

const mockFirebaseAuth = {
  verifyIdToken: jest.fn(),
  createCustomToken: jest.fn(),
  setCustomUserClaims: jest.fn(),
};

const mockSubscriptionsRepo = {
  getDocumentsList: jest.fn(),
};

const mockUserCompanyRelationsRepo = {
  getDocumentsList: jest.fn(),
};

describe(AuthService.name, () => {
  let authService: AuthService;
  let mockLogger: jest.Mocked<ExecutionLogger>;

  const mockUserId = 'user123';
  const mockUserCompanyRelations = [
    {
      companyId: 'company1',
      role: 'admin',
    },
    {
      companyId: 'company2',
      role: 'admin',
    },
  ];
  const mockSubscriptions = [
    {
      companyId: 'company1',
      startsAt: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - 1),
      endsAt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate()),
    },
  ];

  const now = new Date();
  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(now);
  });
  afterAll(() => {
    jest.useRealTimers();
  });

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
    it('should generate token with user permissions', async () => {
      const mockToken = 'custom-token'; 

      mockUserCompanyRelationsRepo.getDocumentsList.mockResolvedValue(mockUserCompanyRelations);
      mockSubscriptionsRepo.getDocumentsList.mockResolvedValue(mockSubscriptions);
      mockFirebaseAuth.createCustomToken.mockResolvedValue(mockToken);

      const result = await authService.generateUserToken(mockUserId, mockLogger);

      expect(result).toBe(mockToken);
      expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_USER_COMPANY_RELATIONS.id);
      expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_USER_COMPANY_RELATIONS.id);
      expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_SUBSCRIPTIONS.id);
      expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_SUBSCRIPTIONS.id);
      expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GENERATE_USER_TOKEN.id);
      expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GENERATE_USER_TOKEN.id);
      expect(mockUserCompanyRelationsRepo.getDocumentsList).toHaveBeenCalledWith({
        userId: [{ operator: '==', value: mockUserId }],
      }, mockLogger);
      expect(mockSubscriptionsRepo.getDocumentsList).toHaveBeenCalledWith({
        companyId: [{ operator: 'in', value: mockUserCompanyRelations.map((relation) => relation.companyId) }],
        startsAt: [{ operator: '<=', value: now }],
        endsAt: [{ operator: '>=', value: now }],
      }, mockLogger);
      expect(mockFirebaseAuth.createCustomToken).toHaveBeenCalledWith(mockUserId, {
        companies: {
          company1: PERMISSIONS_BY_ROLE.admin,
          company2: PERMISSIONS_BY_ROLE.admin.map((permission) => permission.replace(PERMISSIONS_SUFFIXES.WRITE, PERMISSIONS_SUFFIXES.READ)),
        },
      });
    });
  });

  describe(AuthService.prototype.updatePermissionsToUser.name, () => {
    const mockUid = 'uid123';
    it('should update the permissions of a user correctly', async () => {
      mockUserCompanyRelationsRepo.getDocumentsList.mockResolvedValue(mockUserCompanyRelations);
      mockSubscriptionsRepo.getDocumentsList.mockResolvedValue(mockSubscriptions);
      mockFirebaseAuth.setCustomUserClaims.mockResolvedValue(mockUserCompanyRelations);

      await authService.updatePermissionsToUser({
        userId: mockUserId,
        uid: mockUid,
      }, mockLogger);

      expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_USER_COMPANY_RELATIONS.id);
      expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_USER_COMPANY_RELATIONS.id);
      expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_SUBSCRIPTIONS.id);
      expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_SUBSCRIPTIONS.id);
      expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.UPDATE_USER_PERMISSIONS.id);
      expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.UPDATE_USER_PERMISSIONS.id);
      expect(mockUserCompanyRelationsRepo.getDocumentsList).toHaveBeenCalledWith({
        userId: [{ operator: '==', value: mockUserId }],
      }, mockLogger);
      expect(mockSubscriptionsRepo.getDocumentsList).toHaveBeenCalledWith({
        companyId: [{ operator: 'in', value: mockUserCompanyRelations.map((relation) => relation.companyId) }],
        startsAt: [{ operator: '<=', value: now }],
        endsAt: [{ operator: '>=', value: now }],
      }, mockLogger);
      expect(mockFirebaseAuth.setCustomUserClaims).toHaveBeenCalledWith(mockUid, {
        app_user_id: mockUserId,
        companies: {
          company1: PERMISSIONS_BY_ROLE.admin,
          company2: PERMISSIONS_BY_ROLE.admin.map((permission) => permission.replace(PERMISSIONS_SUFFIXES.WRITE, PERMISSIONS_SUFFIXES.READ)),
        },
      });
    });
  });
});
