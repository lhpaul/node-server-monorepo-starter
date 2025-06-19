import { FirestoreCollectionRepository } from '../../utils/repositories';
import { COLLECTION_PATH } from './transaction-update-requests.repository.constants';
import {
  TransactionUpdateRequestDocument,
  CreateTransactionUpdateRequestDocumentInput,
  UpdateTransactionUpdateRequestDocumentInput,
  QueryTransactionUpdateRequestsInput,
} from './transaction-update-requests.repository.interfaces';

export class TransactionUpdateRequestsRepository extends FirestoreCollectionRepository<TransactionUpdateRequestDocument, CreateTransactionUpdateRequestDocumentInput, UpdateTransactionUpdateRequestDocumentInput, QueryTransactionUpdateRequestsInput> {
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