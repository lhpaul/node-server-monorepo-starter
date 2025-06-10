import { FirestoreCollectionRepository } from '../../utils/repositories';
import { COLLECTION_PATH } from './transactions.repository.constants';
import {
  TransactionDocument,
  CreateTransactionDocumentInput,
  UpdateTransactionDocumentInput,
  QueryTransactionsInput,
} from './transactions.repository.interfaces';

export class TransactionsRepository extends FirestoreCollectionRepository<TransactionDocument, CreateTransactionDocumentInput, UpdateTransactionDocumentInput, QueryTransactionsInput> {
  private static instance: TransactionsRepository;
  public static getInstance(): TransactionsRepository {
    if (!TransactionsRepository.instance) {
      TransactionsRepository.instance = new TransactionsRepository();
    }
    return TransactionsRepository.instance;
  }
  constructor() {
    super({
      collectionPath: COLLECTION_PATH
    });
  }
}
