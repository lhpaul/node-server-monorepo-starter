import { FilterInput, FilterItem } from '../../definitions';
import { TransactionSourceType, TransactionType } from '../../domain';

export interface CreateTransactionInput {
  amount: number;
  companyId: string;
  date: string;
  description: string | null;
  type: TransactionType;
  sourceType: TransactionSourceType;
  sourceId: string;
  sourceTransactionId: string;
}

export interface UpdateTransactionInput {
  amount?: number;
  companyId?: string;
  date?: string;
  description?: string;
  type?: TransactionType;
  sourceType?: TransactionSourceType;
  sourceId?: string;
  sourceTransactionId?: string;
}

export interface FilterTransactionsInput extends FilterInput {
  amount?: FilterItem<number>[];
  companyId?: FilterItem<string>[];
  date?: FilterItem<string>[];
  sourceType?: FilterItem<TransactionSourceType>[];
  sourceId?: FilterItem<string>[];
  sourceTransactionId?: FilterItem<string>[];
  type?: FilterItem<TransactionType>[];
}

export interface SyncWithFinancialInstitutionInput {
  companyId: string;
  financialInstitutionId: string;
  fromDate: string;
  toDate: string;
}

export interface SyncTransactionsActions {
  createTransactions: CreateTransactionInput[];
  updateTransactions: { id: string; data: UpdateTransactionInput }[];
  deleteTransactions: string[];
}