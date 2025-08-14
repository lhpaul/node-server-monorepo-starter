// External dependencies (alphabetical, @ first)
import moment from 'moment';

// Internal modules (farthest path first, then alphabetical)
import { ExecutionLogger } from '../../../definitions';
import { Transaction, TransactionSourceType, TransactionType } from '../..';
import {
  TransactionsRepository,
  TransactionDocument,
  CreateTransactionDocumentInput,
  QueryTransactionsInput,
  UpdateTransactionDocumentInput,
} from '../../../repositories';
import { DomainModelService, DomainModelServiceError, DomainModelServiceErrorCode } from '../../../utils/services';
import { FinancialInstitutionService, FinancialInstitutionTransaction } from '../financial-institution';

// Local imports (alphabetical)
import { TransactionDocumentToModelParser } from './transactions.service.classes';
import {
  DATE_FORMAT,
  ERRORS_MESSAGES,
  SYNC_WITH_FINANCIAL_INSTITUTION_LOGS,
  SYNC_WITH_FINANCIAL_INSTITUTION_STEPS,
} from './transactions.service.constants';
import {
  CreateTransactionInput,
  FilterTransactionsInput,
  SyncTransactionsActions,
  SyncWithFinancialInstitutionInput,
  UpdateTransactionInput,
} from './transactions.service.interfaces';
import { firestore } from 'firebase-admin';
import { MAX_WRITE_BATCH_SIZE, WRITES_PER_CREATE_DOCUMENT, WRITES_PER_DELETE_DOCUMENT, WRITES_PER_UPDATE_DOCUMENT } from '../../../constants';

export class TransactionsService extends DomainModelService<Transaction, TransactionDocument, CreateTransactionInput, CreateTransactionDocumentInput, UpdateTransactionInput, UpdateTransactionDocumentInput, FilterTransactionsInput, QueryTransactionsInput> {
  private static instance: TransactionsService;

  public static getInstance(): TransactionsService {
    if (!this.instance) {
      this.instance = new TransactionsService(TransactionsRepository.getInstance(), TransactionDocumentToModelParser);
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

  /**
   * Sync transactions with the financial institution
   * @param input - The {@link SyncWithFinancialInstitutionInput} for the sync with financial institution operation
   * @param logger - The {@link ExecutionLogger} to use for logging
   */
  public async syncWithFinancialInstitution(input: SyncWithFinancialInstitutionInput, logger: ExecutionLogger): Promise<void> {
    const { companyId, financialInstitutionId, fromDate, toDate } = input;
    const logGroup = `${TransactionsService.name}.${this.syncWithFinancialInstitution.name}`;

    logger.startStep(SYNC_WITH_FINANCIAL_INSTITUTION_STEPS.GET_TRANSACTIONS, logGroup);
    const financialInstitutionService = FinancialInstitutionService.getInstance(financialInstitutionId);
    const [ financialInstitutionTransactions, internalTransactions ] = await Promise.all([
      financialInstitutionService.getTransactions({
        companyId,
        fromDate,
        toDate,
      }, logger),
      this.getResourcesList({
        companyId: [{ value: companyId, operator: '==' }],
        sourceType: [{ value: TransactionSourceType.FINANCIAL_INSTITUTION, operator: '==' }],
        sourceId: [{ value: financialInstitutionId, operator: '==' }],
        date: [{ value: fromDate, operator: '>' }, { value: toDate, operator: '<=' }],
      }, logger),
    ]).finally(() => logger.endStep(SYNC_WITH_FINANCIAL_INSTITUTION_STEPS.GET_TRANSACTIONS));
    const syncActions = this._getSyncActions(companyId, financialInstitutionId, financialInstitutionTransactions, internalTransactions);
    logger.info({
      logId: SYNC_WITH_FINANCIAL_INSTITUTION_LOGS.SYNC_ACTIONS.logId,
      createTransactions: syncActions.createTransactions.length,
      updateTransactions: syncActions.updateTransactions.length,
      deleteTransactions: syncActions.deleteTransactions.length,
    }, SYNC_WITH_FINANCIAL_INSTITUTION_LOGS.SYNC_ACTIONS.logMessage);
    let writes = 0;
    let batch = firestore().batch();
    if (syncActions.createTransactions.length > 0) {
      logger.startStep(SYNC_WITH_FINANCIAL_INSTITUTION_STEPS.CREATE_TRANSACTIONS, logGroup);
      for (const transaction of syncActions.createTransactions) {
        this.repository.createDocumentSync(transaction, batch, logger);
        writes += WRITES_PER_CREATE_DOCUMENT;
        if (writes % (MAX_WRITE_BATCH_SIZE - WRITES_PER_CREATE_DOCUMENT) === 0) {
          logger.startStep(SYNC_WITH_FINANCIAL_INSTITUTION_STEPS.CREATE_TRANSACTIONS_PARTIAL_COMMIT, logGroup);
          await batch.commit()
          .finally(() => logger.endStep(SYNC_WITH_FINANCIAL_INSTITUTION_STEPS.CREATE_TRANSACTIONS_PARTIAL_COMMIT));
          batch = firestore().batch();
          writes = 0;
        }
      }
      if (writes % (MAX_WRITE_BATCH_SIZE - WRITES_PER_CREATE_DOCUMENT) !== 0) {
        logger.startStep(SYNC_WITH_FINANCIAL_INSTITUTION_STEPS.CREATE_TRANSACTIONS_FINAL_COMMIT, logGroup);
        await batch.commit()
        .finally(() => logger.endStep(SYNC_WITH_FINANCIAL_INSTITUTION_STEPS.CREATE_TRANSACTIONS_FINAL_COMMIT));
      }
      logger.endStep(SYNC_WITH_FINANCIAL_INSTITUTION_STEPS.CREATE_TRANSACTIONS);
    }
    if (syncActions.updateTransactions.length > 0) {
      writes = 0;
      batch = firestore().batch();
      logger.startStep(SYNC_WITH_FINANCIAL_INSTITUTION_STEPS.UPDATE_TRANSACTIONS, logGroup);
      for (const { id, data } of syncActions.updateTransactions) {
        this.repository.updateDocumentSync(id, data, batch, logger);
        writes += WRITES_PER_UPDATE_DOCUMENT;
        if (writes % (MAX_WRITE_BATCH_SIZE - WRITES_PER_UPDATE_DOCUMENT) === 0) {
          logger.startStep(SYNC_WITH_FINANCIAL_INSTITUTION_STEPS.UPDATE_TRANSACTIONS_PARTIAL_COMMIT, logGroup);
          await batch.commit()
          .finally(() => logger.endStep(SYNC_WITH_FINANCIAL_INSTITUTION_STEPS.UPDATE_TRANSACTIONS_PARTIAL_COMMIT));
          batch = firestore().batch();
          writes = 0;
        }
      }
      if (writes % (MAX_WRITE_BATCH_SIZE - WRITES_PER_UPDATE_DOCUMENT) !== 0) {
        logger.startStep(SYNC_WITH_FINANCIAL_INSTITUTION_STEPS.UPDATE_TRANSACTIONS_FINAL_COMMIT, logGroup);
        await batch.commit()
        .finally(() => logger.endStep(SYNC_WITH_FINANCIAL_INSTITUTION_STEPS.UPDATE_TRANSACTIONS_FINAL_COMMIT));
      }
      logger.endStep(SYNC_WITH_FINANCIAL_INSTITUTION_STEPS.UPDATE_TRANSACTIONS);
    }
    if (syncActions.deleteTransactions.length > 0) {
      writes = 0;
      batch = firestore().batch();
      logger.startStep(SYNC_WITH_FINANCIAL_INSTITUTION_STEPS.DELETE_TRANSACTIONS, logGroup);
      for (const id of syncActions.deleteTransactions) {
        this.repository.deleteDocumentSync(id, batch, logger);
        writes += WRITES_PER_DELETE_DOCUMENT;
        if (writes % (MAX_WRITE_BATCH_SIZE - WRITES_PER_DELETE_DOCUMENT) === 0) {
          logger.startStep(SYNC_WITH_FINANCIAL_INSTITUTION_STEPS.DELETE_TRANSACTIONS_PARTIAL_COMMIT, logGroup);
          await batch.commit()
          .finally(() => logger.endStep(SYNC_WITH_FINANCIAL_INSTITUTION_STEPS.DELETE_TRANSACTIONS_PARTIAL_COMMIT));
          batch = firestore().batch();
          writes = 0;
        }
      }
      if (writes % (MAX_WRITE_BATCH_SIZE - WRITES_PER_DELETE_DOCUMENT) !== 0) {
        logger.startStep(SYNC_WITH_FINANCIAL_INSTITUTION_STEPS.DELETE_TRANSACTIONS_FINAL_COMMIT, logGroup);
        await batch.commit()
        .finally(() => logger.endStep(SYNC_WITH_FINANCIAL_INSTITUTION_STEPS.DELETE_TRANSACTIONS_FINAL_COMMIT));
      }
      logger.endStep(SYNC_WITH_FINANCIAL_INSTITUTION_STEPS.DELETE_TRANSACTIONS);
    }
  }

  private _getSyncActions(companyId: string, financialInstitutionId: string, financialInstitutionTransactions: FinancialInstitutionTransaction[], internalTransactions: Transaction[]): SyncTransactionsActions {
    const createTransactions: CreateTransactionInput[] = [];
    const updateTransactions: { id: string; data: UpdateTransactionInput }[] = [];
    const deleteTransactions: string[] = internalTransactions.map((transaction) => transaction.id);
    for (const financialInstitutionTransaction of financialInstitutionTransactions) {
      const internalTransaction = internalTransactions.find((transaction) => transaction.sourceTransactionId === financialInstitutionTransaction.id);
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