import { InMemoryRepository } from '../../utils/repositories/in-memory-repository.class';
import { MOCK_TRANSACTION_CATEGORIES } from './transaction-categories.repository.constants';
import {
  TransactionCategoryDocument,
  CreateTransactionCategoryDocumentInput,
  QueryTransactionCategoriesInput,
  UpdateTransactionCategoryDocumentInput,
} from './transaction-categories.repository.interfaces';

export class TransactionCategoriesRepository extends InMemoryRepository<TransactionCategoryDocument, CreateTransactionCategoryDocumentInput, UpdateTransactionCategoryDocumentInput, QueryTransactionCategoriesInput> {
  private static instance: TransactionCategoriesRepository;

  public static getInstance(): TransactionCategoriesRepository {
    if (!TransactionCategoriesRepository.instance) {
      TransactionCategoriesRepository.instance = new TransactionCategoriesRepository(MOCK_TRANSACTION_CATEGORIES);
    }
    return TransactionCategoriesRepository.instance;
  }
} 