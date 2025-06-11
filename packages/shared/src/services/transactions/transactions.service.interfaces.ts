import { FilterInput, FilterItem } from '../../definitions';
import { TransactionType } from '../../domain';

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

export interface FilterTransactionsInput extends FilterInput {
  amount?: FilterItem<number>[];
  companyId?: FilterItem<string>[];
  date?: FilterItem<string>[];
  type?: FilterItem<TransactionType>[];
} 