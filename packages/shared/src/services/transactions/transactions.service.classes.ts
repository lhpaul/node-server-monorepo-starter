import { Transaction, TransactionSourceType, TransactionType } from '../../domain/models/transaction.model';
import { TransactionDocument } from '../../repositories/transactions/transactions.repository.interfaces';
import { ERRORS_MESSAGES } from './transactions.service.constants';

export class TransactionDocumentToModelParser extends Transaction {
  constructor(transactionDocument: TransactionDocument) {
    if (!Object.values(TransactionType).includes(transactionDocument.type as TransactionType)) {
      throw new Error(ERRORS_MESSAGES.INVALID_TRANSACTION_TYPE(transactionDocument.type, transactionDocument.id));
    }
    if (!Object.values(TransactionSourceType).includes(transactionDocument.sourceType as TransactionSourceType)) {
      throw new Error(ERRORS_MESSAGES.INVALID_TRANSACTION_SOURCE_TYPE(transactionDocument.sourceType, transactionDocument.id));
    }
    super({
      ...transactionDocument,
      type: transactionDocument.type as TransactionType,
      sourceType: transactionDocument.sourceType as TransactionSourceType,
    });
  }
}