import { ExecutionLogger } from '../../../definitions';
import { FirestoreCollectionRepository } from '../../../utils/repositories';
import { RepositoryError, RepositoryErrorCode } from '../../../utils/repositories/repositories.errors';
import { CompaniesRepository } from '../../companies/companies.repository';
import { COLLECTION_PATH, ERROR_MESSAGES } from '../transactions.repository.constants';
import { TransactionsRepository } from '../transactions.repository';
import { CreateTransactionDocumentInput } from '../transactions.repository.interfaces';

jest.mock('../../../utils/repositories/firestore-collection-repository.class');
jest.mock('../../companies/companies.repository');

describe(TransactionsRepository.name, () => {
  let mockLogger: ExecutionLogger;
  let mockCompaniesRepository: jest.Mocked<CompaniesRepository>;

  const mockCompanyId = 'company-123';

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
   mockCompaniesRepository = {
     getInstance: jest.fn(),
     getDocument: jest.fn(),
   } as unknown as jest.Mocked<CompaniesRepository>;

   // Mock the static getInstance methods
   (CompaniesRepository.getInstance as jest.Mock).mockReturnValue(mockCompaniesRepository);
  });

  describe(TransactionsRepository.getInstance.name, () => {

    it('should create a new instance with the correct collection path', () => {
      TransactionsRepository.getInstance();
      expect(FirestoreCollectionRepository).toHaveBeenCalledWith({
        collectionPath: COLLECTION_PATH
      });
    });

    it('should return the same instance when called multiple times', () => {
      const instance1 = TransactionsRepository.getInstance();
      const instance2 = TransactionsRepository.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe(TransactionsRepository.prototype.createDocument.name, () => {
    let repository: TransactionsRepository;
    const input: CreateTransactionDocumentInput = {
      companyId: mockCompanyId,
      amount: 100,
      date: '2021-01-01',
      description: 'test',
      sourceId: '0',
      sourceTransactionId: '0',
      sourceType: 'bank',
      type: 'credit',
    };
    beforeEach(() => {
      repository = TransactionsRepository.getInstance();
    });

    it('should throw a RepositoryError if the related company is not found', async () => {
      mockCompaniesRepository.getDocument.mockResolvedValue(null);
      try {
        await repository.createDocument(input, mockLogger);
        expect(false).toBe(true);
      } catch (error: any) {
        expect(error).toBeInstanceOf(RepositoryError);
        expect(error.code).toBe(RepositoryErrorCode.RELATED_DOCUMENT_NOT_FOUND);
        expect(error.message).toBe(ERROR_MESSAGES.COMPANY_NOT_FOUND);
        expect(error.data).toEqual({ companyId: input.companyId });
      }
    });

    it('should create a new transaction if the related company is found', async () => {
      mockCompaniesRepository.getDocument.mockResolvedValue(mockCompanyDocument);
      const newTransactionId = '1';
      jest.spyOn(FirestoreCollectionRepository.prototype, 'createDocument').mockResolvedValue(newTransactionId);
      const result = await repository.createDocument(input, mockLogger);
      expect(repository.createDocument).toHaveBeenCalledWith(input, mockLogger);
      expect(result).toBe(newTransactionId);
    });
  });
});


