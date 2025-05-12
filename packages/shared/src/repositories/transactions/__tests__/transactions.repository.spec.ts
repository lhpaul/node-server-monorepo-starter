import { TransactionType } from '../../../domain/models/transaction.model';
import { TransactionsRepository } from '../transactions.repository';
import {
  MOCK_TRANSACTIONS,
  ERROR_MESSAGES,
} from '../transactions.repository.constants';
import {
  DeleteTransactionError,
  DeleteTransactionErrorCode,
  UpdateTransactionError,
  UpdateTransactionErrorCode,
} from '../transactions.repository.errors';

describe(TransactionsRepository.name, () => {
  let repository: TransactionsRepository;
  const transactionToAdd = {
    amount: 150,
    date: '2020-01-01',
    type: TransactionType.DEBIT,
  };

  beforeEach(() => {
    // Reset the singleton instance before each test
    (TransactionsRepository as any).instance = undefined;
    repository = TransactionsRepository.getInstance();
  });

  describe(TransactionsRepository.getInstance.name, () => {
    it('should return the same instance when called multiple times', () => {
      const instance1 = TransactionsRepository.getInstance();
      const instance2 = TransactionsRepository.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe(TransactionsRepository.prototype.createTransaction.name, () => {
    it('should add a transaction', async () => {
      const transaction = await repository.createTransaction(transactionToAdd);
      expect(transaction).toEqual({ id: expect.any(String) });
    });
  });

  describe(TransactionsRepository.prototype.deleteTransaction.name, () => {
    it('should delete a transaction', async () => {
      const transaction = await repository.createTransaction(transactionToAdd);
      await repository.deleteTransaction(transaction.id);
      expect(transaction).toEqual({ id: expect.any(String) });
    });

    it('should throw an error if the transaction is not found', async () => {
      try {
        await repository.deleteTransaction('non-existent-id');
      } catch (error: any) {
        expect(error).toBeInstanceOf(DeleteTransactionError);
        expect(error.code).toBe(DeleteTransactionErrorCode.DOCUMENT_NOT_FOUND);
        expect(error.message).toBe(
          ERROR_MESSAGES[DeleteTransactionErrorCode.DOCUMENT_NOT_FOUND],
        );
      }
    });
  });

  describe(TransactionsRepository.prototype.getTransactionById.name, () => {
    it('should return a transaction by id', async () => {
      const transaction = MOCK_TRANSACTIONS[0];
      const fetchedTransaction = await repository.getTransactionById(
        transaction.id,
      );
      expect(fetchedTransaction).toEqual(transaction);
    });

    it('should return null if the transaction is not found', async () => {
      const fetchedTransaction =
        await repository.getTransactionById('non-existent-id');
      expect(fetchedTransaction).toBeNull();
    });
  });

  describe(TransactionsRepository.prototype.getTransactions.name, () => {
    it('should return all transactions when no query is provided', async () => {
      const transactions = await repository.getTransactions();
      expect(transactions).toEqual(MOCK_TRANSACTIONS);
    });

    it('should filter transactions by amount', async () => {
      const transactions = await repository.getTransactions({
        amount: [{ operator: '==', value: 100 }],
      });
      expect(transactions).toHaveLength(1);
      expect(transactions[0].amount).toBe(100);
    });

    it('should filter transactions by type', async () => {
      const transactions = await repository.getTransactions({
        type: [{ operator: '==', value: TransactionType.CREDIT }],
      });
      expect(transactions).toHaveLength(2);
      expect(transactions.every((t) => t.type === TransactionType.CREDIT)).toBe(
        true,
      );
    });

    it('should filter transactions by date range and type', async () => {
      const transactions = await repository.getTransactions({
        date: [
          { operator: '>=', value: '2021-01-02' },
          { operator: '<=', value: '2021-01-03' },
        ],
        type: [{ operator: '==', value: TransactionType.CREDIT }],
      });
      expect(transactions).toHaveLength(1);
      expect(transactions[0].date).toBe('2021-01-03');
      expect(transactions[0].type).toBe(TransactionType.CREDIT);
    });

    it('should return empty array when no transactions match the filters', async () => {
      const transactions = await repository.getTransactions({
        date: [{ operator: '>=', value: '2021-01-04' }],
        type: [{ operator: '==', value: TransactionType.CREDIT }],
      });
      expect(transactions).toHaveLength(0);
    });
  });

  describe(TransactionsRepository.prototype.updateTransaction.name, () => {
    const updatedData = {
      amount: 200,
      date: '2020-01-02',
      type: TransactionType.DEBIT,
    };
    it('should update a transaction', async () => {
      const transaction = await repository.createTransaction({
        amount: 100,
        date: '2021-01-01',
        type: TransactionType.CREDIT,
      });
      await repository.updateTransaction(transaction.id, updatedData);
      const updatedTransaction = await repository.getTransactionById(
        transaction.id,
      );
      expect(updatedTransaction).not.toBeNull();
      expect(updatedTransaction?.amount).toBe(updatedData.amount);
      expect(updatedTransaction?.date).toBe(updatedData.date);
      expect(updatedTransaction?.type).toBe(updatedData.type);
    });

    it('should throw an error if the transaction is not found', async () => {
      try {
        await repository.updateTransaction('non-existent-id', updatedData);
      } catch (error: any) {
        expect(error).toBeInstanceOf(UpdateTransactionError);
        expect(error.code).toBe(UpdateTransactionErrorCode.DOCUMENT_NOT_FOUND);
        expect(error.message).toBe(
          ERROR_MESSAGES[UpdateTransactionErrorCode.DOCUMENT_NOT_FOUND],
        );
      }
    });
  });
});
