import { Transaction } from '../../domain';
import {
  TransactionsRepository,
  TransactionDocument,
  CreateTransactionDocumentInput,
  QueryTransactionsInput,
  UpdateTransactionDocumentInput,
} from '../../repositories';
import { DomainModelService } from '../../utils/services';
import {
  CreateTransactionInput,
  UpdateTransactionInput,
  FilterTransactionsInput,
} from './transactions.service.interfaces';

export class TransactionsService extends DomainModelService<Transaction, TransactionDocument, CreateTransactionInput, CreateTransactionDocumentInput, UpdateTransactionInput, UpdateTransactionDocumentInput, FilterTransactionsInput, QueryTransactionsInput> {
  private static instance: TransactionsService;

  public static getInstance(): TransactionsService {
    if (!this.instance) {
      this.instance = new TransactionsService(TransactionsRepository.getInstance());
    }
    return this.instance;
  }
} 