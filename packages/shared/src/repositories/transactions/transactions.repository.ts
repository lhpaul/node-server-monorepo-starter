import { Transaction } from '../../domain/models/transaction.model';
import { FirestoreCollectionRepository } from '../../utils/firestore/firestore-collection-repository.class';
import { COLLECTION_PATH } from './transactions.repository.constants';
import { CreateTransactionInput, GetTransactionsQuery, UpdateTransactionInput } from './transactions.repository.interfaces';

export class TransactionsRepository extends FirestoreCollectionRepository<Transaction, CreateTransactionInput, UpdateTransactionInput, GetTransactionsQuery> {
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