import { LanguageCode } from '@repo/shared/constants';
import { TransactionCategoryType } from '@repo/shared/domain';

export interface TransactionCategoryResource {
  id: string;
  name: Record<LanguageCode, string>;
  type: TransactionCategoryType;
  createdAt: string;
  updatedAt: string;
}