import { ExecutionLogger } from '../../../definitions';
import { TransactionCategoryType } from '../../../domain/models/transaction-category.model';
import { InMemoryRepository } from '../../../utils/repositories';
import { TransactionCategoriesRepository } from '../transaction-categories.repository';
import {
  CreateTransactionCategoryDocumentInput,
  UpdateTransactionCategoryDocumentInput,
  QueryTransactionCategoriesInput,
} from '../transaction-categories.repository.interfaces';
import { MOCK_TRANSACTION_CATEGORIES } from '../transaction-categories.repository.constants';

// Mock the InMemoryRepository
jest.mock('../../../utils/repositories/in-memory-repository.class');

const MockedInMemoryRepository = InMemoryRepository as jest.MockedClass<typeof InMemoryRepository>;

describe(TransactionCategoriesRepository.name, () => {
  let repository: TransactionCategoriesRepository;
  let mockLogger: ExecutionLogger;

  beforeEach(() => {
    jest.clearAllMocks();
    mockLogger = {
      startStep: jest.fn(),
      endStep: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
    } as unknown as ExecutionLogger;
  });

  describe('getInstance', () => {
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
        name: { en: 'Test Category', es: 'Categoría de Prueba', fr: 'Catégorie de Test' },
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
        name: { en: 'Bonus', es: 'Bono', fr: 'Prime' },
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

    it('should filter transaction categories by type', async () => {
      const query: QueryTransactionCategoriesInput = {
        type: [{ operator: '==', value: TransactionCategoryType.INCOME }],
      };
      const mockFilteredDocuments = MOCK_TRANSACTION_CATEGORIES.filter(
        (doc: any) => doc.type === TransactionCategoryType.INCOME
      );
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
        name: { en: 'Updated Salary', es: 'Salario Actualizado', fr: 'Salaire Mis à Jour' },
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
        name: { en: 'Updated Freelance', es: 'Freelance Actualizado', fr: 'Freelance Mis à Jour' },
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

    it('should handle update of non-existent document', async () => {
      const mockDocumentId = '999';
      const mockUpdateData: UpdateTransactionCategoryDocumentInput = {
        name: { en: 'Non-existent Category', es: 'Categoría Inexistente', fr: 'Catégorie Inexistante' },
      };

      MockedInMemoryRepository.prototype.updateDocument.mockResolvedValue();

      await repository.updateDocument(mockDocumentId, mockUpdateData, mockLogger);

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

    it('should handle deletion of non-existent document', async () => {
      const mockDocumentId = '999';

      MockedInMemoryRepository.prototype.deleteDocument.mockResolvedValue();

      await repository.deleteDocument(mockDocumentId, mockLogger);

      expect(MockedInMemoryRepository.prototype.deleteDocument).toHaveBeenCalledWith(
        mockDocumentId,
        mockLogger
      );
    });
  });
}); 