import { LanguageCode } from '@repo/shared/constants';

import { FilterInput, FilterItem } from '../../../definitions/domain.interfaces';

export interface CreateTransactionCategoryInput {
  name: Record<LanguageCode, string>;
  type: string;
}

export interface UpdateTransactionCategoryInput {
  name?: Record<LanguageCode, string>;
  type?: string;
}

export interface FilterTransactionCategoriesInput extends FilterInput {
  name?: FilterItem<Record<LanguageCode, string>>[];
  type?: FilterItem<string>[];
} 