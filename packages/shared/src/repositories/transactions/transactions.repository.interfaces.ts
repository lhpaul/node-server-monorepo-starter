import { DocumentModel, QueryInput, QueryItem } from '../../definitions/repositories.interfaces';

export interface TransactionDocument extends DocumentModel {
  amount: number;
  categoryId: string | null;
  companyId: string;
  date: string;
  description: string;
  id: string;
  sourceId: string;
  sourceTransactionId: string;
  sourceType: string;
  type: string;
}

export interface CreateTransactionDocumentInput {
  amount: number;
  companyId: string;
  date: string;
  description: string;
  sourceId: string;
  sourceTransactionId: string;
  sourceType: string;
  type: string;
}

export interface UpdateTransactionDocumentInput {
  amount?: number;
  categoryId?: string | null;
  companyId?: string;
  date?: string;
  description?: string;
  sourceId?: string;
  sourceTransactionId?: string;
  sourceType?: string;
  type?: string;
}

export interface QueryTransactionsInput extends QueryInput {
  amount?: QueryItem<number>[];
  categoryId?: QueryItem<string | null>[];
  companyId?: QueryItem<string>[];
  date?: QueryItem<string>[];
  description?: QueryItem<string>[];
  sourceId?: QueryItem<string>[];
  sourceTransactionId?: QueryItem<string>[];
  sourceType?: QueryItem<string>[];
  type?: QueryItem<string>[];
}
