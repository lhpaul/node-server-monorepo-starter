import { compare } from 'bcrypt';

import { ExecutionLogger } from '../../../definitions/logging.interfaces';
import { User } from '../../../domain/models/user.model';
import { PERMISSIONS_BY_ROLE, UserCompanyRole } from '../../../domain/models/user-company-relation.model';
import { UsersRepository } from '../../../repositories/users/users.repository';
import { UserCompanyRelationsRepository } from '../../../repositories/user-company-relations/user-company-relations.repository';
import { AuthService } from '../auth.service';
import { STEPS } from '../auth.service.constants';


jest.mock('bcrypt');
jest.mock('../../../repositories/users/users.repository', () => ({
  UsersRepository: {
    getInstance: jest.fn().mockImplementation(() => ({
      getUsers: jest.fn(),
    })),
  },
}));
jest.mock('../../../repositories/user-company-relations/user-company-relations.repository', () => ({
  UserCompanyRelationsRepository: {
    getInstance: jest.fn().mockImplementation(() => ({
      getUserCompanyRelations: jest.fn(),
    })),
  },
}));

describe(AuthService.name, () => {
  let authService: AuthService;
  let mockUsersRepository: { getUsers: jest.Mock };
  let mockUserCompanyRelationsRepository: { getUserCompanyRelations: jest.Mock };
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
      getUsers: jest.fn(),
    };
    mockUserCompanyRelationsRepository = {
      getUserCompanyRelations: jest.fn(),
    };
    (UsersRepository.getInstance as jest.Mock).mockReturnValue(mockUsersRepository);
    (UserCompanyRelationsRepository.getInstance as jest.Mock).mockReturnValue(mockUserCompanyRelationsRepository);
  });

  describe('getInstance', () => {
    it('should return the same instance when called multiple times', () => {
      const instance1 = AuthService.getInstance();
      const instance2 = AuthService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('validateCredentials', () => {
    const mockUser: User = {
      id: 'user-1',
      email: 'test@example.com',
      currentPasswordHash: 'hashed-password',
    } as User;

    beforeEach(() => {
      (mockUsersRepository.getUsers as jest.Mock).mockResolvedValue([mockUser]);
    });

    it('should return null when user is not found', async () => {
      (mockUsersRepository.getUsers as jest.Mock).mockResolvedValue([]);
      const result = await authService.validateCredentials(
        { email: 'nonexistent@example.com', password: 'password' },
        { logger: mockLogger }
      );
      expect(result).toBeNull();
      expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.FIND_USER.id);
      expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.FIND_USER.id);
    });

    it('should return null when password is invalid', async () => {
      (compare as jest.Mock).mockResolvedValue(false);
      const result = await authService.validateCredentials(
        { email: 'test@example.com', password: 'wrong-password' },
        { logger: mockLogger }
      );
      expect(result).toBeNull();
      expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.CHECK_PASSWORD.id);
      expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.CHECK_PASSWORD.id);
    });

    it('should return user when credentials are valid', async () => {
      (compare as jest.Mock).mockResolvedValue(true);
      const result = await authService.validateCredentials(
        { email: 'test@example.com', password: 'correct-password' },
        { logger: mockLogger }
      );
      expect(result).toEqual(mockUser);
      expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.FIND_USER.id);
      expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.FIND_USER.id);
      expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.CHECK_PASSWORD.id);
      expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.CHECK_PASSWORD.id);
    });
    it('should not log when no logger is provided', async () => {
      const result = await authService.validateCredentials({ email: 'test@example.com', password: 'correct-password' });
      expect(result).toEqual(mockUser);
      expect(mockLogger.startStep).not.toHaveBeenCalled();
      expect(mockLogger.endStep).not.toHaveBeenCalled();
    });
  });

  describe('getUserPermissions', () => {
    const mockUserCompanyRelations = [
      {
        userId: 'user-1',
        companyId: 'company-1',
        role: UserCompanyRole.ADMIN,
      },
      {
        userId: 'user-1',
        companyId: 'company-2',
        role: UserCompanyRole.MEMBER,
      },
    ];

    beforeEach(() => {
      (UserCompanyRelationsRepository.getInstance().getUserCompanyRelations as jest.Mock).mockResolvedValue(
        mockUserCompanyRelations
      );
    });

    it('should return user permissions for all companies', async () => {
      const result = await authService.getUserPermissions('user-1', { logger: mockLogger });
      expect(result).toEqual({
        companies: {
          'company-1': PERMISSIONS_BY_ROLE[UserCompanyRole.ADMIN],
          'company-2': PERMISSIONS_BY_ROLE[UserCompanyRole.MEMBER],
        },
      });
      expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_USER_COMPANY_RELATIONS.id);
      expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_USER_COMPANY_RELATIONS.id);
    });

    it('should return empty companies object when user has no company relations', async () => {
      (UserCompanyRelationsRepository.getInstance().getUserCompanyRelations as jest.Mock).mockResolvedValue([]);
      const result = await authService.getUserPermissions('user-1', { logger: mockLogger });
      expect(result).toEqual({ companies: {} });
    });
    it('should not log when no logger is provided', async () => {
      (UserCompanyRelationsRepository.getInstance().getUserCompanyRelations as jest.Mock).mockResolvedValue([]);
      const result = await authService.getUserPermissions('user-1');
      expect(result).toEqual({ companies: {} });
      expect(mockLogger.startStep).not.toHaveBeenCalled();
      expect(mockLogger.endStep).not.toHaveBeenCalled();
    });
  });
}); 