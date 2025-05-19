import { Transaction, TransactionType } from '../transaction.model';

describe(Transaction.name, () => {
  const initialValues = {
    amount: 100,
    companyId: '0',
    createdAt: new Date(),
    date: '2024-03-20',
    id: 'txn-123',
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
      expect(transaction.companyId).toBe(initialValues.companyId);
      expect(transaction.date).toBe(initialValues.date);
      expect(transaction.id).toBe(initialValues.id);
      expect(transaction.type).toBe(initialValues.type);
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
});
