import { FirestoreCollectionRepository } from '@repo/shared/utils';

import { COLLECTION_PATH } from './transaction-create-requests.repository.constants';
import {
  TransactionCreateRequestDocument,
  CreateTransactionCreateRequestDocumentInput,
  UpdateTransactionCreateRequestDocumentInput,
  QueryTransactionCreateRequestsInput,
} from './transaction-create-requests.repository.interfaces';

export type {
  TransactionCreateRequestDocument,
  CreateTransactionCreateRequestDocumentInput,
  UpdateTransactionCreateRequestDocumentInput,
  QueryTransactionCreateRequestsInput,
};

export class TransactionCreateRequestsRepository extends FirestoreCollectionRepository<TransactionCreateRequestDocument, CreateTransactionCreateRequestDocumentInput, UpdateTransactionCreateRequestDocumentInput, QueryTransactionCreateRequestsInput> {
  static readonly COLLECTION_PATH = COLLECTION_PATH;
  private static instance: TransactionCreateRequestsRepository;
  
  public static getInstance(): TransactionCreateRequestsRepository {
    if (!TransactionCreateRequestsRepository.instance) {
      TransactionCreateRequestsRepository.instance = new TransactionCreateRequestsRepository();
    }
    return TransactionCreateRequestsRepository.instance;
  }
  
  constructor() {
    super({
      collectionPath: COLLECTION_PATH
    });
  }
} 