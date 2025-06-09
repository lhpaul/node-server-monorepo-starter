import { compare } from 'bcrypt';

import { ExecutionLogger } from '../../../definitions';
import { User, UserCompanyRole, PERMISSIONS_BY_ROLE } from '../../../domain';
import { SubscriptionsRepository, UsersRepository, UserCompanyRelationsRepository } from '../../../repositories';
import { AuthService } from '../auth.service';
import { STEPS, WRITE_PERMISSION_SUFFIX } from '../auth.service.constants';

jest.mock('bcrypt');
jest.mock('../../../repositories/subscriptions/subscriptions.repository');
jest.mock('../../../repositories/users/users.repository');
jest.mock('../../../repositories/user-company-relations/user-company-relations.repository');

describe(AuthService.name, () => {
  let authService: AuthService;
  let mockUsersRepository: Partial<UsersRepository>;
  let mockUserCompanyRelationsRepository: Partial<UserCompanyRelationsRepository>;
  let mockSubscriptionsRepository: Partial<SubscriptionsRepository>;
  const mockLogger: jest.Mocked<ExecutionLogger> = {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    fatal: jest.fn(),
    trace: jest.fn(),
    silent: jest.fn(),
    level: 'info',
    initTime: 0,
    lastStep: { id: '' },
    startStep: jest.fn(),
    endStep: jest.fn(),
    getStepElapsedTime: jest.fn(),
    getTotalElapsedTime: jest.fn(),
  } as unknown as jest.Mocked<ExecutionLogger>;

  beforeEach(() => {
    jest.clearAllMocks();
    authService = AuthService.getInstance();
    mockUsersRepository = {
      getDocumentsList: jest.fn(),
    };
    mockUserCompanyRelationsRepository = {
      getDocumentsList: jest.fn(),
    };
    mockSubscriptionsRepository = {
      getDocumentsList: jest.fn(),
    };
    (UsersRepository.getInstance as jest.Mock).mockReturnValue(mockUsersRepository);
    (UserCompanyRelationsRepository.getInstance as jest.Mock).mockReturnValue(mockUserCompanyRelationsRepository);
    (SubscriptionsRepository.getInstance as jest.Mock).mockReturnValue(mockSubscriptionsRepository);
  });

  describe(AuthService.getInstance.name, () => {
    it('should return the same instance when called multiple times', () => {
      const instance1 = AuthService.getInstance();
      const instance2 = AuthService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe(AuthService.prototype.validateCredentials.name, () => {
    const mockUser: User = {
      id: 'user-1',
      email: 'test@example.com',
      currentPasswordHash: 'hashed-password',
    } as User;

    beforeEach(() => {
      (mockUsersRepository.getDocumentsList as jest.Mock).mockResolvedValue([mockUser]);
    });

    it('should return null when user is not found', async () => {
      (mockUsersRepository.getDocumentsList as jest.Mock).mockResolvedValue([]);
      const result = await authService.validateCredentials(
        { email: 'nonexistent@example.com', password: 'password' },
        mockLogger
      );
      expect(result).toBeNull();
      expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.FIND_USER.id);
      expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.FIND_USER.id);
    });

    it('should return null when password is invalid', async () => {
      (compare as jest.Mock).mockResolvedValue(false);
      const result = await authService.validateCredentials(
        { email: 'test@example.com', password: 'wrong-password' },
        mockLogger
      );
      expect(result).toBeNull();
      expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.CHECK_PASSWORD.id);
      expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.CHECK_PASSWORD.id);
    });

    it('should return user when credentials are valid', async () => {
      (compare as jest.Mock).mockResolvedValue(true);
      const result = await authService.validateCredentials(
        { email: 'test@example.com', password: 'correct-password' },
        mockLogger
      );
      expect(result).toEqual(mockUser);
      expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.FIND_USER.id);
      expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.FIND_USER.id);
      expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.CHECK_PASSWORD.id);
      expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.CHECK_PASSWORD.id);
    });
  });

  describe('getUserPermissions', () => {
    const userId = 'user-1';
    const mockUserCompanyRelations = [
      {
        userId,
        companyId: 'company-1',
        role: UserCompanyRole.ADMIN,
      },
      {
        userId,
        companyId: 'company-2',
        role: UserCompanyRole.ADMIN,
      },
      {
        userId,
        companyId: 'company-3',
        role: UserCompanyRole.MEMBER,
      },
    ];
    const mockSubscriptions = [
      {
        companyId: 'company-1',
        startsAt: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - 1),
        endsAt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate()),
      },
      {
        companyId: 'company-2',
        startsAt: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - 1),
        endsAt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate()),
      },
      
    ];

    beforeEach(() => {
      (mockUserCompanyRelationsRepository.getDocumentsList as jest.Mock).mockResolvedValue(
        mockUserCompanyRelations
      );
    });

    it('should return user permissions for all companies', async () => {
      (mockSubscriptionsRepository.getDocumentsList as jest.Mock).mockResolvedValueOnce([mockSubscriptions[0]]);
      (mockSubscriptionsRepository.getDocumentsList as jest.Mock).mockResolvedValueOnce([mockSubscriptions[1]]);
      (mockSubscriptionsRepository.getDocumentsList as jest.Mock).mockResolvedValueOnce([]);
      const result = await authService.getUserPermissions(userId, mockLogger);
      expect(result).toEqual({
        companies: {
          'company-1': PERMISSIONS_BY_ROLE[UserCompanyRole.ADMIN],
          'company-2': PERMISSIONS_BY_ROLE[UserCompanyRole.ADMIN],
          'company-3': PERMISSIONS_BY_ROLE[UserCompanyRole.MEMBER],
        },
      });
      expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_USER_COMPANY_RELATIONS.id);
      expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_USER_COMPANY_RELATIONS.id);
    });

    it('should return empty companies object when user has no company relations', async () => {
      (mockUserCompanyRelationsRepository.getDocumentsList as jest.Mock).mockResolvedValue([]);
      const result = await authService.getUserPermissions(userId, mockLogger);
      expect(result).toEqual({ companies: {} });
    });
    
    it('should remove write permissions to companies without active subscriptions', async () => {
      (mockUserCompanyRelationsRepository.getDocumentsList as jest.Mock).mockResolvedValue(
        mockUserCompanyRelations
      );
      (mockSubscriptionsRepository.getDocumentsList as jest.Mock).mockResolvedValueOnce([mockSubscriptions[0]]);
      (mockSubscriptionsRepository.getDocumentsList as jest.Mock).mockResolvedValueOnce([]);
      (mockSubscriptionsRepository.getDocumentsList as jest.Mock).mockResolvedValueOnce([]);
      const result = await authService.getUserPermissions(userId, mockLogger);
      expect(result).toEqual({
        companies: {
          'company-1': PERMISSIONS_BY_ROLE[UserCompanyRole.ADMIN],
          'company-2': PERMISSIONS_BY_ROLE[UserCompanyRole.ADMIN].filter((permission) => !permission.includes(WRITE_PERMISSION_SUFFIX)),
          'company-3': PERMISSIONS_BY_ROLE[UserCompanyRole.MEMBER].filter((permission) => !permission.includes(WRITE_PERMISSION_SUFFIX)),
        },
      });
    });
  });
}); 