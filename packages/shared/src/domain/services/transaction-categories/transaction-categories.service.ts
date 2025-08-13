// Internal modules (farthest path first, then alphabetical)
import { TransactionCategory } from '../..';
import {
  TransactionCategoriesRepository,
  TransactionCategoryDocument,
  CreateTransactionCategoryDocumentInput,
  QueryTransactionCategoriesInput,
  UpdateTransactionCategoryDocumentInput,
} from '../../../repositories';
import { DomainModelService } from '../../../utils/services';

// Local imports (alphabetical)
import { TransactionCategoryDocumentToModelParser } from './transaction-categories.service.classes';
import {
  CreateTransactionCategoryInput,
  FilterTransactionCategoriesInput,
  UpdateTransactionCategoryInput,
} from './transaction-categories.service.interfaces';


export class TransactionCategoriesService extends DomainModelService<TransactionCategory, TransactionCategoryDocument, CreateTransactionCategoryInput, CreateTransactionCategoryDocumentInput, UpdateTransactionCategoryInput, UpdateTransactionCategoryDocumentInput, FilterTransactionCategoriesInput, QueryTransactionCategoriesInput> {
  private static instance: TransactionCategoriesService;

  public static getInstance(): TransactionCategoriesService {
    if (!this.instance) {
      this.instance = new TransactionCategoriesService(TransactionCategoriesRepository.getInstance(), TransactionCategoryDocumentToModelParser);
    }
    return this.instance;
  }
} 