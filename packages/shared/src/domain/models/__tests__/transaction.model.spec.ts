import { Transaction, TransactionType } from '../transaction.model';

describe(Transaction.name, () => {
  const initialValues = {
    amount: 100,
    companyId: '0',
    date: '2024-03-20',
    id: 'txn-123',
    type: TransactionType.DEBIT,
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

  describe('Property Assignment', () => {
    it('should assign and retrieve amount correctly', () => {
      const testAmount = 100.5;
      transaction.amount = testAmount;
      expect(transaction.amount).toBe(testAmount);
    });

    it('should assign and retrieve companyId correctly', () => {
      const testCompanyId = 'test-company-id';
      transaction.companyId = testCompanyId;
      expect(transaction.companyId).toBe(testCompanyId);
    });

    it('should assign and retrieve date correctly', () => {
      const testDate = '2024-03-20';
      transaction.date = testDate;
      expect(transaction.date).toBe(testDate);
    });

    it('should assign and retrieve id correctly', () => {
      const testId = 'txn-123';
      transaction.id = testId;
      expect(transaction.id).toBe(testId);
    });

    it('should assign and retrieve type correctly', () => {
      transaction.type = TransactionType.DEBIT;
      expect(transaction.type).toBe(TransactionType.DEBIT);
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
