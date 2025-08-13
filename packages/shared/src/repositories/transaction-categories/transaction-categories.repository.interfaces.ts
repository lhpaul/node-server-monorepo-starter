import { DocumentModel, QueryInput, QueryItem } from '../../definitions/repositories.interfaces';

export interface TransactionCategoryDocument extends DocumentModel {
  name: Record<string, string>;
  type: string;
}

export interface CreateTransactionCategoryDocumentInput {
  name: Record<string, string>;
  type: string;
}

export interface UpdateTransactionCategoryDocumentInput {
  name?: Record<string, string>;
  type?: string;
}

// TODO: add name filtering
export interface QueryTransactionCategoriesInput extends QueryInput {
  type?: QueryItem<string>[];
} 