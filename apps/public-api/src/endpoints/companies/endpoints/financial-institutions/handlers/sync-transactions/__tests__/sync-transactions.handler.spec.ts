import { FORBIDDEN_ERROR, STATUS_CODES } from '@repo/fastify';
import { TransactionsService } from '@repo/shared/services';
import { FastifyReply, FastifyRequest } from 'fastify';

import { hasCompanyFinancialInstitutionsCreatePermission, hasCompanyFinancialInstitutionsReadPermission } from '../../../../../../../utils/auth/auth.utils';
import { STEPS } from '../sync-transactions.handler.constants';
import { syncTransactionsHandler } from '../sync-transactions.handler';
import { SyncTransactionsBody, SyncTransactionsParams } from '../sync-transactions.handler.interfaces';

jest.mock('@repo/shared/services', () => ({
  ...jest.requireActual('@repo/shared/services'),
  TransactionsService: {
    getInstance: jest.fn(),
  },
}));
jest.mock('../../../../../../../utils/auth/auth.utils', () => ({
  hasCompanyFinancialInstitutionsCreatePermission: jest.fn(),
  hasCompanyFinancialInstitutionsReadPermission: jest.fn(),
}));

describe(syncTransactionsHandler.name, () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockLogger: any;
  let mockService: Partial<TransactionsService>;
  const logGroup = syncTransactionsHandler.name;
  const mockParams: SyncTransactionsParams = { 
    companyId: 'company123', 
    financialInstitutionId: 'fi123' 
  };
  const mockUser = { userId: 'user123' };
  const mockBody: SyncTransactionsBody = {
    fromDate: '2024-01-01',
    toDate: '2024-01-31',
  };

  beforeEach(() => {
    mockLogger = {
      child: jest.fn().mockReturnThis(),
      startStep: jest.fn(),
      endStep: jest.fn(),
    };

    mockRequest = {
      log: mockLogger,
      body: mockBody,
      params: mockParams,
      user: mockUser,
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

  describe('permission check', () => {
    it('should return forbidden when user lacks both create and read permissions', async () => {
      (hasCompanyFinancialInstitutionsCreatePermission as jest.Mock).mockReturnValue(false);
      (hasCompanyFinancialInstitutionsReadPermission as jest.Mock).mockReturnValue(false);

      await syncTransactionsHandler(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      );

      expect(hasCompanyFinancialInstitutionsCreatePermission).toHaveBeenCalledWith(mockParams.companyId, mockUser);
      expect(hasCompanyFinancialInstitutionsReadPermission).toHaveBeenCalledWith(mockParams.companyId, mockUser);
      expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.FORBIDDEN);
      expect(mockReply.send).toHaveBeenCalledWith({
        code: FORBIDDEN_ERROR.responseCode,
        message: FORBIDDEN_ERROR.responseMessage,
      });
      expect(mockService.syncWithFinancialInstitution).not.toHaveBeenCalled();
    });

    it('should allow access when user has create permission', async () => {
      (hasCompanyFinancialInstitutionsCreatePermission as jest.Mock).mockReturnValue(true);
      (hasCompanyFinancialInstitutionsReadPermission as jest.Mock).mockReturnValue(false);
      jest.spyOn(mockService, 'syncWithFinancialInstitution').mockResolvedValue();

      await syncTransactionsHandler(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      );

      expect(mockService.syncWithFinancialInstitution).toHaveBeenCalled();
      expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.NO_CONTENT);
    });

    it('should allow access when user has read permission', async () => {
      (hasCompanyFinancialInstitutionsCreatePermission as jest.Mock).mockReturnValue(false);
      (hasCompanyFinancialInstitutionsReadPermission as jest.Mock).mockReturnValue(true);
      jest.spyOn(mockService, 'syncWithFinancialInstitution').mockResolvedValue();

      await syncTransactionsHandler(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      );

      expect(mockService.syncWithFinancialInstitution).toHaveBeenCalled();
      expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.NO_CONTENT);
    });
  });

  describe('successful transaction sync', () => {
    beforeEach(() => {
      (hasCompanyFinancialInstitutionsCreatePermission as jest.Mock).mockReturnValue(true);
      (hasCompanyFinancialInstitutionsReadPermission as jest.Mock).mockReturnValue(false);
    });

    it('should sync transactions successfully', async () => {
      jest.spyOn(mockService, 'syncWithFinancialInstitution').mockResolvedValue();

      await syncTransactionsHandler(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      );

      expect(mockLogger.child).toHaveBeenCalledWith({
        handler: syncTransactionsHandler.name,
      });
      expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.SYNC_TRANSACTIONS.id, logGroup);
      expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.SYNC_TRANSACTIONS.id);

      expect(mockService.syncWithFinancialInstitution).toHaveBeenCalledWith({
        companyId: mockParams.companyId,
        financialInstitutionId: mockParams.financialInstitutionId,
        fromDate: mockBody.fromDate,
        toDate: mockBody.toDate,
      }, mockLogger);

      expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.NO_CONTENT);
      expect(mockReply.send).toHaveBeenCalledWith();
    });

    it('should handle service errors gracefully', async () => {
      const error = new Error('Service error');
      jest.spyOn(mockService, 'syncWithFinancialInstitution').mockRejectedValue(error);

      await expect(
        syncTransactionsHandler(
          mockRequest as FastifyRequest,
          mockReply as FastifyReply,
        ),
      ).rejects.toThrow(error);

      expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.SYNC_TRANSACTIONS.id, logGroup);
      expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.SYNC_TRANSACTIONS.id);
      expect(mockReply.code).not.toHaveBeenCalled();
      expect(mockReply.send).not.toHaveBeenCalled();
    });
  });

  describe('request parameter extraction', () => {
    beforeEach(() => {
      (hasCompanyFinancialInstitutionsCreatePermission as jest.Mock).mockReturnValue(true);
      (hasCompanyFinancialInstitutionsReadPermission as jest.Mock).mockReturnValue(false);
      jest.spyOn(mockService, 'syncWithFinancialInstitution').mockResolvedValue();
    });

    it('should extract and pass all required parameters correctly', async () => {
      await syncTransactionsHandler(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      );

      expect(mockService.syncWithFinancialInstitution).toHaveBeenCalledWith({
        companyId: 'company123',
        financialInstitutionId: 'fi123',
        fromDate: '2024-01-01',
        toDate: '2024-01-31',
      }, mockLogger);
    });

    it('should handle different date ranges', async () => {
      const customBody: SyncTransactionsBody = {
        fromDate: '2024-12-01',
        toDate: '2024-12-31',
      };
      mockRequest.body = customBody;

      await syncTransactionsHandler(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      );

      expect(mockService.syncWithFinancialInstitution).toHaveBeenCalledWith({
        companyId: 'company123',
        financialInstitutionId: 'fi123',
        fromDate: '2024-12-01',
        toDate: '2024-12-31',
      }, mockLogger);
    });
  });
}); 