import { TransactionCategoryType } from '../../domain/models/transaction-category.model';
import { TransactionCategoryDocument } from './transaction-categories.repository.interfaces';

export const MOCK_TRANSACTION_CATEGORIES: TransactionCategoryDocument[] = [
  { createdAt: new Date(), id: '0', name: 'Salary', type: TransactionCategoryType.INCOME, updatedAt: new Date() },
  { createdAt: new Date(), id: '1', name: 'Freelance', type: TransactionCategoryType.INCOME, updatedAt: new Date() },
  { createdAt: new Date(), id: '2', name: 'Investment Returns', type: TransactionCategoryType.INCOME, updatedAt: new Date() },
  { createdAt: new Date(), id: '3', name: 'Groceries', type: TransactionCategoryType.EXPENSE, updatedAt: new Date() },
  { createdAt: new Date(), id: '4', name: 'Transportation', type: TransactionCategoryType.EXPENSE, updatedAt: new Date() },
  { createdAt: new Date(), id: '5', name: 'Entertainment', type: TransactionCategoryType.EXPENSE, updatedAt: new Date() },
  { createdAt: new Date(), id: '6', name: 'Utilities', type: TransactionCategoryType.EXPENSE, updatedAt: new Date() },
  { createdAt: new Date(), id: '7', name: 'Rent', type: TransactionCategoryType.EXPENSE, updatedAt: new Date() },
]; 