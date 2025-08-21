import { TransactionCategory } from '@repo/shared/domain';

import { TransactionCategoryResource } from './transaction-categories.endpoint.interfaces';

export function parseTransactionCategoryToResource(transactionCategory: TransactionCategory): TransactionCategoryResource {
  return {
    id: transactionCategory.id,
    name: transactionCategory.name,
    type: transactionCategory.type,
    createdAt: transactionCategory.createdAt.toISOString(),
    updatedAt: transactionCategory.updatedAt.toISOString(),
  };
}