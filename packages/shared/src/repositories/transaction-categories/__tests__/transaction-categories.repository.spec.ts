import { ExecutionLogger } from '../../../definitions';
import { TransactionCategoryType } from '../../../domain/models/transaction-category.model';
import { RepositoryError, RepositoryErrorCode } from '../../../utils/repositories/repositories.errors';
import { InMemoryRepository } from '../../../utils/repositories/in-memory-repository.class';
import { MOCK_TRANSACTION_CATEGORIES } from '../transaction-categories.repository.constants';
import { TransactionCategoriesRepository } from '../transaction-categories.repository';
import {
  CreateTransactionCategoryDocumentInput,
  UpdateTransactionCategoryDocumentInput,
  QueryTransactionCategoriesInput,
} from '../transaction-categories.repository.interfaces';

jest.mock('../../../utils/repositories/in-memory-repository.class');

const MockedInMemoryRepository = InMemoryRepository as jest.MockedClass<typeof InMemoryRepository>;

describe(TransactionCategoriesRepository.name, () => {
  let repository: TransactionCategoriesRepository;
  let mockLogger: ExecutionLogger;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock logger
    mockLogger = {
      startStep: jest.fn(),
      endStep: jest.fn(),
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      fatal: jest.fn(),
      lastStep: { id: '', label: '', startTime: 0 },
      stepsCounter: 0,
      initTime: 0,
      getStepElapsedTime: jest.fn(),
      getTotalElapsedTime: jest.fn(),
      reset: jest.fn(),
    } as unknown as ExecutionLogger;

    // Reset the singleton instance before each test
    (TransactionCategoriesRepository as any).instance = undefined;
  });

  describe(TransactionCategoriesRepository.getInstance.name, () => {
    it('should create a new instance with the correct mock data', () => {
      TransactionCategoriesRepository.getInstance();
      expect(InMemoryRepository).toHaveBeenCalledWith(MOCK_TRANSACTION_CATEGORIES);
    });

    it('should return the same instance when called multiple times', () => {
      const instance1 = TransactionCategoriesRepository.getInstance();
      const instance2 = TransactionCategoriesRepository.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe(TransactionCategoriesRepository.prototype.createDocument.name, () => {
    beforeEach(() => {
      repository = TransactionCategoriesRepository.getInstance();
    });

    it('should create a new transaction category document', async () => {
      const mockCreateData: CreateTransactionCategoryDocumentInput = {
        name: 'Test Category',
        type: TransactionCategoryType.EXPENSE,
      };

      const mockCreatedId = '8';
      MockedInMemoryRepository.prototype.createDocument.mockResolvedValue(mockCreatedId);

      const result = await repository.createDocument(mockCreateData, mockLogger);

      expect(result).toBe(mockCreatedId);
      expect(MockedInMemoryRepository.prototype.createDocument).toHaveBeenCalledWith(
        mockCreateData,
        mockLogger
      );
    });

    it('should handle creation with income type', async () => {
      const mockCreateData: CreateTransactionCategoryDocumentInput = {
        name: 'Bonus',
        type: TransactionCategoryType.INCOME,
      };

      const mockCreatedId = '9';
      MockedInMemoryRepository.prototype.createDocument.mockResolvedValue(mockCreatedId);

      const result = await repository.createDocument(mockCreateData, mockLogger);

      expect(result).toBe(mockCreatedId);
      expect(MockedInMemoryRepository.prototype.createDocument).toHaveBeenCalledWith(
        mockCreateData,
        mockLogger
      );
    });
  });

  describe(TransactionCategoriesRepository.prototype.getDocument.name, () => {
    beforeEach(() => {
      repository = TransactionCategoriesRepository.getInstance();
    });

    it('should retrieve an existing transaction category document', async () => {
      const mockDocumentId = '0';
      const mockDocument = MOCK_TRANSACTION_CATEGORIES[0];
      MockedInMemoryRepository.prototype.getDocument.mockResolvedValue(mockDocument);

      const result = await repository.getDocument(mockDocumentId, mockLogger);

      expect(result).toBe(mockDocument);
      expect(MockedInMemoryRepository.prototype.getDocument).toHaveBeenCalledWith(
        mockDocumentId,
        mockLogger
      );
    });

    it('should return null for non-existent document', async () => {
      const mockDocumentId = '999';
      MockedInMemoryRepository.prototype.getDocument.mockResolvedValue(null);

      const result = await repository.getDocument(mockDocumentId, mockLogger);

      expect(result).toBeNull();
      expect(MockedInMemoryRepository.prototype.getDocument).toHaveBeenCalledWith(
        mockDocumentId,
        mockLogger
      );
    });
  });

  describe(TransactionCategoriesRepository.prototype.getDocumentsList.name, () => {
    beforeEach(() => {
      repository = TransactionCategoriesRepository.getInstance();
    });

    it('should retrieve all transaction categories when no query is provided', async () => {
      const mockDocuments = MOCK_TRANSACTION_CATEGORIES;
      MockedInMemoryRepository.prototype.getDocumentsList.mockResolvedValue(mockDocuments);

      const result = await repository.getDocumentsList({}, mockLogger);

      expect(result).toBe(mockDocuments);
      expect(MockedInMemoryRepository.prototype.getDocumentsList).toHaveBeenCalledWith(
        {},
        mockLogger
      );
    });

    it('should filter transaction categories by name', async () => {
      const query: QueryTransactionCategoriesInput = {
        name: [{ operator: '==', value: 'Salary' }],
      };
      const mockFilteredDocuments = [MOCK_TRANSACTION_CATEGORIES[0]];
      MockedInMemoryRepository.prototype.getDocumentsList.mockResolvedValue(mockFilteredDocuments);

      const result = await repository.getDocumentsList(query, mockLogger);

      expect(result).toBe(mockFilteredDocuments);
      expect(MockedInMemoryRepository.prototype.getDocumentsList).toHaveBeenCalledWith(
        query,
        mockLogger
      );
    });

    it('should filter transaction categories by type', async () => {
      const query: QueryTransactionCategoriesInput = {
        type: [{ operator: '==', value: TransactionCategoryType.INCOME }],
      };
      const mockFilteredDocuments = MOCK_TRANSACTION_CATEGORIES.filter(
        (doc) => doc.type === TransactionCategoryType.INCOME
      );
      MockedInMemoryRepository.prototype.getDocumentsList.mockResolvedValue(mockFilteredDocuments);

      const result = await repository.getDocumentsList(query, mockLogger);

      expect(result).toBe(mockFilteredDocuments);
      expect(MockedInMemoryRepository.prototype.getDocumentsList).toHaveBeenCalledWith(
        query,
        mockLogger
      );
    });

    it('should filter transaction categories by multiple criteria', async () => {
      const query: QueryTransactionCategoriesInput = {
        name: [{ operator: 'in', value: ['Groceries'] }],
        type: [{ operator: '==', value: TransactionCategoryType.EXPENSE }],
      };
      const mockFilteredDocuments = [MOCK_TRANSACTION_CATEGORIES[3]];
      MockedInMemoryRepository.prototype.getDocumentsList.mockResolvedValue(mockFilteredDocuments);

      const result = await repository.getDocumentsList(query, mockLogger);

      expect(result).toBe(mockFilteredDocuments);
      expect(MockedInMemoryRepository.prototype.getDocumentsList).toHaveBeenCalledWith(
        query,
        mockLogger
      );
    });
  });

  describe(TransactionCategoriesRepository.prototype.updateDocument.name, () => {
    beforeEach(() => {
      repository = TransactionCategoriesRepository.getInstance();
    });

    it('should update an existing transaction category document', async () => {
      const mockDocumentId = '0';
      const mockUpdateData: UpdateTransactionCategoryDocumentInput = {
        name: 'Updated Salary',
        type: TransactionCategoryType.INCOME,
      };

      MockedInMemoryRepository.prototype.updateDocument.mockResolvedValue();

      await repository.updateDocument(mockDocumentId, mockUpdateData, mockLogger);

      expect(MockedInMemoryRepository.prototype.updateDocument).toHaveBeenCalledWith(
        mockDocumentId,
        mockUpdateData,
        mockLogger
      );
    });

    it('should update only the name field', async () => {
      const mockDocumentId = '1';
      const mockUpdateData: UpdateTransactionCategoryDocumentInput = {
        name: 'Updated Freelance',
      };

      MockedInMemoryRepository.prototype.updateDocument.mockResolvedValue();

      await repository.updateDocument(mockDocumentId, mockUpdateData, mockLogger);

      expect(MockedInMemoryRepository.prototype.updateDocument).toHaveBeenCalledWith(
        mockDocumentId,
        mockUpdateData,
        mockLogger
      );
    });

    it('should update only the type field', async () => {
      const mockDocumentId = '2';
      const mockUpdateData: UpdateTransactionCategoryDocumentInput = {
        type: TransactionCategoryType.EXPENSE,
      };

      MockedInMemoryRepository.prototype.updateDocument.mockResolvedValue();

      await repository.updateDocument(mockDocumentId, mockUpdateData, mockLogger);

      expect(MockedInMemoryRepository.prototype.updateDocument).toHaveBeenCalledWith(
        mockDocumentId,
        mockUpdateData,
        mockLogger
      );
    });

    it('should throw RepositoryError when document is not found', async () => {
      const mockDocumentId = '999';
      const mockUpdateData: UpdateTransactionCategoryDocumentInput = {
        name: 'Non-existent Category',
      };

      MockedInMemoryRepository.prototype.updateDocument.mockRejectedValue(
        new RepositoryError({
          code: RepositoryErrorCode.DOCUMENT_NOT_FOUND,
          message: 'Document not found',
        })
      );

      await expect(
        repository.updateDocument(mockDocumentId, mockUpdateData, mockLogger)
      ).rejects.toThrow(RepositoryError);

      expect(MockedInMemoryRepository.prototype.updateDocument).toHaveBeenCalledWith(
        mockDocumentId,
        mockUpdateData,
        mockLogger
      );
    });
  });

  describe(TransactionCategoriesRepository.prototype.deleteDocument.name, () => {
    beforeEach(() => {
      repository = TransactionCategoriesRepository.getInstance();
    });

    it('should delete an existing transaction category document', async () => {
      const mockDocumentId = '0';

      MockedInMemoryRepository.prototype.deleteDocument.mockResolvedValue();

      await repository.deleteDocument(mockDocumentId, mockLogger);

      expect(MockedInMemoryRepository.prototype.deleteDocument).toHaveBeenCalledWith(
        mockDocumentId,
        mockLogger
      );
    });

    it('should throw RepositoryError when document is not found', async () => {
      const mockDocumentId = '999';

      MockedInMemoryRepository.prototype.deleteDocument.mockRejectedValue(
        new RepositoryError({
          code: RepositoryErrorCode.DOCUMENT_NOT_FOUND,
          message: 'Document not found',
        })
      );

      await expect(repository.deleteDocument(mockDocumentId, mockLogger)).rejects.toThrow(
        RepositoryError
      );

      expect(MockedInMemoryRepository.prototype.deleteDocument).toHaveBeenCalledWith(
        mockDocumentId,
        mockLogger
      );
    });
  });
}); 