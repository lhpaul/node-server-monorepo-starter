import { QueryInput, QueryItem } from '@repo/shared/definitions';
import { TransactionType } from '@repo/shared/domain';

import { ProcessResource, ProcessStatus } from '../../definitions';

export interface TransactionCreateRequestDocument extends ProcessResource {
  amount: number;
  date: string;
  transactionId: string | null;
  type: TransactionType;
}

export interface CreateTransactionCreateRequestDocumentInput {
  amount: number;
  date: string;
  error: null;
  status: ProcessStatus.PENDING;
  transactionId: string | null;
  type: TransactionType;
}

export interface UpdateTransactionCreateRequestDocumentInput {
  amount?: number;
  date?: string;
  error?: any;
  status?: ProcessStatus;
  transactionId?: string;
  type?: TransactionType;
}

export interface QueryTransactionCreateRequestsInput extends QueryInput {
  amount?: QueryItem<number>[];
  date?: QueryItem<string>[];
  status?: QueryItem<ProcessStatus>[];
  transactionId?: QueryItem<string>[];
  type?: QueryItem<TransactionType>[];
} 