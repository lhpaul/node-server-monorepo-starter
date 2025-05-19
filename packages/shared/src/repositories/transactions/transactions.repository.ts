import { ExecutionContext } from '../../definitions';
import { QueryOptions } from '../../definitions/listing.interfaces';
import { Transaction } from '../../domain/models/transaction.model';
import { filterList } from '../../utils';
import {
  ERROR_MESSAGES,
  MOCK_TRANSACTIONS,
} from './transactions.repository.constants';
import {
  UpdateTransactionError,
  UpdateTransactionErrorCode,
  DeleteTransactionError,
  DeleteTransactionErrorCode,
} from './transactions.repository.errors';
import {
  CreateTransactionBody,
  GetTransactionsQuery,
  UpdateTransactionBody,
} from './transactions.repository.interfaces';

export class TransactionsRepository {
  private static instance: TransactionsRepository;

  public static getInstance(): TransactionsRepository {
    if (!TransactionsRepository.instance) {
      TransactionsRepository.instance = new TransactionsRepository();
    }
    return TransactionsRepository.instance;
  }

  private constructor() {}

  public createTransaction(
    body: CreateTransactionBody,
    _context?: ExecutionContext,
  ): Promise<{ id: string }> {
    const id = MOCK_TRANSACTIONS.length.toString();
    MOCK_TRANSACTIONS.push(
      new Transaction({
        ...body,
        id,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    );
    return Promise.resolve({ id });
  }

  public deleteTransaction(
    id: string,
    _context?: ExecutionContext,
  ): Promise<void> {
    const index = MOCK_TRANSACTIONS.findIndex((t) => t.id === id);
    if (index !== -1) {
      MOCK_TRANSACTIONS.splice(index, 1);
    } else {
      throw new DeleteTransactionError({
        code: DeleteTransactionErrorCode.DOCUMENT_NOT_FOUND,
        message: ERROR_MESSAGES[DeleteTransactionErrorCode.DOCUMENT_NOT_FOUND],
      });
    }
    return Promise.resolve();
  }

  public getTransactionById(
    id: string,
    _context?: ExecutionContext,
  ): Promise<Transaction | null> {
    return Promise.resolve(
      MOCK_TRANSACTIONS.find((transaction) => transaction.id === id) ?? null,
    );
  }

  public getTransactions(
    query?: GetTransactionsQuery,
    _context?: ExecutionContext,
  ): Promise<Transaction[]> {
    if (!query) {
      return Promise.resolve(MOCK_TRANSACTIONS);
    }
    let filteredItems: Transaction[] = [...MOCK_TRANSACTIONS];
    for (const key in query) {
      const queries = query[
        key as keyof GetTransactionsQuery
      ] as QueryOptions<any>[];
      filteredItems = queries.reduce(
        (acc, query) => filterList(acc, key, query),
        filteredItems,
      );
    }
    return Promise.resolve(filteredItems);
  }

  public updateTransaction(
    id: string,
    body: UpdateTransactionBody,
    _context?: ExecutionContext,
  ): Promise<void> {
    const index = MOCK_TRANSACTIONS.findIndex((t) => t.id === id);
    if (index !== -1) {
      MOCK_TRANSACTIONS[index] = { ...MOCK_TRANSACTIONS[index], ...body };
    } else {
      throw new UpdateTransactionError({
        code: UpdateTransactionErrorCode.DOCUMENT_NOT_FOUND,
        message: ERROR_MESSAGES[UpdateTransactionErrorCode.DOCUMENT_NOT_FOUND],
      });
    }
    return Promise.resolve();
  }
}
