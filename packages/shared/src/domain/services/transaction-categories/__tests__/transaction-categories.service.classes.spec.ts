import { TransactionCategory, TransactionCategoryType } from '../../../entities/transaction-category.model';
import { TransactionCategoryDocument } from '../../../../repositories/transaction-categories/transaction-categories.repository.interfaces';
import { TransactionCategoryDocumentToModelParser } from '../transaction-categories.service.classes';
import { ERRORS_MESSAGES } from '../transaction-categories.service.constants';

describe(TransactionCategoryDocumentToModelParser.name, () => {
  const mockValidDocument: TransactionCategoryDocument = {
    createdAt: new Date('2023-01-01T00:00:00Z'),
    id: 'test-id-1',
    name: {
      en: 'Test Category',
      es: 'Categoría de Prueba',
    },
    type: TransactionCategoryType.INCOME,
    updatedAt: new Date('2023-01-02T00:00:00Z'),
  };

  const mockExpenseDocument: TransactionCategoryDocument = {
    createdAt: new Date('2023-01-01T00:00:00Z'),
    id: 'test-id-2',
    name: {
      en: 'Test Expense Category',
      es: 'Categoría de Gasto de Prueba',
    },
    type: TransactionCategoryType.EXPENSE,
    updatedAt: new Date('2023-01-02T00:00:00Z'),
  };

  describe('constructor', () => {
    it('should create a valid TransactionCategory instance with INCOME type', () => {
      const parser = new TransactionCategoryDocumentToModelParser(mockValidDocument);

      expect(parser).toBeInstanceOf(TransactionCategory);
      expect(parser.id).toBe(mockValidDocument.id);
      expect(parser.name).toEqual(mockValidDocument.name);
      expect(parser.type).toBe(TransactionCategoryType.INCOME);
      expect(parser.createdAt).toEqual(mockValidDocument.createdAt);
      expect(parser.updatedAt).toEqual(mockValidDocument.updatedAt);
    });

    it('should create a valid TransactionCategory instance with EXPENSE type', () => {
      const parser = new TransactionCategoryDocumentToModelParser(mockExpenseDocument);

      expect(parser).toBeInstanceOf(TransactionCategory);
      expect(parser.id).toBe(mockExpenseDocument.id);
      expect(parser.name).toEqual(mockExpenseDocument.name);
      expect(parser.type).toBe(TransactionCategoryType.EXPENSE);
      expect(parser.createdAt).toEqual(mockExpenseDocument.createdAt);
      expect(parser.updatedAt).toEqual(mockExpenseDocument.updatedAt);
    });

    it('should throw an error for invalid transaction category type', () => {
      const invalidDocument: TransactionCategoryDocument = {
        ...mockValidDocument,
        type: 'invalid-type' as TransactionCategoryType,
      };

      expect(() => {
        new TransactionCategoryDocumentToModelParser(invalidDocument);
      }).toThrow(ERRORS_MESSAGES.INVALID_TRANSACTION_CATEGORY_TYPE('invalid-type', invalidDocument.id));
    });

    it('should throw an error for empty string type', () => {
      const invalidDocument: TransactionCategoryDocument = {
        ...mockValidDocument,
        type: '' as TransactionCategoryType,
      };

      expect(() => {
        new TransactionCategoryDocumentToModelParser(invalidDocument);
      }).toThrow(ERRORS_MESSAGES.INVALID_TRANSACTION_CATEGORY_TYPE('', invalidDocument.id));
    });

    it('should throw an error for null type', () => {
      const invalidDocument: TransactionCategoryDocument = {
        ...mockValidDocument,
        type: null as unknown as TransactionCategoryType,
      };

      expect(() => {
        new TransactionCategoryDocumentToModelParser(invalidDocument);
      }).toThrow(ERRORS_MESSAGES.INVALID_TRANSACTION_CATEGORY_TYPE(null, invalidDocument.id));
    });

    it('should throw an error for undefined type', () => {
      const invalidDocument: TransactionCategoryDocument = {
        ...mockValidDocument,
        type: undefined as unknown as TransactionCategoryType,
      };

      expect(() => {
        new TransactionCategoryDocumentToModelParser(invalidDocument);
      }).toThrow(ERRORS_MESSAGES.INVALID_TRANSACTION_CATEGORY_TYPE(undefined, invalidDocument.id));
    });

    it('should preserve all document properties in the parsed model', () => {
      const documentWithExtraProperties: TransactionCategoryDocument = {
        ...mockValidDocument,
        name: {
          en: 'Complex Category',
          es: 'Categoría Compleja',
          fr: 'Catégorie Complexe',
        },
      };

      const parser = new TransactionCategoryDocumentToModelParser(documentWithExtraProperties);

      expect(parser.name).toEqual(documentWithExtraProperties.name);
      expect(parser.id).toBe(documentWithExtraProperties.id);
      expect(parser.type).toBe(TransactionCategoryType.INCOME);
      expect(parser.createdAt).toEqual(documentWithExtraProperties.createdAt);
      expect(parser.updatedAt).toEqual(documentWithExtraProperties.updatedAt);
    });
  });

  describe('inheritance', () => {
    it('should inherit from TransactionCategory class', () => {
      const parser = new TransactionCategoryDocumentToModelParser(mockValidDocument);

      expect(parser).toBeInstanceOf(TransactionCategory);
      expect(parser).toBeInstanceOf(TransactionCategoryDocumentToModelParser);
    });

    it('should have access to TransactionCategory methods', () => {
      const parser = new TransactionCategoryDocumentToModelParser(mockValidDocument);

      // Test that the getName method is available and works correctly
      expect(typeof parser.getName).toBe('function');
      expect(parser.getName('en')).toBe('Test Category');
      expect(parser.getName('es')).toBe('Categoría de Prueba');
    });
  });
}); 