import { CompaniesService, TransactionsService, SyncCompanyTransactionsMessage, CompanyFinancialInstitution } from '@repo/shared/domain';

import { FunctionLogger } from '../../../../utils/logging/function-logger.class';
import { syncCompanyTransactionsHandler } from '../sync-company-transactions.function.handler';
import { STEPS } from '../sync-company-transactions.function.constants';

// Mock dependencies
jest.mock('@repo/shared/domain');

describe(syncCompanyTransactionsHandler.name, () => {
  let mockLogger: jest.Mocked<FunctionLogger>;
  let mockCompaniesService: jest.Mocked<CompaniesService>;
  let mockTransactionsService: jest.Mocked<TransactionsService>;
  const logGroup = syncCompanyTransactionsHandler.name;

  const mockMessage: SyncCompanyTransactionsMessage = {
    companyId: 'company-123',
    fromDate: '2024-01-01',
    toDate: '2024-01-31',
  };

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup mock logger
    mockLogger = {
      startStep: jest.fn(),
      endStep: jest.fn(),
      info: jest.fn(),
    } as unknown as jest.Mocked<FunctionLogger>;

    // Setup mock companies service
    mockCompaniesService = {
      listFinancialInstitutions: jest.fn(),
    } as unknown as jest.Mocked<CompaniesService>;

    // Setup mock transactions service
    mockTransactionsService = {
      syncWithFinancialInstitution: jest.fn(),
    } as unknown as jest.Mocked<TransactionsService>;

    // Setup singleton instances
    (CompaniesService.getInstance as jest.Mock).mockReturnValue(mockCompaniesService);
    (TransactionsService.getInstance as jest.Mock).mockReturnValue(mockTransactionsService);
  });

  it('should successfully sync transactions for multiple financial institutions', async () => {
    // Mock financial institutions data
    const mockFinancialInstitutions = [
      {
        financialInstitution: {
          id: 'fi-1',
          name: 'Bank A',
        },
      },
      {
        financialInstitution: {
          id: 'fi-2',
          name: 'Bank B',
        },
      },
    ] as CompanyFinancialInstitution[];

    mockCompaniesService.listFinancialInstitutions.mockResolvedValue(mockFinancialInstitutions);
    mockTransactionsService.syncWithFinancialInstitution.mockResolvedValue(undefined);

    // Execute handler
    await syncCompanyTransactionsHandler(mockMessage, mockLogger);

    // Verify companies service call
    expect(mockCompaniesService.listFinancialInstitutions).toHaveBeenCalledWith(
      mockMessage.companyId,
      mockLogger
    );

    // Verify logger calls for getting financial institutions
    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_COMPANIES_FINANCIAL_INSTITUTIONS, logGroup);
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_COMPANIES_FINANCIAL_INSTITUTIONS);

    // Verify logger calls for syncing transactions
    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.SYNC_FINANCIAL_INSTITUTION_TRANSACTIONS, logGroup);
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.SYNC_FINANCIAL_INSTITUTION_TRANSACTIONS);

    // Verify transactions service calls for each financial institution
    expect(mockTransactionsService.syncWithFinancialInstitution).toHaveBeenCalledTimes(2);
    expect(mockTransactionsService.syncWithFinancialInstitution).toHaveBeenNthCalledWith(
      1,
      {
        companyId: mockMessage.companyId,
        financialInstitutionId: 'fi-1',
        fromDate: mockMessage.fromDate,
        toDate: mockMessage.toDate,
      },
      mockLogger
    );
    expect(mockTransactionsService.syncWithFinancialInstitution).toHaveBeenNthCalledWith(
      2,
      {
        companyId: mockMessage.companyId,
        financialInstitutionId: 'fi-2',
        fromDate: mockMessage.fromDate,
        toDate: mockMessage.toDate,
      },
      mockLogger
    );
  });

  it('should handle empty financial institutions list', async () => {
    // Mock empty financial institutions list
    mockCompaniesService.listFinancialInstitutions.mockResolvedValue([]);

    // Execute handler
    await syncCompanyTransactionsHandler(mockMessage, mockLogger);

    // Verify service call
    expect(mockCompaniesService.listFinancialInstitutions).toHaveBeenCalledWith(
      mockMessage.companyId,
      mockLogger
    );

    // Verify logger calls
    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_COMPANIES_FINANCIAL_INSTITUTIONS, logGroup);
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_COMPANIES_FINANCIAL_INSTITUTIONS);
    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.SYNC_FINANCIAL_INSTITUTION_TRANSACTIONS, logGroup);
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.SYNC_FINANCIAL_INSTITUTION_TRANSACTIONS);

    // Verify no transactions service calls were made
    expect(mockTransactionsService.syncWithFinancialInstitution).not.toHaveBeenCalled();
  });

  it('should handle companies service error gracefully', async () => {
    // Mock service error
    const error = new Error('Companies service error');
    mockCompaniesService.listFinancialInstitutions.mockRejectedValue(error);

    // Execute handler and expect it to throw
    await expect(syncCompanyTransactionsHandler(mockMessage, mockLogger)).rejects.toThrow(error);

    // Verify logger was still called
    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_COMPANIES_FINANCIAL_INSTITUTIONS, logGroup);
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_COMPANIES_FINANCIAL_INSTITUTIONS);

    // Verify no transactions service calls were made
    expect(mockTransactionsService.syncWithFinancialInstitution).not.toHaveBeenCalled();
  });

  it('should handle transactions service error gracefully', async () => {
    // Mock financial institutions data
    const mockFinancialInstitutions = [
      {
        financialInstitution: {
          id: 'fi-1',
          name: 'Bank A',
        },
      },
    ] as CompanyFinancialInstitution[];

    mockCompaniesService.listFinancialInstitutions.mockResolvedValue(mockFinancialInstitutions);
    
    // Mock transactions service error
    const syncError = new Error('Sync error');
    mockTransactionsService.syncWithFinancialInstitution.mockRejectedValue(syncError);

    // Execute handler and expect it to throw
    await expect(syncCompanyTransactionsHandler(mockMessage, mockLogger)).rejects.toThrow(syncError);

    // Verify service calls
    expect(mockCompaniesService.listFinancialInstitutions).toHaveBeenCalledWith(
      mockMessage.companyId,
      mockLogger
    );

    // Verify logger calls
    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_COMPANIES_FINANCIAL_INSTITUTIONS, logGroup);
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_COMPANIES_FINANCIAL_INSTITUTIONS);
    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.SYNC_FINANCIAL_INSTITUTION_TRANSACTIONS, logGroup);
    expect(mockLogger.startStep).toHaveBeenCalledWith(`${STEPS.SYNC_FINANCIAL_INSTITUTION_TRANSACTIONS}-fi-1`, logGroup);
    expect(mockLogger.endStep).toHaveBeenCalledWith(`${STEPS.SYNC_FINANCIAL_INSTITUTION_TRANSACTIONS}-fi-1`);

    // Verify transactions service was called
    expect(mockTransactionsService.syncWithFinancialInstitution).toHaveBeenCalledWith(
      {
        companyId: mockMessage.companyId,
        financialInstitutionId: 'fi-1',
        fromDate: mockMessage.fromDate,
        toDate: mockMessage.toDate,
      },
      mockLogger
    );
  });

  it('should handle partial failures in transactions sync', async () => {
    // Mock financial institutions data
    const mockFinancialInstitutions = [
      {
        financialInstitution: {
          id: 'fi-1',
          name: 'Bank A',
        },
      },
      {
        financialInstitution: {
          id: 'fi-2',
          name: 'Bank B',
        },
      },
    ] as CompanyFinancialInstitution[];

    mockCompaniesService.listFinancialInstitutions.mockResolvedValue(mockFinancialInstitutions);
    
    // Mock first sync success, second sync failure
    mockTransactionsService.syncWithFinancialInstitution
      .mockResolvedValueOnce(undefined) // First call succeeds
      .mockRejectedValueOnce(new Error('Second sync failed')); // Second call fails

    // Execute handler and expect it to throw
    await expect(syncCompanyTransactionsHandler(mockMessage, mockLogger)).rejects.toThrow('Second sync failed');

    // Verify both transactions service calls were made
    expect(mockTransactionsService.syncWithFinancialInstitution).toHaveBeenCalledTimes(2);
    
    // Verify logger calls for both financial institutions
    expect(mockLogger.startStep).toHaveBeenCalledWith(`${STEPS.SYNC_FINANCIAL_INSTITUTION_TRANSACTIONS}-fi-1`, logGroup);
    expect(mockLogger.startStep).toHaveBeenCalledWith(`${STEPS.SYNC_FINANCIAL_INSTITUTION_TRANSACTIONS}-fi-2`, logGroup);
    expect(mockLogger.endStep).toHaveBeenCalledWith(`${STEPS.SYNC_FINANCIAL_INSTITUTION_TRANSACTIONS}-fi-1`);
    expect(mockLogger.endStep).toHaveBeenCalledWith(`${STEPS.SYNC_FINANCIAL_INSTITUTION_TRANSACTIONS}-fi-2`);
  });

  it('should use correct message parameters for sync', async () => {
    // Mock financial institutions data
    const mockFinancialInstitutions = [
      {
        financialInstitution: {
          id: 'fi-1',
          name: 'Bank A',
        },
      },
    ] as CompanyFinancialInstitution[];

    const customMessage: SyncCompanyTransactionsMessage = {
      companyId: 'custom-company-456',
      fromDate: '2024-02-01',
      toDate: '2024-02-29',
    };

    mockCompaniesService.listFinancialInstitutions.mockResolvedValue(mockFinancialInstitutions);
    mockTransactionsService.syncWithFinancialInstitution.mockResolvedValue(undefined);

    // Execute handler with custom message
    await syncCompanyTransactionsHandler(customMessage, mockLogger);

    // Verify companies service called with correct company ID
    expect(mockCompaniesService.listFinancialInstitutions).toHaveBeenCalledWith(
      customMessage.companyId,
      mockLogger
    );

    // Verify transactions service called with correct parameters
    expect(mockTransactionsService.syncWithFinancialInstitution).toHaveBeenCalledWith(
      {
        companyId: customMessage.companyId,
        financialInstitutionId: 'fi-1',
        fromDate: customMessage.fromDate,
        toDate: customMessage.toDate,
      },
      mockLogger
    );
  });

  it('should ensure proper step logging order', async () => {
    // Mock financial institutions data
    const mockFinancialInstitutions = [
      {
        financialInstitution: {
          id: 'fi-1',
          name: 'Bank A',
        },
      },
    ] as CompanyFinancialInstitution[];

    mockCompaniesService.listFinancialInstitutions.mockResolvedValue(mockFinancialInstitutions);
    mockTransactionsService.syncWithFinancialInstitution.mockResolvedValue(undefined);

    // Execute handler
    await syncCompanyTransactionsHandler(mockMessage, mockLogger);

    // Verify the order of logger calls
    const startStepCalls = mockLogger.startStep.mock.calls;
    const endStepCalls = mockLogger.endStep.mock.calls;

    // Check that GET_COMPANIES_FINANCIAL_INSTITUTIONS step starts first
    expect(startStepCalls[0]).toEqual([STEPS.GET_COMPANIES_FINANCIAL_INSTITUTIONS, logGroup]);

    // Check that GET_COMPANIES_FINANCIAL_INSTITUTIONS step ends before SYNC_FINANCIAL_INSTITUTION_TRANSACTIONS starts
    const getCompaniesEndIndex = endStepCalls.findIndex(call => call[0] === STEPS.GET_COMPANIES_FINANCIAL_INSTITUTIONS);
    const syncTransactionsStartIndex = startStepCalls.findIndex(call => call[0] === STEPS.SYNC_FINANCIAL_INSTITUTION_TRANSACTIONS);

    expect(getCompaniesEndIndex).toBeLessThan(syncTransactionsStartIndex);
    // Check that individual financial institution sync starts after main sync step
    const individualSyncStartIndex = startStepCalls.findIndex(call => call[0] === `${STEPS.SYNC_FINANCIAL_INSTITUTION_TRANSACTIONS}-fi-1`);
    expect(individualSyncStartIndex).toBeGreaterThan(syncTransactionsStartIndex);
  });
});
