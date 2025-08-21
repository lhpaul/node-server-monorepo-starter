import { QueryInput, QueryItem } from '@repo/shared/definitions';
import { TransactionType, TransactionSourceType } from '@repo/shared/domain';

import { ProcessDocument, ProcessStatus } from '../../definitions';

export interface TransactionCreateRequestDocument extends ProcessDocument {
  amount: number;
  categoryId: string | null;
  date: string;
  description: string;
  sourceType: TransactionSourceType;
  sourceId: string;
  sourceTransactionId: string;
  transactionId: string | null;
  type: TransactionType;
}

export interface CreateTransactionCreateRequestDocumentInput {
  amount: number;
  categoryId: string | null;
  date: string;
  description: string;
  sourceType: TransactionSourceType;
  sourceId: string;
  sourceTransactionId: string;
  type: TransactionType;
}

export interface UpdateTransactionCreateRequestDocumentInput {
  amount?: number;
  categoryId?: string;
  date?: string;
  description?: string;
  error?: any;
  status?: ProcessStatus;
  type?: TransactionType;
  transactionId?: string;
}

export interface QueryTransactionCreateRequestsInput extends QueryInput {
  amount?: QueryItem<number>[];
  categoryId?: QueryItem<string>[];
  date?: QueryItem<string>[];
  status?: QueryItem<ProcessStatus>[];
  sourceId?: QueryItem<string>[];
  sourceType?: QueryItem<TransactionSourceType>[];
  sourceTransactionId?: QueryItem<string>[];
  type?: QueryItem<TransactionType>[];
  transactionId?: {
    value: string | null;
    operator: '==' | '!=';
  };
} 