import moment from 'moment';
import { ExecutionLogger } from '../../definitions';
import { Transaction, TransactionSourceType, TransactionType } from '../../domain';
import { FinancialInstitutionsService, FinancialInstitutionTransaction } from '../financial-institutions';
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
  FilterTransactionsInput,
  SyncTransactionsActions,
  SyncWithFinancialInstitutionInput,
  UpdateTransactionInput,
} from './transactions.service.interfaces';
import { DATE_FORMAT, ERRORS_MESSAGES, SYNC_WITH_FINANCIAL_INSTITUTION_STEPS } from './transactions.service.constants';

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

  public async syncWithFinancialInstitution(input: SyncWithFinancialInstitutionInput, logger: ExecutionLogger): Promise<void> {
    const { companyId, financialInstitutionId, fromDate, toDate } = input;
    const logGroup = `${TransactionsService.name}.${this.syncWithFinancialInstitution.name}`;
    logger.startStep(SYNC_WITH_FINANCIAL_INSTITUTION_STEPS.GET_TRANSACTIONS, logGroup);
    const financialInstitutionService = FinancialInstitutionsService.getInstance(financialInstitutionId);
    const [ financialInstitutionTransactions, internalTransactions ] = await Promise.all([
      financialInstitutionService.getTransactions({
        companyId,
        fromDate,
        toDate,
      }, logger),
      this.getResourcesList({
        companyId: [{ value: companyId, operator: '==' }],
        date: [{ value: fromDate, operator: '>' }, { value: toDate, operator: '<=' }],
      }, logger),
    ]).finally(() => logger.endStep(SYNC_WITH_FINANCIAL_INSTITUTION_STEPS.GET_TRANSACTIONS));
    const syncActions = this._getSyncActions(companyId, financialInstitutionId, financialInstitutionTransactions, internalTransactions);
    if (syncActions.createTransactions.length > 0) {
      logger.startStep(SYNC_WITH_FINANCIAL_INSTITUTION_STEPS.CREATE_TRANSACTIONS, logGroup);
      for (const transaction of syncActions.createTransactions) {
        await this.createResource(transaction, logger);
      }
      logger.endStep(SYNC_WITH_FINANCIAL_INSTITUTION_STEPS.CREATE_TRANSACTIONS);
    }
    if (syncActions.updateTransactions.length > 0) {
      logger.startStep(SYNC_WITH_FINANCIAL_INSTITUTION_STEPS.UPDATE_TRANSACTIONS, logGroup);
      for (const { id, data } of syncActions.updateTransactions) {
        await this.updateResource(id, data, logger);
      }
      logger.endStep(SYNC_WITH_FINANCIAL_INSTITUTION_STEPS.UPDATE_TRANSACTIONS);
    }
    if (syncActions.deleteTransactions.length > 0) {
      logger.startStep(SYNC_WITH_FINANCIAL_INSTITUTION_STEPS.DELETE_TRANSACTIONS, logGroup);
      for (const id of syncActions.deleteTransactions) {
        await this.deleteResource(id, logger);
      }
      logger.endStep(SYNC_WITH_FINANCIAL_INSTITUTION_STEPS.DELETE_TRANSACTIONS);
    }
  }

  private _getSyncActions(companyId: string, financialInstitutionId: string, financialInstitutionTransactions: FinancialInstitutionTransaction[], internalTransactions: Transaction[]): SyncTransactionsActions {
    const createTransactions: CreateTransactionInput[] = [];
    const updateTransactions: { id: string; data: UpdateTransactionInput }[] = [];
    const deleteTransactions: string[] = internalTransactions.map((transaction) => transaction.id);
    for (const financialInstitutionTransaction of financialInstitutionTransactions) {
      const internalTransaction = internalTransactions.find((transaction) => transaction.id === financialInstitutionTransaction.id);
      if (internalTransaction) {
        deleteTransactions.splice(deleteTransactions.indexOf(internalTransaction.id), 1);
        const date = moment(financialInstitutionTransaction.createdAt).format(DATE_FORMAT);
        if (date !== internalTransaction.date || financialInstitutionTransaction.amount !== internalTransaction.amount || financialInstitutionTransaction.description !== internalTransaction.description) {
          updateTransactions.push({
            id: internalTransaction.id,
            data: {
              amount: financialInstitutionTransaction.amount,
              date,
              description: financialInstitutionTransaction.description,
            },
          });
        }
      } else {
        createTransactions.push({
          companyId,
          date: moment(financialInstitutionTransaction.createdAt).format(DATE_FORMAT),
          type: TransactionType.DEBIT, // we assume all transactions are debits for now
          amount: financialInstitutionTransaction.amount,
          description: financialInstitutionTransaction.description,
          sourceType: TransactionSourceType.FINANCIAL_INSTITUTION,
          sourceId: financialInstitutionId,
          sourceTransactionId: financialInstitutionTransaction.id,
        });
      }
    }
    return {
      createTransactions,
      updateTransactions,
      deleteTransactions,
    };
  }
  private _isDateValid(date: string): boolean {
    return moment(date, DATE_FORMAT, true).isValid();
  }
} 