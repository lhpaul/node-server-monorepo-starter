import { QueryInput, QueryItem } from '@repo/shared/definitions';
import { TransactionType } from '@repo/shared/domain';

import { ProcessDocument, ProcessStatus } from '../../definitions';

export interface TransactionUpdateRequestDocument extends ProcessDocument {
  amount?: number;
  date?: string;
  type?: TransactionType;
  description?: string;
  transactionId: string;
}

export interface CreateTransactionUpdateRequestDocumentInput {
  amount?: number;
  date?: string;
  error: null;
  status: ProcessStatus.PENDING;
  type?: TransactionType;
  transactionId: string;
}

export interface UpdateTransactionUpdateRequestDocumentInput {
  amount?: number;
  date?: string;
  error?: any;
  status?: ProcessStatus;
  type?: TransactionType;
  transactionId?: string;
}

export interface QueryTransactionUpdateRequestsInput extends QueryInput {
  amount?: QueryItem<number>[];
  date?: QueryItem<string>[];
  status?: QueryItem<ProcessStatus>[];
  type?: QueryItem<TransactionType>[];
  transactionId?: QueryItem<string>[];
} 