import { IQueryInput, IQueryOptions } from '../../definitions/listing.interfaces';
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

export interface GetTransactionsQuery extends IQueryInput {
  amount?: IQueryOptions<number>[];
  companyId?: IQueryOptions<string>[];
  date?: IQueryOptions<string>[];
  type?: IQueryOptions<TransactionType>[];
}
