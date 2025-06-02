import { QueryInput, QueryOptions } from '../../definitions/listing.interfaces';
import { TransactionType } from '../../domain/models/transaction.model';

export interface CreateTransactionInput {
  amount: number;
  companyId: string;
  date: string;
  type: TransactionType;
}

export interface UpdateTransactionInput {
  amount?: number;
  companyId?: string;
  date?: string;
  type?: TransactionType;
}

export interface GetTransactionsQuery extends QueryInput {
  amount?: QueryOptions<number>[];
  companyId?: QueryOptions<string>[];
  date?: QueryOptions<string>[];
  type?: QueryOptions<TransactionType>[];
}
