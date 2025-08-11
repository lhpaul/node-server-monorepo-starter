import { FORBIDDEN_ERROR, STATUS_CODES } from '@repo/fastify';
import { CompaniesService, UpdateFinancialInstitutionError, UpdateFinancialInstitutionErrorCode } from '@repo/shared/domain';
import { FastifyReply, FastifyRequest } from 'fastify';

import { hasCompanyFinancialInstitutionsUpdatePermission } from '../../../../../../../utils/auth/auth.utils';
import { STEPS } from '../financial-institutions.update.handler.constants';
import { updateFinancialInstitutionHandler } from '../financial-institutions.update.handler';
import { UpdateCompanyFinancialInstitutionBody, UpdateCompanyFinancialInstitutionParams } from '../financial-institutions.update.handler.interfaces';

jest.mock('@repo/shared/domain', () => ({
  ...jest.requireActual('@repo/shared/domain'),
  CompaniesService: {
    getInstance: jest.fn(),
  },
}));
jest.mock('../../../../../../../utils/auth/auth.utils', () => ({
  hasCompanyFinancialInstitutionsUpdatePermission: jest.fn(),
}));

describe(updateFinancialInstitutionHandler.name, () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockLogger: any;
  let mockService: Partial<CompaniesService>;
  const logGroup = updateFinancialInstitutionHandler.name;
  const mockParams: UpdateCompanyFinancialInstitutionParams = { 
    companyId: 'company123', 
    id: 'fi-relation-123' 
  };
  const mockUser = { userId: 'user123' };
  const mockBody: UpdateCompanyFinancialInstitutionBody = {
    credentials: { username: 'updated', password: 'newsecret' },
  };

  beforeEach(() => {
    jest.useFakeTimers();
    
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
      updateFinancialInstitution: jest.fn(),
    };

    (CompaniesService.getInstance as jest.Mock).mockReturnValue(mockService);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe('permission check', () => {
    it('should return forbidden when user lacks permission', async () => {
      (hasCompanyFinancialInstitutionsUpdatePermission as jest.Mock).mockReturnValue(false);

      await updateFinancialInstitutionHandler(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      );

      expect(hasCompanyFinancialInstitutionsUpdatePermission).toHaveBeenCalledWith(mockParams.companyId, mockUser);
      expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.FORBIDDEN);
      expect(mockReply.send).toHaveBeenCalledWith({
        code: FORBIDDEN_ERROR.responseCode,
        message: FORBIDDEN_ERROR.responseMessage,
      });
      expect(mockService.updateFinancialInstitution).not.toHaveBeenCalled();
    });
  });

  describe('successful financial institution update', () => {
    beforeEach(() => {
      (hasCompanyFinancialInstitutionsUpdatePermission as jest.Mock).mockReturnValue(true);
    });

    it('should update financial institution successfully', async () => {
      jest.spyOn(mockService, 'updateFinancialInstitution').mockResolvedValue(undefined);

      await updateFinancialInstitutionHandler(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      );

      expect(mockLogger.child).toHaveBeenCalledWith({
        handler: updateFinancialInstitutionHandler.name,
      });
      expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.UPDATE_FINANCIAL_INSTITUTION.id, logGroup);
      expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.UPDATE_FINANCIAL_INSTITUTION.id);

      expect(mockService.updateFinancialInstitution).toHaveBeenCalledWith(
        mockParams.companyId,
        {
          financialInstitutionRelationId: mockParams.id,
          credentials: mockBody.credentials,
        },
        mockLogger,
      );

      expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.NO_CONTENT);
      expect(mockReply.send).toHaveBeenCalledWith();
    });
  });

  describe('error handling', () => {
    beforeEach(() => {
      (hasCompanyFinancialInstitutionsUpdatePermission as jest.Mock).mockReturnValue(true);
    });

    it('should handle relation not found error', async () => {
      const error = new UpdateFinancialInstitutionError({
        code: UpdateFinancialInstitutionErrorCode.RELATION_NOT_FOUND,
        message: 'Relation not found',
      });
      jest.spyOn(mockService, 'updateFinancialInstitution').mockRejectedValue(error);

      await updateFinancialInstitutionHandler(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      );

      expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.UPDATE_FINANCIAL_INSTITUTION.id, logGroup);
      expect(mockService.updateFinancialInstitution).toHaveBeenCalledWith(
        mockParams.companyId,
        {
          financialInstitutionRelationId: mockParams.id,
          credentials: mockBody.credentials,
        },
        mockLogger,
      );
      expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.NOT_FOUND);
      expect(mockReply.send).toHaveBeenCalledWith({
        code: error.code,
        message: error.message,
      });
    });

    it('should handle other update financial institution errors', async () => {
      const error = new UpdateFinancialInstitutionError({
        code: UpdateFinancialInstitutionErrorCode.INVALID_CREDENTIALS_FORMAT,
        message: 'Invalid credentials format',
      });
      jest.spyOn(mockService, 'updateFinancialInstitution').mockRejectedValue(error);

      await updateFinancialInstitutionHandler(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      );

      expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.UPDATE_FINANCIAL_INSTITUTION.id, logGroup);
      expect(mockService.updateFinancialInstitution).toHaveBeenCalledWith(
        mockParams.companyId,
        {
          financialInstitutionRelationId: mockParams.id,
          credentials: mockBody.credentials,
        },
        mockLogger,
      );
      expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.UPDATE_FINANCIAL_INSTITUTION.id);
      expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.BAD_REQUEST);
      expect(mockReply.send).toHaveBeenCalledWith({
        code: error.code,
        message: error.message,
      });
    });

    it('should handle service errors gracefully', async () => {
      const error = new Error('Service error');
      jest.spyOn(mockService, 'updateFinancialInstitution').mockRejectedValue(error);

      await expect(
        updateFinancialInstitutionHandler(
          mockRequest as FastifyRequest,
          mockReply as FastifyReply,
        ),
      ).rejects.toThrow(error);

      expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.UPDATE_FINANCIAL_INSTITUTION.id, logGroup);
      expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.UPDATE_FINANCIAL_INSTITUTION.id);
      expect(mockReply.code).not.toHaveBeenCalled();
      expect(mockReply.send).not.toHaveBeenCalled();
    });
  });
}); 