import moment from 'moment';
import { ExecutionLogger } from '../../definitions';
import { Transaction } from '../../domain';
import {
  TransactionsRepository,
  TransactionDocument,
  CreateTransactionDocumentInput,
  QueryTransactionsInput,
  UpdateTransactionDocumentInput,
} from '../../repositories';
import { DomainModelService, DomainModelServiceError, DomainModelServiceErrorCode } from '../../utils/services';
import {
  CreateTransactionInput,
  UpdateTransactionInput,
  FilterTransactionsInput,
} from './transactions.service.interfaces';
import { DATE_FORMAT, ERRORS_MESSAGES } from './transactions.service.constants';

export class TransactionsService extends DomainModelService<Transaction, TransactionDocument, CreateTransactionInput, CreateTransactionDocumentInput, UpdateTransactionInput, UpdateTransactionDocumentInput, FilterTransactionsInput, QueryTransactionsInput> {
  private static instance: TransactionsService;

  public static getInstance(): TransactionsService {
    if (!this.instance) {
      this.instance = new TransactionsService(TransactionsRepository.getInstance());
    }
    return this.instance;
  }

  public createResource(data: CreateTransactionInput, logger: ExecutionLogger): Promise<string> {
    if (!this._isDateValid(data.date)) {
      throw new DomainModelServiceError({
        code: DomainModelServiceErrorCode.INVALID_INPUT,
        message: ERRORS_MESSAGES.INVALID_DATE_FORMAT
      });
    }
    return super.createResource(data, logger);
  }

  public updateResource(id: string, data: UpdateTransactionInput, logger: ExecutionLogger): Promise<void> {
    if (data.date && !this._isDateValid(data.date)) {
      throw new DomainModelServiceError({
        code: DomainModelServiceErrorCode.INVALID_INPUT,
        message: ERRORS_MESSAGES.INVALID_DATE_FORMAT
      });
    }
    return super.updateResource(id, data, logger);
  }

  private _isDateValid(date: string): boolean {
    return moment(date, DATE_FORMAT, true).isValid();
  }
} 