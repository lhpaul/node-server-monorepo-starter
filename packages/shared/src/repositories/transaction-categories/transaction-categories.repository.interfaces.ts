import { DocumentModel, QueryInput, QueryItem } from '../../definitions/repositories.interfaces';
import { TransactionCategoryType } from '../../domain/models/transaction-category.model';

export interface TransactionCategoryDocument extends DocumentModel {
  name: string;
  type: TransactionCategoryType;
}

export interface CreateTransactionCategoryDocumentInput {
  name: string;
  type: TransactionCategoryType;
}

export interface UpdateTransactionCategoryDocumentInput {
  name?: string;
  type?: TransactionCategoryType;
}

export interface QueryTransactionCategoriesInput extends QueryInput {
  name?: QueryItem<string>[];
  type?: QueryItem<TransactionCategoryType>[];
} 