export interface UpdateTransactionCategoryBody {
  name?: string;
  type?: 'income' | 'expense';
}

export interface UpdateTransactionCategoryParams {
  id: string;
} 