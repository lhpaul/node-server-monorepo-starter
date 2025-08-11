// Internal modules (farthest path first, then alphabetical)
import { ExecutionLogger } from '../../../../definitions';
import { TransactionSourceType, TransactionType } from '../../..';
import { TransactionsRepository } from '../../../../repositories';
import { DomainModelServiceError, DomainModelServiceErrorCode } from '../../../../utils';

// Local imports (alphabetical)
import { FinancialInstitutionService } from '../../financial-institution';
import { TransactionsService } from '../transactions.service';
import { ERRORS_MESSAGES, SYNC_WITH_FINANCIAL_INSTITUTION_STEPS } from '../transactions.service.constants';

jest.mock('../../../repositories');
jest.mock('../../financial-institution');

describe(TransactionsService.name, () => {
  let mockTransactionsRepository: jest.Mocked<TransactionsRepository>;
  let mockFinancialInstitutionsService: jest.Mocked<FinancialInstitutionService>;
  let mockLogger: jest.Mocked<ExecutionLogger>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockTransactionsRepository = {
      createDocument: jest.fn(),
      updateDocument: jest.fn(),
      deleteDocument: jest.fn(),
      getDocumentsList: jest.fn(),
    } as unknown as jest.Mocked<TransactionsRepository>;

    mockFinancialInstitutionsService = {
      getTransactions: jest.fn(),
    } as unknown as jest.Mocked<FinancialInstitutionService>;

    mockLogger = {
      startStep: jest.fn(),
      endStep: jest.fn(),
      warn: jest.fn(),
    } as unknown as jest.Mocked<ExecutionLogger>;

    (TransactionsRepository.getInstance as jest.Mock).mockReturnValue(mockTransactionsRepository);
    (FinancialInstitutionService.getInstance as jest.Mock).mockReturnValue(mockFinancialInstitutionsService);

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
    const syncInput = {
      companyId: 'company-123',
      financialInstitutionId: 'fi-123',
      fromDate: '2021-01-01',
      toDate: '2021-01-31',
    };

    beforeEach(() => {
      service = TransactionsService.getInstance();
    });

    it('should sync transactions when there are new transactions to create', async () => {
      const financialInstitutionTransactions = [
        {
          id: 'fi-transaction-1',
          amount: 100,
          createdAt: '2021-01-15T10:00:00Z',
          description: 'New transaction from FI',
          updatedAt: '2021-01-15T10:00:00Z',
        },
      ];

      const internalTransactions: any[] = [];

      (mockFinancialInstitutionsService.getTransactions as jest.Mock).mockResolvedValueOnce(financialInstitutionTransactions);
      (mockTransactionsRepository.getDocumentsList as jest.Mock).mockResolvedValueOnce(internalTransactions);
      (mockTransactionsRepository.createDocument as jest.Mock).mockResolvedValueOnce('new-transaction-id');

      await service.syncWithFinancialInstitution(syncInput, mockLogger);

      expect(mockLogger.startStep).toHaveBeenCalledWith(SYNC_WITH_FINANCIAL_INSTITUTION_STEPS.GET_TRANSACTIONS, expect.any(String));
      expect(mockLogger.endStep).toHaveBeenCalledWith(SYNC_WITH_FINANCIAL_INSTITUTION_STEPS.GET_TRANSACTIONS);
      expect(mockLogger.startStep).toHaveBeenCalledWith(SYNC_WITH_FINANCIAL_INSTITUTION_STEPS.CREATE_TRANSACTIONS, expect.any(String));
      expect(mockLogger.endStep).toHaveBeenCalledWith(SYNC_WITH_FINANCIAL_INSTITUTION_STEPS.CREATE_TRANSACTIONS);
      expect(mockTransactionsRepository.createDocument).toHaveBeenCalledWith(
        expect.objectContaining({
          companyId: syncInput.companyId,
          amount: 100,
          description: 'New transaction from FI',
          sourceType: TransactionSourceType.FINANCIAL_INSTITUTION,
          sourceId: syncInput.financialInstitutionId,
          sourceTransactionId: 'fi-transaction-1',
          type: TransactionType.DEBIT,
          date: '2021-01-15',
        }),
        mockLogger
      );
    });

    it('should sync transactions when there are existing transactions to update', async () => {
      const financialInstitutionTransactions = [
        {
          id: 'fi-transaction-1',
          amount: 150, // Changed amount
          createdAt: '2021-01-15T10:00:00Z',
          description: 'Updated transaction description',
          updatedAt: '2021-01-15T10:00:00Z',
        },
      ];

      const internalTransactions = [
        {
          id: 'fi-transaction-1',
          amount: 100,
          date: '2021-01-15',
          description: 'Old transaction description',
          companyId: syncInput.companyId,
          type: TransactionType.DEBIT,
          sourceType: TransactionSourceType.FINANCIAL_INSTITUTION,
          sourceId: syncInput.financialInstitutionId,
          sourceTransactionId: 'fi-transaction-1',
        },
      ];

      (mockFinancialInstitutionsService.getTransactions as jest.Mock).mockResolvedValueOnce(financialInstitutionTransactions);
      (mockTransactionsRepository.getDocumentsList as jest.Mock).mockResolvedValueOnce(internalTransactions);
      (mockTransactionsRepository.updateDocument as jest.Mock).mockResolvedValueOnce(undefined);

      await service.syncWithFinancialInstitution(syncInput, mockLogger);

      expect(mockLogger.startStep).toHaveBeenCalledWith(SYNC_WITH_FINANCIAL_INSTITUTION_STEPS.UPDATE_TRANSACTIONS, expect.any(String));
      expect(mockLogger.endStep).toHaveBeenCalledWith(SYNC_WITH_FINANCIAL_INSTITUTION_STEPS.UPDATE_TRANSACTIONS);
      expect(mockTransactionsRepository.updateDocument).toHaveBeenCalledWith(
        'fi-transaction-1',
        expect.objectContaining({
          amount: 150,
          description: 'Updated transaction description',
          date: '2021-01-15',
        }),
        mockLogger
      );
    });

    it('should sync transactions when there are transactions to delete', async () => {
      const financialInstitutionTransactions: any[] = [];

      const internalTransactions = [
        {
          id: 'old-transaction-1',
          amount: 100,
          date: '2021-01-15',
          description: 'Transaction to be deleted',
          companyId: syncInput.companyId,
          type: TransactionType.DEBIT,
          sourceType: TransactionSourceType.FINANCIAL_INSTITUTION,
          sourceId: syncInput.financialInstitutionId,
          sourceTransactionId: 'old-transaction-1',
        },
      ];

      (mockFinancialInstitutionsService.getTransactions as jest.Mock).mockResolvedValueOnce(financialInstitutionTransactions);
      (mockTransactionsRepository.getDocumentsList as jest.Mock).mockResolvedValueOnce(internalTransactions);
      (mockTransactionsRepository.deleteDocument as jest.Mock).mockResolvedValueOnce(undefined);

      await service.syncWithFinancialInstitution(syncInput, mockLogger);

      expect(mockLogger.startStep).toHaveBeenCalledWith(SYNC_WITH_FINANCIAL_INSTITUTION_STEPS.DELETE_TRANSACTIONS, expect.any(String));
      expect(mockLogger.endStep).toHaveBeenCalledWith(SYNC_WITH_FINANCIAL_INSTITUTION_STEPS.DELETE_TRANSACTIONS);
      expect(mockTransactionsRepository.deleteDocument).toHaveBeenCalledWith('old-transaction-1', mockLogger);
    });

    it('should handle mixed operations (create, update, delete) in a single sync', async () => {
      const financialInstitutionTransactions = [
        {
          id: 'fi-transaction-1',
          amount: 150,
          createdAt: '2021-01-15T10:00:00Z',
          description: 'Updated transaction',
          updatedAt: '2021-01-15T10:00:00Z',
        },
        {
          id: 'fi-transaction-2',
          amount: 200,
          createdAt: '2021-01-16T10:00:00Z',
          description: 'New transaction',
          updatedAt: '2021-01-16T10:00:00Z',
        },
      ];

      const internalTransactions = [
        {
          id: 'fi-transaction-1',
          amount: 100,
          date: '2021-01-15',
          description: 'Old description',
          companyId: syncInput.companyId,
          type: TransactionType.DEBIT,
          sourceType: TransactionSourceType.FINANCIAL_INSTITUTION,
          sourceId: syncInput.financialInstitutionId,
          sourceTransactionId: 'fi-transaction-1',
        },
        {
          id: 'old-transaction-3',
          amount: 300,
          date: '2021-01-17',
          description: 'Transaction to be deleted',
          companyId: syncInput.companyId,
          type: TransactionType.DEBIT,
          sourceType: TransactionSourceType.FINANCIAL_INSTITUTION,
          sourceId: syncInput.financialInstitutionId,
          sourceTransactionId: 'old-transaction-3',
        },
      ];

      (mockFinancialInstitutionsService.getTransactions as jest.Mock).mockResolvedValueOnce(financialInstitutionTransactions);
      (mockTransactionsRepository.getDocumentsList as jest.Mock).mockResolvedValueOnce(internalTransactions);
      (mockTransactionsRepository.createDocument as jest.Mock).mockResolvedValueOnce('new-transaction-id');
      (mockTransactionsRepository.updateDocument as jest.Mock).mockResolvedValueOnce(undefined);
      (mockTransactionsRepository.deleteDocument as jest.Mock).mockResolvedValueOnce(undefined);

      await service.syncWithFinancialInstitution(syncInput, mockLogger);

      // Verify create operation
      expect(mockTransactionsRepository.createDocument).toHaveBeenCalledWith(
        expect.objectContaining({
          companyId: syncInput.companyId,
          amount: 200,
          description: 'New transaction',
          sourceTransactionId: 'fi-transaction-2',
          date: '2021-01-16',
        }),
        mockLogger
      );

      // Verify update operation
      expect(mockTransactionsRepository.updateDocument).toHaveBeenCalledWith(
        'fi-transaction-1',
        expect.objectContaining({
          amount: 150,
          description: 'Updated transaction',
          date: '2021-01-15',
        }),
        mockLogger
      );

      // Verify delete operation
      expect(mockTransactionsRepository.deleteDocument).toHaveBeenCalledWith('old-transaction-3', mockLogger);
    });

    it('should not perform any operations when no changes are needed', async () => {
      const financialInstitutionTransactions = [
        {
          id: 'fi-transaction-1',
          amount: 100,
          createdAt: '2021-01-15T10:00:00Z',
          description: 'Same transaction',
          updatedAt: '2021-01-15T10:00:00Z',
        },
      ];

      const internalTransactions = [
        {
          id: 'fi-transaction-1',
          amount: 100,
          date: '2021-01-15',
          description: 'Same transaction',
          companyId: syncInput.companyId,
          type: TransactionType.DEBIT,
          sourceType: TransactionSourceType.FINANCIAL_INSTITUTION,
          sourceId: syncInput.financialInstitutionId,
          sourceTransactionId: 'fi-transaction-1',
        },
      ];

      (mockFinancialInstitutionsService.getTransactions as jest.Mock).mockResolvedValueOnce(financialInstitutionTransactions);
      (mockTransactionsRepository.getDocumentsList as jest.Mock).mockResolvedValueOnce(internalTransactions);

      await service.syncWithFinancialInstitution(syncInput, mockLogger);

      expect(mockTransactionsRepository.createDocument).not.toHaveBeenCalled();
      expect(mockTransactionsRepository.updateDocument).not.toHaveBeenCalled();
      expect(mockTransactionsRepository.deleteDocument).not.toHaveBeenCalled();
    });

    it('should handle empty financial institution transactions and empty internal transactions', async () => {
      const financialInstitutionTransactions: any[] = [];
      const internalTransactions: any[] = [];

      (mockFinancialInstitutionsService.getTransactions as jest.Mock).mockResolvedValueOnce(financialInstitutionTransactions);
      (mockTransactionsRepository.getDocumentsList as jest.Mock).mockResolvedValueOnce(internalTransactions);

      await service.syncWithFinancialInstitution(syncInput, mockLogger);

      expect(mockTransactionsRepository.createDocument).not.toHaveBeenCalled();
      expect(mockTransactionsRepository.updateDocument).not.toHaveBeenCalled();
      expect(mockTransactionsRepository.deleteDocument).not.toHaveBeenCalled();
    });

    it('should call FinancialInstitutionsService.getInstance with correct financialInstitutionId', async () => {
      const financialInstitutionTransactions: any[] = [];
      const internalTransactions: any[] = [];

      (mockFinancialInstitutionsService.getTransactions as jest.Mock).mockResolvedValueOnce(financialInstitutionTransactions);
      (mockTransactionsRepository.getDocumentsList as jest.Mock).mockResolvedValueOnce(internalTransactions);

      await service.syncWithFinancialInstitution(syncInput, mockLogger);

      expect(FinancialInstitutionService.getInstance).toHaveBeenCalledWith(syncInput.financialInstitutionId);
    });

    it('should call getTransactions with correct parameters', async () => {
      const financialInstitutionTransactions: any[] = [];
      const internalTransactions: any[] = [];

      (mockFinancialInstitutionsService.getTransactions as jest.Mock).mockResolvedValueOnce(financialInstitutionTransactions);
      (mockTransactionsRepository.getDocumentsList as jest.Mock).mockResolvedValueOnce(internalTransactions);

      await service.syncWithFinancialInstitution(syncInput, mockLogger);

      expect(mockFinancialInstitutionsService.getTransactions).toHaveBeenCalledWith(
        {
          companyId: syncInput.companyId,
          fromDate: syncInput.fromDate,
          toDate: syncInput.toDate,
        },
        mockLogger
      );
    });

    it('should call getResourcesList with correct filter parameters', async () => {
      const financialInstitutionTransactions: any[] = [];
      const internalTransactions: any[] = [];

      (mockFinancialInstitutionsService.getTransactions as jest.Mock).mockResolvedValueOnce(financialInstitutionTransactions);
      (mockTransactionsRepository.getDocumentsList as jest.Mock).mockResolvedValueOnce(internalTransactions);

      await service.syncWithFinancialInstitution(syncInput, mockLogger);

      expect(mockTransactionsRepository.getDocumentsList).toHaveBeenCalledWith(
        {
          companyId: [{ value: syncInput.companyId, operator: '==' }],
          date: [{ value: syncInput.fromDate, operator: '>' }, { value: syncInput.toDate, operator: '<=' }],
        },
        mockLogger
      );
    });
  });
}); 