// Internal modules (farthest path first, then alphabetical)
import { ExecutionLogger } from '../../../../definitions';
import { TransactionsRepository } from '../../../../repositories';
import { DomainModelServiceError, DomainModelServiceErrorCode } from '../../../../utils';
import { Transaction, TransactionSourceType, TransactionType } from '../../../entities';

// Local imports (alphabetical)
import { FinancialInstitutionService, FinancialInstitutionTransaction } from '../../financial-institution';
import { TransactionsService } from '../transactions.service';
import { ERRORS_MESSAGES, SYNC_WITH_FINANCIAL_INSTITUTION_LOGS, SYNC_WITH_FINANCIAL_INSTITUTION_STEPS } from '../transactions.service.constants';

jest.mock('../../../../repositories');
jest.mock('../../financial-institution');
jest.mock('firebase-admin', () => ({
  firestore: () => ({
    batch: jest.fn().mockReturnValue({
      commit: jest.fn().mockResolvedValue(undefined),
    }),
  }),
}));

describe(TransactionsService.name, () => {
  let mockTransactionsRepository: jest.Mocked<TransactionsRepository>;
  let mockFinancialInstitutionService: jest.Mocked<FinancialInstitutionService>;
  let mockLogger: jest.Mocked<ExecutionLogger>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockTransactionsRepository = {
      createDocument: jest.fn(),
      createDocumentSync: jest.fn(),
      updateDocument: jest.fn(),
      updateDocumentSync: jest.fn(),
      deleteDocument: jest.fn(),
      deleteDocumentSync: jest.fn(),
      getDocumentsList: jest.fn(),
    } as unknown as jest.Mocked<TransactionsRepository>;

    mockFinancialInstitutionService = {
      getTransactions: jest.fn(),
    } as unknown as jest.Mocked<FinancialInstitutionService>;

    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      startStep: jest.fn(),
      endStep: jest.fn(),
      warn: jest.fn(),
    } as unknown as jest.Mocked<ExecutionLogger>;

    (TransactionsRepository.getInstance as jest.Mock).mockReturnValue(mockTransactionsRepository);
    (FinancialInstitutionService.getInstance as jest.Mock).mockReturnValue(mockFinancialInstitutionService);

    (TransactionsService as any).instance = undefined;
  });

  describe(TransactionsService.getInstance.name, () => {
    it('should create a new instance if one does not exist', () => {
      const service = TransactionsService.getInstance();
      
      expect(service).toBeInstanceOf(TransactionsService);
      expect(TransactionsRepository.getInstance).toHaveBeenCalledTimes(1);
    });

    it('should return the same instance on subsequent calls', () => {
      const firstInstance = TransactionsService.getInstance();
      const secondInstance = TransactionsService.getInstance();
      
      expect(firstInstance).toBe(secondInstance);
      expect(TransactionsRepository.getInstance).toHaveBeenCalledTimes(1);
    });
  });

  describe(TransactionsService.prototype.createResource.name, () => {
    const newDocumentId = '123';
    const baseCreateData = {
      amount: 100,
      categoryId: 'category-123',
      companyId: '123',
      description: 'Transaction description',
      sourceType: TransactionSourceType.USER,
      sourceId: 'user-123',
      sourceTransactionId: 'transaction-123',
      type: TransactionType.CREDIT,
    };
    let service: TransactionsService;

    beforeEach(() => {
      service = TransactionsService.getInstance();
    });

    it('should throw an error if the date is invalid', async () => {
      const date = '2021-13-01';
      try {
        await service.createResource({ ...baseCreateData, date }, {} as ExecutionLogger);
        expect(true).toBe(false);
      } catch (error: any) {
        expect(error).toBeInstanceOf(DomainModelServiceError);
        expect(error.code).toBe(DomainModelServiceErrorCode.INVALID_INPUT);
        expect(error.message).toBe(ERRORS_MESSAGES.INVALID_DATE_FORMAT);
      }
    });

    it('should create a transaction if the date is valid', async () => {
      const date = '2021-01-01';
      
      (mockTransactionsRepository.createDocument as jest.Mock).mockResolvedValueOnce(newDocumentId);
      const result = await service.createResource({ ...baseCreateData, date }, {} as ExecutionLogger);
      expect(result).toBe(newDocumentId);
    });
  });

  describe(TransactionsService.prototype.updateResource.name, () => {
    let service: TransactionsService;
    const documentId = '123';
    const baseUpdateData = {
      amount: 100,
      categoryId: 'category-123',
      companyId: '123',
      description: 'Transaction description',
      sourceType: TransactionSourceType.USER,
      sourceId: 'user-123',
      sourceTransactionId: 'transaction-123',
      type: TransactionType.CREDIT,
    };

    beforeEach(() => {
      service = TransactionsService.getInstance();
    });

    it('should throw an error if the date is invalid', async () => {
      const date = '2021-13-01';
      try {
        await service.updateResource(documentId, { date }, {} as ExecutionLogger);
        expect(true).toBe(false);
      } catch (error: any) {
        expect(error).toBeInstanceOf(DomainModelServiceError);
        expect(error.code).toBe(DomainModelServiceErrorCode.INVALID_INPUT);
        expect(error.message).toBe(ERRORS_MESSAGES.INVALID_DATE_FORMAT);
      }
    });

    it('should update a transaction if the date is valid', async () => {
      const date = '2021-01-01';
      const updateData = { ...baseUpdateData, date };
      (mockTransactionsRepository.updateDocument as jest.Mock).mockResolvedValueOnce(undefined);
      await service.updateResource(documentId, updateData, {} as ExecutionLogger);
      expect(mockTransactionsRepository.updateDocument).toHaveBeenCalledWith(documentId, updateData, {} as ExecutionLogger);
    });

    it('should update a transaction if the date is not provided', async () => {
      (mockTransactionsRepository.updateDocument as jest.Mock).mockResolvedValueOnce(undefined);
      await service.updateResource(documentId, baseUpdateData, {} as ExecutionLogger);
      expect(mockTransactionsRepository.updateDocument).toHaveBeenCalledWith(documentId, baseUpdateData, {} as ExecutionLogger);
    });
  });

  describe(TransactionsService.prototype.syncWithFinancialInstitution.name, () => {
    let service: TransactionsService;
    const companyId = 'company-123';
    const financialInstitutionId = 'fi-123';
    const fromDate = '2021-01-01';
    const toDate = '2021-01-31';
    const syncInput = {
      companyId,
      financialInstitutionId,
      fromDate,
      toDate,
    };

    const mockFinancialInstitutionTransactions: FinancialInstitutionTransaction[] = [
      {
        id: 'fi-tx-1',
        amount: 100,
        createdAt: '2021-01-15T10:00:00Z',
        description: 'Transaction 1',
        updatedAt: '2021-01-15T10:00:00Z',
      },
      {
        id: 'fi-tx-2',
        amount: 200,
        createdAt: '2021-01-20T10:00:00Z',
        description: 'Transaction 2',
        updatedAt: '2021-01-20T10:00:00Z',
      },
    ];

    const mockInternalTransactions: Transaction[] = [
      {
        id: 'internal-tx-1',
        amount: 100,
        categoryId: 'cat-1',
        companyId,
        date: '2021-01-15',
        description: 'Transaction 1',
        sourceType: TransactionSourceType.FINANCIAL_INSTITUTION,
        sourceId: financialInstitutionId,
        sourceTransactionId: 'fi-tx-1',
        type: TransactionType.DEBIT,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'internal-tx-2',
        amount: 150, // Different amount
        categoryId: 'cat-2',
        companyId,
        date: '2021-01-20',
        description: 'Transaction 2 Updated', // Different description
        sourceType: TransactionSourceType.FINANCIAL_INSTITUTION,
        sourceId: financialInstitutionId,
        sourceTransactionId: 'fi-tx-2',
        type: TransactionType.DEBIT,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'internal-tx-3',
        amount: 300,
        categoryId: 'cat-3',
        companyId,
        date: '2021-01-25',
        description: 'Transaction to be deleted',
        sourceType: TransactionSourceType.FINANCIAL_INSTITUTION,
        sourceId: financialInstitutionId,
        sourceTransactionId: 'fi-tx-3', // This doesn't exist in FI transactions
        type: TransactionType.DEBIT,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    beforeEach(() => {
      service = TransactionsService.getInstance();
      (mockTransactionsRepository.getDocumentsList as jest.Mock).mockResolvedValue(mockInternalTransactions);
      (mockFinancialInstitutionService.getTransactions as jest.Mock).mockResolvedValue(mockFinancialInstitutionTransactions);
    });

    it('should sync transactions with financial institution - create, update, and delete', async () => {
      await service.syncWithFinancialInstitution(syncInput, mockLogger);

      // Verify getTransactions was called
      expect(mockFinancialInstitutionService.getTransactions).toHaveBeenCalledWith({
        companyId,
        fromDate,
        toDate,
      }, mockLogger);

      // Verify getResourcesList was called
      expect(mockTransactionsRepository.getDocumentsList).toHaveBeenCalledWith({
        companyId: [{ value: companyId, operator: '==' }],
        sourceType: [{ value: TransactionSourceType.FINANCIAL_INSTITUTION, operator: '==' }],
        sourceId: [{ value: financialInstitutionId, operator: '==' }],
        date: [{ value: fromDate, operator: '>' }, { value: toDate, operator: '<=' }],
      }, mockLogger);

      // Verify logging
      expect(mockLogger.startStep).toHaveBeenCalledWith(SYNC_WITH_FINANCIAL_INSTITUTION_STEPS.GET_TRANSACTIONS, 'TransactionsService.syncWithFinancialInstitution');
      expect(mockLogger.endStep).toHaveBeenCalledWith(SYNC_WITH_FINANCIAL_INSTITUTION_STEPS.GET_TRANSACTIONS);
      expect(mockLogger.info).toHaveBeenCalledWith({
        logId: SYNC_WITH_FINANCIAL_INSTITUTION_LOGS.SYNC_ACTIONS.logId,
        createTransactions: 0, // No new transactions to create
        updateTransactions: 1, // One transaction to update (amount and description changed)
        deleteTransactions: 1, // One transaction to delete (fi-tx-3 doesn't exist in FI)
      }, SYNC_WITH_FINANCIAL_INSTITUTION_LOGS.SYNC_ACTIONS.logMessage);
    });

    it('should handle empty financial institution transactions', async () => {
      (mockFinancialInstitutionService.getTransactions as jest.Mock).mockResolvedValue([]);
      (mockTransactionsRepository.getDocumentsList as jest.Mock).mockResolvedValue(mockInternalTransactions);

      await service.syncWithFinancialInstitution(syncInput, mockLogger);

      // All internal transactions should be deleted
      expect(mockLogger.info).toHaveBeenCalledWith({
        logId: SYNC_WITH_FINANCIAL_INSTITUTION_LOGS.SYNC_ACTIONS.logId,
        createTransactions: 0,
        updateTransactions: 0,
        deleteTransactions: 3, // All 3 internal transactions should be deleted
      }, SYNC_WITH_FINANCIAL_INSTITUTION_LOGS.SYNC_ACTIONS.logMessage);
    });

    it('should handle empty internal transactions', async () => {
      (mockTransactionsRepository.getDocumentsList as jest.Mock).mockResolvedValue([]);

      await service.syncWithFinancialInstitution(syncInput, mockLogger);

      // All FI transactions should be created
      expect(mockLogger.info).toHaveBeenCalledWith({
        logId: SYNC_WITH_FINANCIAL_INSTITUTION_LOGS.SYNC_ACTIONS.logId,
        createTransactions: 2, // Both FI transactions should be created
        updateTransactions: 0,
        deleteTransactions: 0,
      }, SYNC_WITH_FINANCIAL_INSTITUTION_LOGS.SYNC_ACTIONS.logMessage);
    });

    it('should handle transactions with different dates', async () => {
      const transactionWithDifferentDate: Transaction = {
        id: 'internal-tx-date',
        amount: 100,
        categoryId: 'cat-1',
        companyId,
        date: '2021-01-14', // Different date
        description: 'Transaction 1',
        sourceType: TransactionSourceType.FINANCIAL_INSTITUTION,
        sourceId: financialInstitutionId,
        sourceTransactionId: 'fi-tx-1',
        type: TransactionType.DEBIT,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockTransactionsRepository.getDocumentsList as jest.Mock).mockResolvedValue([transactionWithDifferentDate]);

      await service.syncWithFinancialInstitution(syncInput, mockLogger);

      // Should update transaction due to date difference
      expect(mockLogger.info).toHaveBeenCalledWith({
        logId: SYNC_WITH_FINANCIAL_INSTITUTION_LOGS.SYNC_ACTIONS.logId,
        createTransactions: 1, // fi-tx-2 should be created
        updateTransactions: 1, // fi-tx-1 should be updated due to date difference
        deleteTransactions: 0,
      }, SYNC_WITH_FINANCIAL_INSTITUTION_LOGS.SYNC_ACTIONS.logMessage);
    });

    it('should handle transactions with same data (no updates needed)', async () => {
      const exactMatchTransaction: Transaction = {
        id: 'internal-tx-exact',
        amount: 100,
        categoryId: 'cat-1',
        companyId,
        date: '2021-01-15', // Same date as FI transaction
        description: 'Transaction 1', // Same description
        sourceType: TransactionSourceType.FINANCIAL_INSTITUTION,
        sourceId: financialInstitutionId,
        sourceTransactionId: 'fi-tx-1',
        type: TransactionType.DEBIT,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockTransactionsRepository.getDocumentsList as jest.Mock).mockResolvedValue([exactMatchTransaction]);

      await service.syncWithFinancialInstitution(syncInput, mockLogger);

      // Should create fi-tx-2 but not update fi-tx-1 (exact match)
      expect(mockLogger.info).toHaveBeenCalledWith({
        logId: SYNC_WITH_FINANCIAL_INSTITUTION_LOGS.SYNC_ACTIONS.logId,
        createTransactions: 1, // fi-tx-2 should be created
        updateTransactions: 0, // fi-tx-1 should not be updated (exact match)
        deleteTransactions: 0,
      }, SYNC_WITH_FINANCIAL_INSTITUTION_LOGS.SYNC_ACTIONS.logMessage);
    });

    it('should handle batch commits for create transactions', async () => {
      // Create many transactions to test batch commit logic
      const manyTransactions = Array.from({ length: 10 }, (_, i) => ({
        id: `fi-tx-${i}`,
        amount: 100 + i,
        createdAt: `2021-01-${15 + i}T10:00:00Z`,
        description: `Transaction ${i}`,
        updatedAt: `2021-01-${15 + i}T10:00:00Z`,
      }));

      (mockFinancialInstitutionService.getTransactions as jest.Mock).mockResolvedValue(manyTransactions);
      (mockTransactionsRepository.getDocumentsList as jest.Mock).mockResolvedValue([]);

      await service.syncWithFinancialInstitution(syncInput, mockLogger);

      // Should create all transactions
      expect(mockLogger.info).toHaveBeenCalledWith({
        logId: SYNC_WITH_FINANCIAL_INSTITUTION_LOGS.SYNC_ACTIONS.logId,
        createTransactions: 10,
        updateTransactions: 0,
        deleteTransactions: 0,
      }, SYNC_WITH_FINANCIAL_INSTITUTION_LOGS.SYNC_ACTIONS.logMessage);

      // Verify batch operations were called
      expect(mockTransactionsRepository.createDocumentSync).toHaveBeenCalledTimes(10);
    });

    it('should handle batch commits for update transactions', async () => {
      const manyInternalTransactions = Array.from({ length: 10 }, (_, i) => ({
        id: `internal-tx-${i}`,
        amount: 100 + i,
        categoryId: `cat-${i}`,
        companyId,
        date: `2021-01-${15 + i}`,
        description: `Transaction ${i} Old`, // Different from FI
        sourceType: TransactionSourceType.FINANCIAL_INSTITUTION,
        sourceId: financialInstitutionId,
        sourceTransactionId: `fi-tx-${i}`,
        type: TransactionType.DEBIT,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      const manyFiTransactions = Array.from({ length: 10 }, (_, i) => ({
        id: `fi-tx-${i}`,
        amount: 100 + i,
        createdAt: `2021-01-${15 + i}T10:00:00Z`,
        description: `Transaction ${i} New`, // Different from internal
        updatedAt: `2021-01-${15 + i}T10:00:00Z`,
      }));

      (mockFinancialInstitutionService.getTransactions as jest.Mock).mockResolvedValue(manyFiTransactions);
      (mockTransactionsRepository.getDocumentsList as jest.Mock).mockResolvedValue(manyInternalTransactions);

      await service.syncWithFinancialInstitution(syncInput, mockLogger);

      // Should update all transactions
      expect(mockLogger.info).toHaveBeenCalledWith({
        logId: SYNC_WITH_FINANCIAL_INSTITUTION_LOGS.SYNC_ACTIONS.logId,
        createTransactions: 0,
        updateTransactions: 10,
        deleteTransactions: 0,
      }, SYNC_WITH_FINANCIAL_INSTITUTION_LOGS.SYNC_ACTIONS.logMessage);

      // Verify batch operations were called
      expect(mockTransactionsRepository.updateDocumentSync).toHaveBeenCalledTimes(10);
    });

    it('should handle batch commits for delete transactions', async () => {
      const manyInternalTransactions = Array.from({ length: 10 }, (_, i) => ({
        id: `internal-tx-${i}`,
        amount: 100 + i,
        categoryId: `cat-${i}`,
        companyId,
        date: `2021-01-${15 + i}`,
        description: `Transaction ${i}`,
        sourceType: TransactionSourceType.FINANCIAL_INSTITUTION,
        sourceId: financialInstitutionId,
        sourceTransactionId: `fi-tx-${i}`,
        type: TransactionType.DEBIT,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      (mockFinancialInstitutionService.getTransactions as jest.Mock).mockResolvedValue([]);
      (mockTransactionsRepository.getDocumentsList as jest.Mock).mockResolvedValue(manyInternalTransactions);

      await service.syncWithFinancialInstitution(syncInput, mockLogger);

      // Should delete all transactions
      expect(mockLogger.info).toHaveBeenCalledWith({
        logId: SYNC_WITH_FINANCIAL_INSTITUTION_LOGS.SYNC_ACTIONS.logId,
        createTransactions: 0,
        updateTransactions: 0,
        deleteTransactions: 10,
      }, SYNC_WITH_FINANCIAL_INSTITUTION_LOGS.SYNC_ACTIONS.logMessage);

      // Verify batch operations were called
      expect(mockTransactionsRepository.deleteDocumentSync).toHaveBeenCalledTimes(10);
    });

    it('should handle mixed operations (create, update, delete)', async () => {
      const mixedInternalTransactions: Transaction[] = [
        {
          id: 'internal-tx-1',
          amount: 100,
          categoryId: 'cat-1',
          companyId,
          date: '2021-01-15',
          description: 'Transaction 1',
          sourceType: TransactionSourceType.FINANCIAL_INSTITUTION,
          sourceId: financialInstitutionId,
          sourceTransactionId: 'fi-tx-1',
          type: TransactionType.DEBIT,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'internal-tx-2',
          amount: 150, // Different amount
          categoryId: 'cat-2',
          companyId,
          date: '2021-01-20',
          description: 'Transaction 2 Old', // Different description
          sourceType: TransactionSourceType.FINANCIAL_INSTITUTION,
          sourceId: financialInstitutionId,
          sourceTransactionId: 'fi-tx-2',
          type: TransactionType.DEBIT,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'internal-tx-3',
          amount: 300,
          categoryId: 'cat-3',
          companyId,
          date: '2021-01-25',
          description: 'Transaction to be deleted',
          sourceType: TransactionSourceType.FINANCIAL_INSTITUTION,
          sourceId: financialInstitutionId,
          sourceTransactionId: 'fi-tx-3', // This doesn't exist in FI transactions
          type: TransactionType.DEBIT,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mixedFiTransactions: FinancialInstitutionTransaction[] = [
        {
          id: 'fi-tx-1',
          amount: 100,
          createdAt: '2021-01-15T10:00:00Z',
          description: 'Transaction 1',
          updatedAt: '2021-01-15T10:00:00Z',
        },
        {
          id: 'fi-tx-2',
          amount: 200, // Different amount
          createdAt: '2021-01-20T10:00:00Z',
          description: 'Transaction 2 New', // Different description
          updatedAt: '2021-01-20T10:00:00Z',
        },
        {
          id: 'fi-tx-4', // New transaction
          amount: 400,
          createdAt: '2021-01-30T10:00:00Z',
          description: 'New Transaction',
          updatedAt: '2021-01-30T10:00:00Z',
        },
      ];

      (mockFinancialInstitutionService.getTransactions as jest.Mock).mockResolvedValue(mixedFiTransactions);
      (mockTransactionsRepository.getDocumentsList as jest.Mock).mockResolvedValue(mixedInternalTransactions);

      await service.syncWithFinancialInstitution(syncInput, mockLogger);

      // Should handle all operations
      expect(mockLogger.info).toHaveBeenCalledWith({
        logId: SYNC_WITH_FINANCIAL_INSTITUTION_LOGS.SYNC_ACTIONS.logId,
        createTransactions: 1, // fi-tx-4 should be created
        updateTransactions: 1, // fi-tx-2 should be updated
        deleteTransactions: 1, // fi-tx-3 should be deleted
      }, SYNC_WITH_FINANCIAL_INSTITUTION_LOGS.SYNC_ACTIONS.logMessage);
    });

    it('should handle no operations needed (empty arrays)', async () => {
      (mockFinancialInstitutionService.getTransactions as jest.Mock).mockResolvedValue([]);
      (mockTransactionsRepository.getDocumentsList as jest.Mock).mockResolvedValue([]);

      await service.syncWithFinancialInstitution(syncInput, mockLogger);

      // Should handle no operations
      expect(mockLogger.info).toHaveBeenCalledWith({
        logId: SYNC_WITH_FINANCIAL_INSTITUTION_LOGS.SYNC_ACTIONS.logId,
        createTransactions: 0,
        updateTransactions: 0,
        deleteTransactions: 0,
      }, SYNC_WITH_FINANCIAL_INSTITUTION_LOGS.SYNC_ACTIONS.logMessage);
    });

    it('should handle partial commits for create transactions when batch size limit is reached', async () => {
      // Create enough transactions to trigger partial commits
      // MAX_WRITE_BATCH_SIZE = 500, WRITES_PER_CREATE_DOCUMENT = 3
      // The condition is: writes % (500 - 3) === 0, so writes % 497 === 0
      // We need writes to be exactly 497, 994, 1491, etc.
      // 497 / 3 = 165.67, so we can't reach exactly 497 with create operations
      // 994 / 3 = 331.33, so we can't reach exactly 994 with create operations  
      // 1491 / 3 = 497, so we need 497 transactions to reach 1491 writes
      const manyTransactions = Array.from({ length: 500 }, (_, i) => ({
        id: `fi-tx-${i}`,
        amount: 100 + i,
        createdAt: `2021-01-${15 + (i % 15)}T10:00:00Z`,
        description: `Transaction ${i}`,
        updatedAt: `2021-01-${15 + (i % 15)}T10:00:00Z`,
      }));

      (mockFinancialInstitutionService.getTransactions as jest.Mock).mockResolvedValue(manyTransactions);
      (mockTransactionsRepository.getDocumentsList as jest.Mock).mockResolvedValue([]);

      await service.syncWithFinancialInstitution(syncInput, mockLogger);

      // Should create all transactions
      expect(mockLogger.info).toHaveBeenCalledWith({
        logId: SYNC_WITH_FINANCIAL_INSTITUTION_LOGS.SYNC_ACTIONS.logId,
        createTransactions: 500,
        updateTransactions: 0,
        deleteTransactions: 0,
      }, SYNC_WITH_FINANCIAL_INSTITUTION_LOGS.SYNC_ACTIONS.logMessage);

      // Verify batch operations were called
      expect(mockTransactionsRepository.createDocumentSync).toHaveBeenCalledTimes(500);
      
      // Verify partial commit logging was called
      expect(mockLogger.startStep).toHaveBeenCalledWith(
        SYNC_WITH_FINANCIAL_INSTITUTION_STEPS.CREATE_TRANSACTIONS_PARTIAL_COMMIT, 
        'TransactionsService.syncWithFinancialInstitution'
      );
      expect(mockLogger.endStep).toHaveBeenCalledWith(
        SYNC_WITH_FINANCIAL_INSTITUTION_STEPS.CREATE_TRANSACTIONS_PARTIAL_COMMIT
      );
    });

    it('should handle partial commits for update transactions when batch size limit is reached', async () => {
      // Create enough transactions to trigger partial commits
      // MAX_WRITE_BATCH_SIZE = 500, WRITES_PER_UPDATE_DOCUMENT = 2
      // Partial commit triggers when writes % (500 - 2) === 0, so when writes = 498
      // 498 / 2 = 249, so we need 249 transactions to trigger partial commit
      const manyInternalTransactions = Array.from({ length: 300 }, (_, i) => ({
        id: `internal-tx-${i}`,
        amount: 100 + i,
        categoryId: `cat-${i}`,
        companyId,
        date: `2021-01-${15 + (i % 15)}`,
        description: `Transaction ${i} Old`, // Different from FI
        sourceType: TransactionSourceType.FINANCIAL_INSTITUTION,
        sourceId: financialInstitutionId,
        sourceTransactionId: `fi-tx-${i}`,
        type: TransactionType.DEBIT,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      const manyFiTransactions = Array.from({ length: 300 }, (_, i) => ({
        id: `fi-tx-${i}`,
        amount: 100 + i,
        createdAt: `2021-01-${15 + (i % 15)}T10:00:00Z`,
        description: `Transaction ${i} New`, // Different from internal
        updatedAt: `2021-01-${15 + (i % 15)}T10:00:00Z`,
      }));

      (mockFinancialInstitutionService.getTransactions as jest.Mock).mockResolvedValue(manyFiTransactions);
      (mockTransactionsRepository.getDocumentsList as jest.Mock).mockResolvedValue(manyInternalTransactions);

      await service.syncWithFinancialInstitution(syncInput, mockLogger);

      // Should update all transactions
      expect(mockLogger.info).toHaveBeenCalledWith({
        logId: SYNC_WITH_FINANCIAL_INSTITUTION_LOGS.SYNC_ACTIONS.logId,
        createTransactions: 0,
        updateTransactions: 300,
        deleteTransactions: 0,
      }, SYNC_WITH_FINANCIAL_INSTITUTION_LOGS.SYNC_ACTIONS.logMessage);

      // Verify batch operations were called
      expect(mockTransactionsRepository.updateDocumentSync).toHaveBeenCalledTimes(300);
      
      // Verify partial commit logging was called
      expect(mockLogger.startStep).toHaveBeenCalledWith(
        SYNC_WITH_FINANCIAL_INSTITUTION_STEPS.UPDATE_TRANSACTIONS_PARTIAL_COMMIT, 
        'TransactionsService.syncWithFinancialInstitution'
      );
      expect(mockLogger.endStep).toHaveBeenCalledWith(
        SYNC_WITH_FINANCIAL_INSTITUTION_STEPS.UPDATE_TRANSACTIONS_PARTIAL_COMMIT
      );
    });

    it('should handle partial commits for delete transactions when batch size limit is reached', async () => {
      // Create enough transactions to trigger partial commits
      // MAX_WRITE_BATCH_SIZE = 500, WRITES_PER_DELETE_DOCUMENT = 1
      // Partial commit triggers when writes % (500 - 1) === 0, so when writes = 499
      // 499 / 1 = 499, so we need 499 transactions to trigger partial commit
      const manyInternalTransactions = Array.from({ length: 600 }, (_, i) => ({
        id: `internal-tx-${i}`,
        amount: 100 + i,
        categoryId: `cat-${i}`,
        companyId,
        date: `2021-01-${15 + (i % 15)}`,
        description: `Transaction ${i}`,
        sourceType: TransactionSourceType.FINANCIAL_INSTITUTION,
        sourceId: financialInstitutionId,
        sourceTransactionId: `fi-tx-${i}`,
        type: TransactionType.DEBIT,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      (mockFinancialInstitutionService.getTransactions as jest.Mock).mockResolvedValue([]);
      (mockTransactionsRepository.getDocumentsList as jest.Mock).mockResolvedValue(manyInternalTransactions);

      await service.syncWithFinancialInstitution(syncInput, mockLogger);

      // Should delete all transactions
      expect(mockLogger.info).toHaveBeenCalledWith({
        logId: SYNC_WITH_FINANCIAL_INSTITUTION_LOGS.SYNC_ACTIONS.logId,
        createTransactions: 0,
        updateTransactions: 0,
        deleteTransactions: 600,
      }, SYNC_WITH_FINANCIAL_INSTITUTION_LOGS.SYNC_ACTIONS.logMessage);

      // Verify batch operations were called
      expect(mockTransactionsRepository.deleteDocumentSync).toHaveBeenCalledTimes(600);
      
      // Verify partial commit logging was called
      expect(mockLogger.startStep).toHaveBeenCalledWith(
        SYNC_WITH_FINANCIAL_INSTITUTION_STEPS.DELETE_TRANSACTIONS_PARTIAL_COMMIT, 
        'TransactionsService.syncWithFinancialInstitution'
      );
      expect(mockLogger.endStep).toHaveBeenCalledWith(
        SYNC_WITH_FINANCIAL_INSTITUTION_STEPS.DELETE_TRANSACTIONS_PARTIAL_COMMIT
      );
    });
  });
});