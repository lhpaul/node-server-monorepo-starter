import { FirestoreCollectionRepository } from '@repo/shared/utils';

import { COLLECTION_PATH } from './transaction-update-requests.repository.constants';
import {
  TransactionUpdateRequestDocument,
  CreateTransactionUpdateRequestDocumentInput,
  UpdateTransactionUpdateRequestDocumentInput,
  QueryTransactionUpdateRequestsInput,
} from './transaction-update-requests.repository.interfaces';

export type {
  TransactionUpdateRequestDocument,
  CreateTransactionUpdateRequestDocumentInput,
  UpdateTransactionUpdateRequestDocumentInput,
  QueryTransactionUpdateRequestsInput,
};

export class TransactionUpdateRequestsRepository extends FirestoreCollectionRepository<TransactionUpdateRequestDocument, CreateTransactionUpdateRequestDocumentInput, UpdateTransactionUpdateRequestDocumentInput, QueryTransactionUpdateRequestsInput> {
  static readonly COLLECTION_PATH = COLLECTION_PATH;
  private static instance: TransactionUpdateRequestsRepository;
  
  public static getInstance(): TransactionUpdateRequestsRepository {
    if (!TransactionUpdateRequestsRepository.instance) {
      TransactionUpdateRequestsRepository.instance = new TransactionUpdateRequestsRepository();
    }
    return TransactionUpdateRequestsRepository.instance;
  }
  
  constructor() {
    super({
      collectionPath: COLLECTION_PATH
    });
  }
} 