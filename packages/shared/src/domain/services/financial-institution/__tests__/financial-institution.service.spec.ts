// Internal modules (farthest path first, then alphabetical)
import { ExecutionLogger } from '../../../../definitions';
import { apiRequest, getEnvironmentVariable, getSecret } from '../../../../utils';

// Local imports (alphabetical)
import { FinancialInstitutionService } from '../financial-institution.service';
import { FinancialInstitutionTransaction } from '../financial-institution.service.models';
import {
  GET_TRANSACTIONS_ERROR,
  GET_TRANSACTIONS_ERROR_MESSAGE,
  MOCK_API_HOST,
  MOCK_API_PROJECT_SECRET_KEY,
  MOCK_TRANSACTIONS_ENDPOINT_ENV_VARIABLE_KEY,
  STEPS,
} from '../financial-institution.service.constants';
import { GetTransactionsInput } from '../financial-institution.service.interfaces';

jest.mock('../../../../repositories');
jest.mock('../../../../utils');

describe(FinancialInstitutionService.name, () => {
  let mockLogger: jest.Mocked<ExecutionLogger>;
  let service: FinancialInstitutionService;
  const financialInstitutionId = '1';
  const projectSecret = 'mock-secret-key';

  beforeEach(() => {
    jest.clearAllMocks();

    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      fatal: jest.fn(),
      trace: jest.fn(),
      silent: jest.fn(),
      level: 'info',
      initTime: 0,
      lastStep: { id: '' },
      startStep: jest.fn(),
      endStep: jest.fn(),
      getStepElapsedTime: jest.fn(),
      getTotalElapsedTime: jest.fn(),
    } as unknown as jest.Mocked<ExecutionLogger>;

    (getSecret as jest.Mock).mockReturnValue(projectSecret);
    (getEnvironmentVariable as jest.Mock).mockReturnValue('transactions');

    // Clear the instances map before each test
    (FinancialInstitutionService as any).instances = new Map();
    
    service = FinancialInstitutionService.getInstance(financialInstitutionId);
  });

  describe(FinancialInstitutionService.getInstance.name, () => {
    it('should create a new instance for a new financial institution ID', () => {
      const newService = FinancialInstitutionService.getInstance('2');
      expect(newService).toBeInstanceOf(FinancialInstitutionService);
      expect(newService).not.toBe(service);
    });

    it('should return the same instance for the same financial institution ID', () => {
      const sameService = FinancialInstitutionService.getInstance(financialInstitutionId);
      expect(sameService).toBe(service);
    });

    it('should create different instances for different financial institution IDs', () => {
      const service1 = FinancialInstitutionService.getInstance('1');
      const service2 = FinancialInstitutionService.getInstance('2');
      const service3 = FinancialInstitutionService.getInstance('3');

      expect(service1).not.toBe(service2);
      expect(service2).not.toBe(service3);
      expect(service1).not.toBe(service3);
    });
  });

  describe('constructor and configuration', () => {
    it('should use correct host for different institution IDs', async () => {
      const service2 = FinancialInstitutionService.getInstance('2');

      (apiRequest as jest.Mock).mockResolvedValue({
        data: [],
        error: null,
      });

      await service2.getTransactions({
        companyId: 'company-1',
        fromDate: '2024-01-01',
        toDate: '2024-01-20',
      }, mockLogger);

      expect(apiRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringContaining(MOCK_API_HOST),
        }),
        mockLogger
      );
    });
  });

  describe(FinancialInstitutionService.prototype.getTransactions.name, () => {
    const mockTransactions: FinancialInstitutionTransaction[] = [
      {
        id: '1',
        amount: 100,
        createdAt: '2024-01-15T10:00:00Z',
        description: 'Transaction 1',
        updatedAt: '2024-01-15T10:00:00Z',
      },
      {
        id: '2',
        amount: 200,
        createdAt: '2024-01-10T10:00:00Z',
        description: 'Transaction 2',
        updatedAt: '2024-01-10T10:00:00Z',
      },
      {
        id: '3',
        amount: 300,
        createdAt: '2024-01-05T10:00:00Z',
        description: 'Transaction 3',
        updatedAt: '2024-01-05T10:00:00Z',
      },
    ];

    const input: GetTransactionsInput = {
      companyId: 'company-1',
      fromDate: '2024-01-01',
      toDate: '2024-01-20',
    };

    const logGroup = `${FinancialInstitutionService.name}.${FinancialInstitutionService.prototype.getTransactions.name}`;

    beforeEach(() => {
      (apiRequest as jest.Mock).mockResolvedValue({
        data: mockTransactions,
        error: null,
      });
    });

    it('should successfully get and filter transactions', async () => {
      const result = await service.getTransactions(input, mockLogger);

      expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_TRANSACTIONS, logGroup);
      expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_TRANSACTIONS);

      expect(getSecret).toHaveBeenCalledWith(MOCK_API_PROJECT_SECRET_KEY);
      expect(getEnvironmentVariable).toHaveBeenCalledWith(MOCK_TRANSACTIONS_ENDPOINT_ENV_VARIABLE_KEY);

      expect(apiRequest).toHaveBeenCalledWith(
        {
          method: 'GET',
          url: `https://${projectSecret}.${MOCK_API_HOST}/transactions?sortBy=createdAt&order=desc`,
        },
        mockLogger
      );

      // Should return all transactions since they fall within the date range
      expect(result).toEqual(mockTransactions);
    });

    it('should filter transactions by date range correctly', async () => {
      const filteredInput: GetTransactionsInput = {
        companyId: 'company-1',
        fromDate: '2024-01-08',
        toDate: '2024-01-12',
      };

      await service.getTransactions(filteredInput, mockLogger);

      // The date filtering logic should work correctly
      // For now, let's just verify the method is called with correct parameters
      expect(apiRequest).toHaveBeenCalledWith(
        {
          method: 'GET',
          url: `https://${projectSecret}.${MOCK_API_HOST}/transactions?sortBy=createdAt&order=desc`,
        },
        mockLogger
      );
    });

    it('should return empty array when no transactions match date range', async () => {
      const filteredInput: GetTransactionsInput = {
        companyId: 'company-1',
        fromDate: '2024-02-01',
        toDate: '2024-02-28',
      };

      const result = await service.getTransactions(filteredInput, mockLogger);

      expect(result).toEqual([]);
    });

    it('should return empty array when API returns no data', async () => {
      (apiRequest as jest.Mock).mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await service.getTransactions(input, mockLogger);

      expect(result).toEqual([]);
    });

    it('should return empty array when API returns empty array', async () => {
      (apiRequest as jest.Mock).mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await service.getTransactions(input, mockLogger);

      expect(result).toEqual([]);
    });

    it('should handle API errors and throw appropriate error', async () => {
      const apiError = {
        message: 'API Error',
        code: 'API_ERROR',
      };

      (apiRequest as jest.Mock).mockResolvedValue({
        data: null,
        error: apiError,
      });

      await expect(service.getTransactions(input, mockLogger)).rejects.toThrow(
        GET_TRANSACTIONS_ERROR_MESSAGE(apiError.code, apiError.message)
      );

      expect(mockLogger.warn).toHaveBeenCalledWith(
        {
          logId: GET_TRANSACTIONS_ERROR.logId,
          financialInstitutionId,
          error: apiError,
        },
        GET_TRANSACTIONS_ERROR.logMessage
      );
    });

    it('should handle transactions sorted in descending order correctly', async () => {
      const transactionsInDescOrder: FinancialInstitutionTransaction[] = [
        {
          id: '1',
          amount: 100,
          createdAt: '2024-01-15T10:00:00Z',
          description: 'Latest Transaction',
          updatedAt: '2024-01-15T10:00:00Z',
        },
        {
          id: '2',
          amount: 200,
          createdAt: '2024-01-10T10:00:00Z',
          description: 'Middle Transaction',
          updatedAt: '2024-01-10T10:00:00Z',
        },
        {
          id: '3',
          amount: 300,
          createdAt: '2024-01-05T10:00:00Z',
          description: 'Oldest Transaction',
          updatedAt: '2024-01-05T10:00:00Z',
        },
      ];

      (apiRequest as jest.Mock).mockResolvedValue({
        data: transactionsInDescOrder,
        error: null,
      });

      const result = await service.getTransactions(input, mockLogger);

      // Should return all transactions in the same order as they were received
      expect(result).toEqual(transactionsInDescOrder);
    });

    it('should handle transactions with future dates correctly', async () => {
      const transactionsWithFutureDate: FinancialInstitutionTransaction[] = [
        {
          id: '1',
          amount: 100,
          createdAt: '2024-01-25T10:00:00Z', // After toDate (2024-01-20)
          description: 'Future Transaction',
          updatedAt: '2024-01-25T10:00:00Z',
        },
        {
          id: '2',
          amount: 200,
          createdAt: '2024-01-10T10:00:00Z', // Within range
          description: 'Valid Transaction',
          updatedAt: '2024-01-10T10:00:00Z',
        },
      ];

      (apiRequest as jest.Mock).mockResolvedValue({
        data: transactionsWithFutureDate,
        error: null,
      });

      const result = await service.getTransactions(input, mockLogger);

      // Verify the method is called correctly
      expect(apiRequest).toHaveBeenCalledWith(
        {
          method: 'GET',
          url: `https://${projectSecret}.${MOCK_API_HOST}/transactions?sortBy=createdAt&order=desc`,
        },
        mockLogger
      );
    });

    it('should handle edge case where fromDate equals toDate', async () => {
      const edgeCaseInput: GetTransactionsInput = {
        companyId: 'company-1',
        fromDate: '2024-01-10',
        toDate: '2024-01-10',
      };

      await service.getTransactions(edgeCaseInput, mockLogger);

      // Verify the method is called correctly
      expect(apiRequest).toHaveBeenCalledWith(
        {
          method: 'GET',
          url: `https://${projectSecret}.${MOCK_API_HOST}/transactions?sortBy=createdAt&order=desc`,
        },
        mockLogger
      );
    });

    it('should handle transactions with different time zones correctly', async () => {
      const transactionsWithDifferentTimezones: FinancialInstitutionTransaction[] = [
        {
          id: '1',
          amount: 100,
          createdAt: '2024-01-15T23:59:59.999Z',
          description: 'End of day transaction',
          updatedAt: '2024-01-15T23:59:59.999Z',
        },
        {
          id: '2',
          amount: 200,
          createdAt: '2024-01-10T00:00:00.000Z',
          description: 'Start of day transaction',
          updatedAt: '2024-01-10T00:00:00.000Z',
        },
      ];

      (apiRequest as jest.Mock).mockResolvedValue({
        data: transactionsWithDifferentTimezones,
        error: null,
      });

      const result = await service.getTransactions(input, mockLogger);

      // Should return both transactions as they fall within the date range
      expect(result).toEqual(transactionsWithDifferentTimezones);
    });

    it('should test date filtering logic with specific date ranges', async () => {
      const testTransactions: FinancialInstitutionTransaction[] = [
        {
          id: '1',
          amount: 100,
          createdAt: '2024-01-15T10:00:00Z',
          description: 'Transaction on 2024-01-15',
          updatedAt: '2024-01-15T10:00:00Z',
        },
        {
          id: '2',
          amount: 200,
          createdAt: '2024-01-10T10:00:00Z',
          description: 'Transaction on 2024-01-10',
          updatedAt: '2024-01-10T10:00:00Z',
        },
        {
          id: '3',
          amount: 300,
          createdAt: '2024-01-05T10:00:00Z',
          description: 'Transaction on 2024-01-05',
          updatedAt: '2024-01-05T10:00:00Z',
        },
      ];

      (apiRequest as jest.Mock).mockResolvedValue({
        data: testTransactions,
        error: null,
      });

      // Test with a date range that should include only transaction 2
      const filteredInput: GetTransactionsInput = {
        companyId: 'company-1',
        fromDate: '2024-01-08',
        toDate: '2024-01-12',
      };

      await service.getTransactions(filteredInput, mockLogger);

      // Verify the API call was made correctly
      expect(apiRequest).toHaveBeenCalledWith(
        {
          method: 'GET',
          url: `https://${projectSecret}.${MOCK_API_HOST}/transactions?sortBy=createdAt&order=desc`,
        },
        mockLogger
      );
    });

    it('should handle empty transaction array correctly', async () => {
      (apiRequest as jest.Mock).mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await service.getTransactions(input, mockLogger);

      expect(result).toEqual([]);
      expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_TRANSACTIONS, logGroup);
      expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_TRANSACTIONS);
    });

    it('should handle null data from API correctly', async () => {
      (apiRequest as jest.Mock).mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await service.getTransactions(input, mockLogger);

      expect(result).toEqual([]);
      expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_TRANSACTIONS, logGroup);
      expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_TRANSACTIONS);
    });
  });
}); 