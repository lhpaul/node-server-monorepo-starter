import { FilterInput, FilterItem } from '../../definitions/domain.interfaces';

export interface CreateTransactionCategoryInput {
  name: string;
  type: string;
}

export interface UpdateTransactionCategoryInput {
  name?: string;
  type?: string;
}

export interface FilterTransactionCategoriesInput extends FilterInput {
  name?: FilterItem<string>[];
  type?: FilterItem<string>[];
} 