import { STATUS_CODES } from '@repo/fastify';
import { TransactionsService } from '@repo/shared/services';
import { FastifyReply, FastifyRequest } from 'fastify';

import { syncTransactionsHandler } from '../sync-transactions.handler';
import { STEPS } from '../sync-transactions.handler.constants';
import { SyncTransactionsBody, SyncTransactionsParams } from '../sync-transactions.handler.interfaces';

jest.mock('@repo/shared/services');
jest.mock('@repo/fastify', () => ({
  STATUS_CODES: {
    NO_CONTENT: 204,
  },
}));

describe(syncTransactionsHandler.name, () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockLogger: any;
  let mockService: Partial<TransactionsService>;
  const logGroup = syncTransactionsHandler.name;
  const mockCompanyId = 'company-123';
  const mockFinancialInstitutionId = 'fi-456';
  const mockFromDate = '2023-01-01';
  const mockToDate = '2023-01-31';

  beforeEach(() => {
    mockLogger = {
      child: jest.fn().mockReturnThis(),
      startStep: jest.fn(),
      endStep: jest.fn(),
    };

    mockRequest = {
      log: mockLogger,
      params: {
        companyId: mockCompanyId,
        financialInstitutionId: mockFinancialInstitutionId,
      } as SyncTransactionsParams,
      body: {
        fromDate: mockFromDate,
        toDate: mockToDate,
      } as SyncTransactionsBody,
    };

    mockReply = {
      code: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    mockService = {
      syncWithFinancialInstitution: jest.fn(),
    };

    (TransactionsService.getInstance as jest.Mock).mockReturnValue(mockService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should sync transactions successfully', async () => {
    // Arrange
    jest.spyOn(mockService, 'syncWithFinancialInstitution').mockResolvedValue(undefined);

    // Act
    await syncTransactionsHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    // Assert
    expect(mockLogger.child).toHaveBeenCalledWith({
      handler: syncTransactionsHandler.name,
    });
    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.SYNC_TRANSACTIONS.id, logGroup);
    expect(TransactionsService.getInstance).toHaveBeenCalled();
    expect(mockService.syncWithFinancialInstitution).toHaveBeenCalledWith({
      companyId: mockCompanyId,
      financialInstitutionId: mockFinancialInstitutionId,
      fromDate: mockFromDate,
      toDate: mockToDate,
    }, mockLogger);
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.SYNC_TRANSACTIONS.id);
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.NO_CONTENT);
    expect(mockReply.send).toHaveBeenCalled();
  });

  it('should extract parameters from request correctly', async () => {
    // Arrange
    const differentCompanyId = 'different-company-789';
    const differentFinancialInstitutionId = 'different-fi-101';
    const differentFromDate = '2023-02-01';
    const differentToDate = '2023-02-28';

    mockRequest.params = {
      companyId: differentCompanyId,
      financialInstitutionId: differentFinancialInstitutionId,
    } as SyncTransactionsParams;
    mockRequest.body = {
      fromDate: differentFromDate,
      toDate: differentToDate,
    } as SyncTransactionsBody;

    jest.spyOn(mockService, 'syncWithFinancialInstitution').mockResolvedValue(undefined);

    // Act
    await syncTransactionsHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    // Assert
    expect(mockService.syncWithFinancialInstitution).toHaveBeenCalledWith({
      companyId: differentCompanyId,
      financialInstitutionId: differentFinancialInstitutionId,
      fromDate: differentFromDate,
      toDate: differentToDate,
    }, mockLogger);
  });

  it('should handle service errors', async () => {
    // Arrange
    const mockError = new Error('Service error');
    jest.spyOn(mockService, 'syncWithFinancialInstitution').mockRejectedValue(mockError);

    // Act & Assert
    await expect(
      syncTransactionsHandler(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      ),
    ).rejects.toThrow(mockError);

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.SYNC_TRANSACTIONS.id, logGroup);
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.SYNC_TRANSACTIONS.id);
    expect(mockReply.send).not.toHaveBeenCalled();
  });

  it('should handle service errors and ensure endStep is called in finally block', async () => {
    // Arrange
    const mockError = new Error('Service error');
    jest.spyOn(mockService, 'syncWithFinancialInstitution').mockRejectedValue(mockError);

    // Act & Assert
    await expect(
      syncTransactionsHandler(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      ),
    ).rejects.toThrow(mockError);

    // Verify that endStep is called even when the service throws an error
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.SYNC_TRANSACTIONS.id);
  });

  it('should return 204 No Content status code on successful sync', async () => {
    // Arrange
    jest.spyOn(mockService, 'syncWithFinancialInstitution').mockResolvedValue(undefined);

    // Act
    await syncTransactionsHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    // Assert
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.NO_CONTENT);
    expect(mockReply.send).toHaveBeenCalled();
  });

  it('should call service with correct parameters and logger', async () => {
    // Arrange
    jest.spyOn(mockService, 'syncWithFinancialInstitution').mockResolvedValue(undefined);

    // Act
    await syncTransactionsHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    // Assert
    expect(mockService.syncWithFinancialInstitution).toHaveBeenCalledWith(
      {
        companyId: mockCompanyId,
        financialInstitutionId: mockFinancialInstitutionId,
        fromDate: mockFromDate,
        toDate: mockToDate,
      },
      mockLogger
    );
  });

  it('should create child logger with correct handler name', async () => {
    // Arrange
    jest.spyOn(mockService, 'syncWithFinancialInstitution').mockResolvedValue(undefined);

    // Act
    await syncTransactionsHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    // Assert
    expect(mockLogger.child).toHaveBeenCalledWith({
      handler: syncTransactionsHandler.name,
    });
  });

  it('should handle empty response from service', async () => {
    // Arrange
    jest.spyOn(mockService, 'syncWithFinancialInstitution').mockResolvedValue(undefined);

    // Act
    await syncTransactionsHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    // Assert
    expect(mockService.syncWithFinancialInstitution).toHaveBeenCalled();
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.NO_CONTENT);
    expect(mockReply.send).toHaveBeenCalled();
  });
}); 