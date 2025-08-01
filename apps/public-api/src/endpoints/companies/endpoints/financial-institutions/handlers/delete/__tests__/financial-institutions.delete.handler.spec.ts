import { FORBIDDEN_ERROR, STATUS_CODES } from '@repo/fastify';
import { CompaniesService, RemoveFinancialInstitutionError, RemoveFinancialInstitutionErrorCode } from '@repo/shared/services';
import { FastifyReply, FastifyRequest } from 'fastify';

import { hasCompanyFinancialInstitutionsDeletePermission } from '../../../../../../../utils/auth/auth.utils';
import { STEPS } from '../financial-institutions.delete.handler.constants';
import { deleteFinancialInstitutionHandler } from '../financial-institutions.delete.handler';
import { DeleteCompanyFinancialInstitutionParams } from '../financial-institutions.delete.handler.interfaces';

jest.mock('@repo/shared/services');
jest.mock('../../../../../../../utils/auth/auth.utils', () => ({
  hasCompanyFinancialInstitutionsDeletePermission: jest.fn(),
}));

describe(deleteFinancialInstitutionHandler.name, () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockLogger: any;
  let mockService: Partial<CompaniesService>;
  const logGroup = deleteFinancialInstitutionHandler.name;
  const mockParams: DeleteCompanyFinancialInstitutionParams = { 
    companyId: 'company123', 
    id: 'fi-relation-123' 
  };
  const mockUser = { userId: 'user123' };

  beforeEach(() => {
    jest.useFakeTimers();
    
    mockLogger = {
      child: jest.fn().mockReturnThis(),
      startStep: jest.fn(),
      endStep: jest.fn(),
    };

    mockRequest = {
      log: mockLogger,
      params: mockParams,
      user: mockUser,
    };

    mockReply = {
      code: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    mockService = {
      removeFinancialInstitution: jest.fn(),
    };

    (CompaniesService.getInstance as jest.Mock).mockReturnValue(mockService);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe('permission check', () => {
    it('should return forbidden when user lacks permission', async () => {
      (hasCompanyFinancialInstitutionsDeletePermission as jest.Mock).mockReturnValue(false);

      await deleteFinancialInstitutionHandler(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      );

      expect(hasCompanyFinancialInstitutionsDeletePermission).toHaveBeenCalledWith(mockParams.companyId, mockUser);
      expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.FORBIDDEN);
      expect(mockReply.send).toHaveBeenCalledWith({
        code: FORBIDDEN_ERROR.responseCode,
        message: FORBIDDEN_ERROR.responseMessage,
      });
      expect(mockService.removeFinancialInstitution).not.toHaveBeenCalled();
    });
  });

  describe('successful financial institution deletion', () => {
    beforeEach(() => {
      (hasCompanyFinancialInstitutionsDeletePermission as jest.Mock).mockReturnValue(true);
    });

    it('should delete financial institution successfully', async () => {
      jest.spyOn(mockService, 'removeFinancialInstitution').mockResolvedValue(undefined);

      await deleteFinancialInstitutionHandler(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      );

      expect(mockLogger.child).toHaveBeenCalledWith({
        handler: deleteFinancialInstitutionHandler.name,
      });
      expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.REMOVE_FINANCIAL_INSTITUTION.id, logGroup);
      expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.REMOVE_FINANCIAL_INSTITUTION.id);

      expect(mockService.removeFinancialInstitution).toHaveBeenCalledWith(
        mockParams.companyId,
        {
          financialInstitutionRelationId: mockParams.id,
        },
        mockLogger,
      );

      expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.NO_CONTENT);
      expect(mockReply.send).toHaveBeenCalledWith();
    });
  });

  describe('error handling', () => {
    beforeEach(() => {
      (hasCompanyFinancialInstitutionsDeletePermission as jest.Mock).mockReturnValue(true);
    });

    it('should handle remove financial institution error', async () => {
      const error = new RemoveFinancialInstitutionError({
        code: RemoveFinancialInstitutionErrorCode.RELATION_NOT_FOUND,
        message: 'Financial institution relation not found',
      });
      jest.spyOn(mockService, 'removeFinancialInstitution').mockRejectedValue(error);

      await deleteFinancialInstitutionHandler(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      );

      expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.REMOVE_FINANCIAL_INSTITUTION.id, logGroup);
      expect(mockService.removeFinancialInstitution).toHaveBeenCalledWith(
        mockParams.companyId,
        {
          financialInstitutionRelationId: mockParams.id,
        },
        mockLogger,
      );
      expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.REMOVE_FINANCIAL_INSTITUTION.id);
      expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.NOT_FOUND);
      expect(mockReply.send).toHaveBeenCalledWith({
        code: error.code,
        message: error.message,
      });
    });

    it('should handle service errors gracefully', async () => {
      const error = new Error('Service error');
      jest.spyOn(mockService, 'removeFinancialInstitution').mockRejectedValue(error);

      await expect(
        deleteFinancialInstitutionHandler(
          mockRequest as FastifyRequest,
          mockReply as FastifyReply,
        ),
      ).rejects.toThrow(error);

      expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.REMOVE_FINANCIAL_INSTITUTION.id, logGroup);
      expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.REMOVE_FINANCIAL_INSTITUTION.id);
      expect(mockReply.code).not.toHaveBeenCalled();
      expect(mockReply.send).not.toHaveBeenCalled();
    });
  });
}); 