import { LanguageCode } from '@repo/shared/constants';

import { DocumentModel, QueryInput, QueryItem } from '../../definitions/repositories.interfaces';
import { TransactionCategoryType } from '../../domain/models/transaction-category.model';

export interface TransactionCategoryDocument extends DocumentModel {
  name: Record<LanguageCode, string>;
  type: TransactionCategoryType;
}

export interface CreateTransactionCategoryDocumentInput {
  name: Record<LanguageCode, string>;
  type: TransactionCategoryType;
}

export interface UpdateTransactionCategoryDocumentInput {
  name?: Record<LanguageCode, string>;
  type?: TransactionCategoryType;
}

// TODO: add name filtering
export interface QueryTransactionCategoriesInput extends QueryInput {
  type?: QueryItem<TransactionCategoryType>[];
} 