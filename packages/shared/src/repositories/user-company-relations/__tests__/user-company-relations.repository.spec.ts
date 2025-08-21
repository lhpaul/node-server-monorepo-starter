import { ExecutionLogger } from '../../../definitions';
import { FirestoreCollectionRepository } from '../../../utils/repositories';
import { RepositoryError, RepositoryErrorCode } from '../../../utils/repositories';
import { UsersRepository } from '../../users/users.repository';
import { CompaniesRepository } from '../../companies/companies.repository';
import { UserCompanyRelationsRepository } from '../user-company-relations.repository';
import {
  COLLECTION_PATH,
  ERROR_MESSAGES,
  STEPS,
} from '../user-company-relations.repository.constants';
import { CreateUserCompanyRelationDocumentInput } from '../user-company-relations.repository.interfaces';

jest.mock('../../../utils/repositories/firestore-collection-repository.class');
jest.mock('../../users/users.repository');
jest.mock('../../companies/companies.repository');

describe(UserCompanyRelationsRepository.name, () => {
  let repository: UserCompanyRelationsRepository;
  let mockLogger: ExecutionLogger;
  let mockUsersRepository: jest.Mocked<UsersRepository>;
  let mockCompaniesRepository: jest.Mocked<CompaniesRepository>;

  const mockUserId = 'user-123';
  const mockCompanyId = 'company-456';
  const mockRole = 'admin';

  const mockCreateInput: CreateUserCompanyRelationDocumentInput = {
    userId: mockUserId,
    companyId: mockCompanyId,
    role: mockRole,
  };

  const mockUserDocument = {
    id: mockUserId,
    email: 'test@example.com',
    currentPasswordHash: 'hashed-password-123',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCompanyDocument = {
    id: mockCompanyId,
    name: 'Test Company',
    countryCode: 'US',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create mock logger
    mockLogger = {
      startStep: jest.fn(),
      endStep: jest.fn(),
      warn: jest.fn(),
    } as unknown as ExecutionLogger;

    // Setup mock repositories
    mockUsersRepository = {
      getInstance: jest.fn(),
      getDocument: jest.fn(),
    } as unknown as jest.Mocked<UsersRepository>;

    mockCompaniesRepository = {
      getInstance: jest.fn(),
      getDocument: jest.fn(),
    } as unknown as jest.Mocked<CompaniesRepository>;

    // Mock the static getInstance methods
    (UsersRepository.getInstance as jest.Mock).mockReturnValue(mockUsersRepository);
    (CompaniesRepository.getInstance as jest.Mock).mockReturnValue(mockCompaniesRepository);
  });

  afterEach(() => {
    // Clear the singleton instance
    (UserCompanyRelationsRepository as any).instance = undefined;
  });

  describe(UserCompanyRelationsRepository.getInstance.name, () => {
    it('should return the same instance when called multiple times', () => {
      const instance1 = UserCompanyRelationsRepository.getInstance();
      const instance2 = UserCompanyRelationsRepository.getInstance();

      expect(instance1).toBe(instance2);
    });

    it('should create a new instance when none exists', () => {
      // Clear the instance
      (UserCompanyRelationsRepository as any).instance = undefined;

      const instance = UserCompanyRelationsRepository.getInstance();

      expect(instance).toBeInstanceOf(UserCompanyRelationsRepository);
    });
  });

  describe('constructor', () => {
    it('should call parent constructor with correct collection path', () => {
      new UserCompanyRelationsRepository();
      expect(FirestoreCollectionRepository).toHaveBeenCalledWith({
        collectionPath: COLLECTION_PATH
      });
    });

    it('should call parent constructor exactly once', () => {
      new UserCompanyRelationsRepository();
      expect(FirestoreCollectionRepository).toHaveBeenCalledTimes(1);
    });
  });

  describe('static properties', () => {
    it('should have correct COLLECTION_PATH constant', () => {
      expect(UserCompanyRelationsRepository.COLLECTION_PATH).toBe(COLLECTION_PATH);
    });
  });

  describe('createDocument validation', () => {
    beforeEach(() => {
      repository = UserCompanyRelationsRepository.getInstance();
    });

    it('should throw RepositoryError when user is not found', async () => {
      // Mock the dependent repositories - user not found
      mockUsersRepository.getDocument.mockResolvedValue(null);
      mockCompaniesRepository.getDocument.mockResolvedValue(mockCompanyDocument);

      try {
        await repository.createDocument(mockCreateInput, mockLogger);
        expect(false).toBe(true);
      } catch (error: any) {
        expect(error).toBeInstanceOf(RepositoryError);
        expect(error.code).toBe(RepositoryErrorCode.RELATED_DOCUMENT_NOT_FOUND);
        expect(error.message).toBe(ERROR_MESSAGES.USER_NOT_FOUND);
      }

      // Verify that the related documents were fetched
      expect(mockUsersRepository.getDocument).toHaveBeenCalledWith(mockUserId, mockLogger);
      expect(mockCompaniesRepository.getDocument).toHaveBeenCalledWith(mockCompanyId, mockLogger);

      // Verify logging
      expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_RELATED_DOCUMENTS.id, `${repository.constructor.name}.${repository.createDocument.name}`);
      expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_RELATED_DOCUMENTS.id);
    });

    it('should throw RepositoryError when company is not found', async () => {
      // Mock the dependent repositories - company not found
      mockUsersRepository.getDocument.mockResolvedValue(mockUserDocument);
      mockCompaniesRepository.getDocument.mockResolvedValue(null);

      try {
        await repository.createDocument(mockCreateInput, mockLogger);
        expect(false).toBe(true);
      } catch (error: any) {
        expect(error).toBeInstanceOf(RepositoryError);
        expect(error.code).toBe(RepositoryErrorCode.RELATED_DOCUMENT_NOT_FOUND);
        expect(error.message).toBe(ERROR_MESSAGES.COMPANY_NOT_FOUND);
      }

      // Verify that the related documents were fetched
      expect(mockUsersRepository.getDocument).toHaveBeenCalledWith(mockUserId, mockLogger);
      expect(mockCompaniesRepository.getDocument).toHaveBeenCalledWith(mockCompanyId, mockLogger);

      // Verify logging
      expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_RELATED_DOCUMENTS.id, `${repository.constructor.name}.${repository.createDocument.name}`);
      expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_RELATED_DOCUMENTS.id);
    });

    it('should successfully create a document', async () => {
      const newDocumentId = 'new-document-id';
      // Mock the dependent repositories - user and company found
      mockUsersRepository.getDocument.mockResolvedValue(mockUserDocument);
      mockCompaniesRepository.getDocument.mockResolvedValue(mockCompanyDocument);
      jest.spyOn(FirestoreCollectionRepository.prototype, 'createDocument').mockResolvedValue(newDocumentId);

      const result = await repository.createDocument(mockCreateInput, mockLogger);

      expect(result).toBe(newDocumentId);

      expect(mockUsersRepository.getDocument).toHaveBeenCalledWith(mockCreateInput.userId, mockLogger);
      expect(mockCompaniesRepository.getDocument).toHaveBeenCalledWith(mockCreateInput.companyId, mockLogger);
      expect(repository.createDocument).toHaveBeenCalledWith(mockCreateInput, mockLogger);
    });

    it('should handle errors from dependent repository calls', async () => {
      const mockError = new Error('Database connection failed');
      
      // Mock the dependent repositories to throw errors
      mockUsersRepository.getDocument.mockRejectedValue(mockError);
      mockCompaniesRepository.getDocument.mockResolvedValue(mockCompanyDocument);

      await expect(repository.createDocument(mockCreateInput, mockLogger)).rejects.toThrow(mockError);

      // Verify that the related documents were fetched
      expect(mockUsersRepository.getDocument).toHaveBeenCalledWith(mockUserId, mockLogger);
      expect(mockCompaniesRepository.getDocument).toHaveBeenCalledWith(mockCompanyId, mockLogger);

      // Verify logging
      expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_RELATED_DOCUMENTS.id, `${repository.constructor.name}.${repository.createDocument.name}`);
      expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_RELATED_DOCUMENTS.id);
    });
  });
});
