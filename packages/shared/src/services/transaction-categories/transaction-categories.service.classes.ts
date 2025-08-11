import { TransactionCategory, TransactionCategoryType } from '../../domain/entities/transaction-category.model';
import { TransactionCategoryDocument } from '../../repositories/transaction-categories/transaction-categories.repository.interfaces';
import { ERRORS_MESSAGES } from './transaction-categories.service.constants';

export class TransactionCategoryDocumentToModelParser extends TransactionCategory {
  constructor(transactionCategoryDocument: TransactionCategoryDocument) {
    if (!Object.values(TransactionCategoryType).includes(transactionCategoryDocument.type as TransactionCategoryType)) {
      throw new Error(ERRORS_MESSAGES.INVALID_TRANSACTION_CATEGORY_TYPE(transactionCategoryDocument.type, transactionCategoryDocument.id));
    }
    super({
      ...transactionCategoryDocument,
      type: transactionCategoryDocument.type as TransactionCategoryType,
    });
  }
}