import { ExecutionLogger } from '../../../definitions';
import { UserCompanyRole } from '../../../domain';
import { InMemoryRepository } from '../../../utils/repositories/in-memory-repository.class';
import { RepositoryError, RepositoryErrorCode } from '../../../utils/repositories/repositories.errors';
import { CompaniesRepository } from '../../companies/companies.repository';
import { UsersRepository } from '../../users/users.repository';
import { ERROR_MESSAGES, MOCK_USER_COMPANY_RELATIONS } from '../user-company-relations.repository.constants';
import { UserCompanyRelationsRepository } from '../user-company-relations.repository';

jest.mock('../../../utils/repositories/in-memory-repository.class');

describe(UserCompanyRelationsRepository.name, () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe(UserCompanyRelationsRepository.getInstance.name, () => {
    it('should create a new instance with the correct collection path', () => {
      UserCompanyRelationsRepository.getInstance();
      expect(InMemoryRepository).toHaveBeenCalledWith(MOCK_USER_COMPANY_RELATIONS);
    });

    it('should return the same instance when called multiple times', () => {
      const instance1 = UserCompanyRelationsRepository.getInstance();
      const instance2 = UserCompanyRelationsRepository.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe(UserCompanyRelationsRepository.prototype.createDocument.name, () => {
    it('should throw a RepositoryError if the related user is not found', async () => {
      const mockLogger = {
        startStep: jest.fn(),
        endStep: jest.fn(),
      } as unknown as ExecutionLogger;
      const mockData = {
        companyId: '123',
        userId: '123',
        role: UserCompanyRole.ADMIN,
      };
      jest.spyOn(UsersRepository, 'getInstance').mockReturnValue({
        getDocument: jest.fn().mockResolvedValue(null),
      } as unknown as UsersRepository);
      jest.spyOn(CompaniesRepository, 'getInstance').mockReturnValue({
        getDocument: jest.fn().mockResolvedValue({
          id: mockData.companyId,
          name: 'Test Company',
          ownerId: '123',
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      } as unknown as CompaniesRepository);
      try {
        await UserCompanyRelationsRepository.getInstance().createDocument(mockData, mockLogger);
      } catch (error: any) {
        expect(error).toBeInstanceOf(RepositoryError);
        expect(error.code).toBe(RepositoryErrorCode.RELATED_DOCUMENT_NOT_FOUND);
        expect(error.message).toBe(ERROR_MESSAGES.USER_NOT_FOUND);
        expect(error.data).toEqual({ userId: mockData.userId });
      }
    });

    it('should throw a RepositoryError if the related company is not found', async () => {
      const mockLogger = {
        startStep: jest.fn(),
        endStep: jest.fn(),
      } as unknown as ExecutionLogger;
      const mockData = {
        companyId: '123',
        userId: '123',
        role: UserCompanyRole.ADMIN,
      };
      jest.spyOn(UsersRepository, 'getInstance').mockReturnValue({
        getDocument: jest.fn().mockResolvedValue({
          id: mockData.userId,
          name: 'Test User',
          email: 'test@test.com',
        }),
      } as unknown as UsersRepository);
      jest.spyOn(CompaniesRepository, 'getInstance').mockReturnValue({
        getDocument: jest.fn().mockResolvedValue(null),
      } as unknown as CompaniesRepository);
      try {
        await UserCompanyRelationsRepository.getInstance().createDocument(mockData, mockLogger);
      } catch (error: any) {
        expect(error).toBeInstanceOf(RepositoryError);
        expect(error.code).toBe(RepositoryErrorCode.RELATED_DOCUMENT_NOT_FOUND);
        expect(error.message).toBe(ERROR_MESSAGES.COMPANY_NOT_FOUND);
        expect(error.data).toEqual({ companyId: mockData.companyId });
      }
    });

    it('should create a new user company relation if the related user and company are found', async () => {
      const mockLogger = {
        startStep: jest.fn(),
        endStep: jest.fn(),
      } as unknown as ExecutionLogger;
      const mockData = {
        companyId: '123',
        userId: '123',
        role: UserCompanyRole.ADMIN,
      };
      jest.spyOn(UsersRepository, 'getInstance').mockReturnValue({
        getDocument: jest.fn().mockResolvedValue({
          id: mockData.userId,
          name: 'Test User',
          email: 'test@test.com',
        }),
      } as unknown as UsersRepository);
      jest.spyOn(CompaniesRepository, 'getInstance').mockReturnValue({
        getDocument: jest.fn().mockResolvedValue({
          id: mockData.companyId,
          name: 'Test Company',
          ownerId: '123',
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      } as unknown as CompaniesRepository);
      const newUserCompanyRelationId = '1';
      jest.spyOn(InMemoryRepository.prototype, 'createDocument').mockResolvedValue(newUserCompanyRelationId);
      const result = await UserCompanyRelationsRepository.getInstance().createDocument(mockData, mockLogger);
      expect(InMemoryRepository.prototype.createDocument).toHaveBeenCalledWith(mockData, mockLogger);
      expect(result).toBe(newUserCompanyRelationId);
    });
  });
});
