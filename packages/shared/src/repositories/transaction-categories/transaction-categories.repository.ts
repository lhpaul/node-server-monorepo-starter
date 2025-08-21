import { FirestoreCollectionRepository } from '../../utils/repositories';
import { COLLECTION_PATH } from './transaction-categories.repository.constants';
import {
  TransactionCategoryDocument,
  CreateTransactionCategoryDocumentInput,
  QueryTransactionCategoriesInput,
  UpdateTransactionCategoryDocumentInput,
} from './transaction-categories.repository.interfaces';

export class TransactionCategoriesRepository extends FirestoreCollectionRepository<TransactionCategoryDocument, CreateTransactionCategoryDocumentInput, UpdateTransactionCategoryDocumentInput, QueryTransactionCategoriesInput> {
  static readonly COLLECTION_PATH = COLLECTION_PATH;
  private static instance: TransactionCategoriesRepository;

  public static getInstance(): TransactionCategoriesRepository {
    if (!TransactionCategoriesRepository.instance) {
      TransactionCategoriesRepository.instance = new TransactionCategoriesRepository();
    }
    return TransactionCategoriesRepository.instance;
  }
  constructor() {
    super({
      collectionPath: COLLECTION_PATH
    });
  }
} 