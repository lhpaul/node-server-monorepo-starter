import { TransactionCategoryType } from '@repo/shared/domain';

export interface TransactionCategoryResource {
  id: string;
  name: string;
  type: TransactionCategoryType;
  createdAt: string;
  updatedAt: string;
}