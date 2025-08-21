import { Transaction, TransactionType, TransactionSourceType } from '../transaction.model';

describe(Transaction.name, () => {
  const initialValues = {
    amount: 100,
    categoryId: 'category-123',
    companyId: '0',
    createdAt: new Date(),
    date: '2024-03-20',
    description: 'Transaction description',
    id: 'txn-123',
    sourceType: TransactionSourceType.USER,
    sourceId: 'user-456',
    sourceTransactionId: 'src-txn-789',
    type: TransactionType.DEBIT,
    updatedAt: new Date(),
  };
  let transaction: Transaction;

  beforeEach(() => {
    transaction = new Transaction(initialValues);
  });

  describe('Initialization', () => {
    it('should create a new transaction instance', () => {
      expect(transaction).toBeInstanceOf(Transaction);
    });

    it('should initialize with correct values', () => {
      expect(transaction.amount).toBe(initialValues.amount);
      expect(transaction.categoryId).toBe(initialValues.categoryId);
      expect(transaction.companyId).toBe(initialValues.companyId);
      expect(transaction.createdAt).toBe(initialValues.createdAt);
      expect(transaction.date).toBe(initialValues.date);
      expect(transaction.description).toBe(initialValues.description);
      expect(transaction.id).toBe(initialValues.id);
      expect(transaction.sourceType).toBe(initialValues.sourceType);
      expect(transaction.sourceId).toBe(initialValues.sourceId);
      expect(transaction.sourceTransactionId).toBe(initialValues.sourceTransactionId);
      expect(transaction.type).toBe(initialValues.type);
      expect(transaction.updatedAt).toBe(initialValues.updatedAt);
    });
  });
  describe('TransactionType Enum', () => {
    it('should have correct CREDIT value', () => {
      expect(TransactionType.CREDIT).toBe('credit');
    });

    it('should have correct DEBIT value', () => {
      expect(TransactionType.DEBIT).toBe('debit');
    });
  });
  describe('TransactionSourceType Enum', () => {
    it('should have correct USER value', () => {
      expect(TransactionSourceType.USER).toBe('user');
    });
    it('should have correct FINANCIAL_INSTITUTION value', () => {
      expect(TransactionSourceType.FINANCIAL_INSTITUTION).toBe('financial-institution');
    });
  });
});
