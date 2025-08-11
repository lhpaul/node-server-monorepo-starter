import { Transaction, TransactionSourceType, TransactionType } from '../../../entities/transaction.model';
import { TransactionDocument } from '../../../../repositories/transactions/transactions.repository.interfaces';
import { TransactionDocumentToModelParser } from '../transactions.service.classes';
import { ERRORS_MESSAGES } from '../transactions.service.constants';

describe(TransactionDocumentToModelParser.name, () => {
  const mockDate = new Date('2023-01-01T00:00:00.000Z');
  const baseTransactionDocument: TransactionDocument = {
    id: 'transaction-123',
    amount: 100.50,
    categoryId: 'category-123',
    companyId: 'company-123',
    date: '2023-01-01',
    description: 'Test transaction',
    sourceType: TransactionSourceType.USER,
    sourceId: 'user-123',
    sourceTransactionId: 'source-transaction-123',
    type: TransactionType.CREDIT,
    createdAt: mockDate,
    updatedAt: mockDate,
  };

  describe('constructor', () => {
    it('should create a valid Transaction instance with valid input', () => {
      const parser = new TransactionDocumentToModelParser(baseTransactionDocument);
      
      expect(parser).toBeInstanceOf(Transaction);
      expect(parser).toBeInstanceOf(TransactionDocumentToModelParser);
      expect(parser.id).toBe(baseTransactionDocument.id);
      expect(parser.amount).toBe(baseTransactionDocument.amount);
      expect(parser.categoryId).toBe(baseTransactionDocument.categoryId);
      expect(parser.companyId).toBe(baseTransactionDocument.companyId);
      expect(parser.date).toBe(baseTransactionDocument.date);
      expect(parser.description).toBe(baseTransactionDocument.description);
      expect(parser.sourceType).toBe(baseTransactionDocument.sourceType);
      expect(parser.sourceId).toBe(baseTransactionDocument.sourceId);
      expect(parser.sourceTransactionId).toBe(baseTransactionDocument.sourceTransactionId);
      expect(parser.type).toBe(baseTransactionDocument.type);
      expect(parser.createdAt).toBe(baseTransactionDocument.createdAt);
      expect(parser.updatedAt).toBe(baseTransactionDocument.updatedAt);
    });

    it('should create a valid Transaction instance with DEBIT type', () => {
      const debitTransactionDocument: TransactionDocument = {
        ...baseTransactionDocument,
        type: TransactionType.DEBIT,
      };

      const parser = new TransactionDocumentToModelParser(debitTransactionDocument);
      
      expect(parser).toBeInstanceOf(Transaction);
      expect(parser.type).toBe(TransactionType.DEBIT);
    });

    it('should create a valid Transaction instance with FINANCIAL_INSTITUTION source type', () => {
      const financialInstitutionTransactionDocument: TransactionDocument = {
        ...baseTransactionDocument,
        sourceType: TransactionSourceType.FINANCIAL_INSTITUTION,
      };

      const parser = new TransactionDocumentToModelParser(financialInstitutionTransactionDocument);
      
      expect(parser).toBeInstanceOf(Transaction);
      expect(parser.sourceType).toBe(TransactionSourceType.FINANCIAL_INSTITUTION);
    });

    it('should create a valid Transaction instance with null categoryId', () => {
      const transactionWithoutCategory: TransactionDocument = {
        ...baseTransactionDocument,
        categoryId: null,
      };

      const parser = new TransactionDocumentToModelParser(transactionWithoutCategory);
      
      expect(parser).toBeInstanceOf(Transaction);
      expect(parser.categoryId).toBeNull();
    });

    it('should throw an error for invalid transaction type', () => {
      const invalidTransactionDocument: TransactionDocument = {
        ...baseTransactionDocument,
        type: 'invalid-type' as TransactionType,
      };

      expect(() => {
        new TransactionDocumentToModelParser(invalidTransactionDocument);
      }).toThrow(ERRORS_MESSAGES.INVALID_TRANSACTION_TYPE('invalid-type', baseTransactionDocument.id));
    });

    it('should throw an error for invalid transaction source type', () => {
      const invalidSourceTypeDocument: TransactionDocument = {
        ...baseTransactionDocument,
        sourceType: 'invalid-source-type' as TransactionSourceType,
      };

      expect(() => {
        new TransactionDocumentToModelParser(invalidSourceTypeDocument);
      }).toThrow(ERRORS_MESSAGES.INVALID_TRANSACTION_SOURCE_TYPE('invalid-source-type', baseTransactionDocument.id));
    });

    it('should throw an error for both invalid transaction type and source type', () => {
      const invalidDocument: TransactionDocument = {
        ...baseTransactionDocument,
        type: 'invalid-type' as TransactionType,
        sourceType: 'invalid-source-type' as TransactionSourceType,
      };

      expect(() => {
        new TransactionDocumentToModelParser(invalidDocument);
      }).toThrow(ERRORS_MESSAGES.INVALID_TRANSACTION_TYPE('invalid-type', baseTransactionDocument.id));
    });

    it('should handle edge case with empty string values for type and sourceType', () => {
      const emptyStringDocument: TransactionDocument = {
        ...baseTransactionDocument,
        type: '',
        sourceType: '',
      };

      expect(() => {
        new TransactionDocumentToModelParser(emptyStringDocument);
      }).toThrow(ERRORS_MESSAGES.INVALID_TRANSACTION_TYPE('', baseTransactionDocument.id));
    });

    it('should handle edge case with undefined values for type and sourceType', () => {
      const undefinedDocument: TransactionDocument = {
        ...baseTransactionDocument,
        type: undefined as unknown as string,
        sourceType: undefined as unknown as string,
      };

      expect(() => {
        new TransactionDocumentToModelParser(undefinedDocument);
      }).toThrow(ERRORS_MESSAGES.INVALID_TRANSACTION_TYPE(undefined as unknown as string, baseTransactionDocument.id));
    });

    it('should handle case-sensitive validation correctly', () => {
      const caseSensitiveDocument: TransactionDocument = {
        ...baseTransactionDocument,
        type: 'CREDIT' as TransactionType, // uppercase instead of lowercase
        sourceType: 'USER' as TransactionSourceType, // uppercase instead of lowercase
      };

      expect(() => {
        new TransactionDocumentToModelParser(caseSensitiveDocument);
      }).toThrow(ERRORS_MESSAGES.INVALID_TRANSACTION_TYPE('CREDIT', baseTransactionDocument.id));
    });

    it('should handle whitespace in type and sourceType values', () => {
      const whitespaceDocument: TransactionDocument = {
        ...baseTransactionDocument,
        type: ' credit ' as TransactionType, // with whitespace
        sourceType: ' user ' as TransactionSourceType, // with whitespace
      };

      expect(() => {
        new TransactionDocumentToModelParser(whitespaceDocument);
      }).toThrow(ERRORS_MESSAGES.INVALID_TRANSACTION_TYPE(' credit ', baseTransactionDocument.id));
    });
  });

  describe('inheritance', () => {
    it('should properly inherit from Transaction class', () => {
      const parser = new TransactionDocumentToModelParser(baseTransactionDocument);
      
      expect(parser).toBeInstanceOf(Transaction);
      expect(parser).toBeInstanceOf(TransactionDocumentToModelParser);
      
      // Verify that all Transaction properties are accessible
      expect(parser).toHaveProperty('amount');
      expect(parser).toHaveProperty('categoryId');
      expect(parser).toHaveProperty('companyId');
      expect(parser).toHaveProperty('createdAt');
      expect(parser).toHaveProperty('date');
      expect(parser).toHaveProperty('description');
      expect(parser).toHaveProperty('id');
      expect(parser).toHaveProperty('sourceType');
      expect(parser).toHaveProperty('sourceId');
      expect(parser).toHaveProperty('sourceTransactionId');
      expect(parser).toHaveProperty('type');
      expect(parser).toHaveProperty('updatedAt');
    });
  });
}); 