import { DocumentModel, QueryInput, QueryItem } from '../../definitions/repositories.interfaces';

export interface TransactionDocument extends DocumentModel {
  amount: number;
  companyId: string;
  date: string;
  type: string;
}

export interface CreateTransactionDocumentInput {
  amount: number;
  companyId: string;
  date: string;
  type: string;
}

export interface UpdateTransactionDocumentInput {
  amount?: number;
  companyId?: string;
  date?: string;
  type?: string;
}

export interface QueryTransactionsInput extends QueryInput {
  amount?: QueryItem<number>[];
  companyId?: QueryItem<string>[];
  date?: QueryItem<string>[];
  type?: QueryItem<string>[];
}
