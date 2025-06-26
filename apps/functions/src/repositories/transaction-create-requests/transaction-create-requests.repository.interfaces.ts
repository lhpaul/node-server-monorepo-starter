import { QueryInput, QueryItem } from '@repo/shared/definitions';
import { TransactionType } from '@repo/shared/domain';

import { ProcessResource, ProcessStatus } from '../../definitions';

export interface TransactionCreateRequestDocument extends ProcessResource {
  amount: number;
  date: string;
  type: TransactionType;
}

export interface CreateTransactionCreateRequestDocumentInput {
  amount: number;
  date: string;
  error: null;
  status: ProcessStatus.PENDING;
  type: TransactionType;
}

export interface UpdateTransactionCreateRequestDocumentInput {
  amount?: number;
  date?: string;
  error?: any;
  status?: ProcessStatus;
  type?: TransactionType;
}

export interface QueryTransactionCreateRequestsInput extends QueryInput {
  amount?: QueryItem<number>[];
  date?: QueryItem<string>[];
  status?: QueryItem<ProcessStatus>[];
  type?: QueryItem<TransactionType>[];
} 