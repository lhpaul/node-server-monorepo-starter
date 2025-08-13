import { FORBIDDEN_ERROR, STATUS_CODES } from '@repo/fastify';
import { CompaniesService } from '@repo/shared/domain';
import { maskFields } from '@repo/shared/utils';
import { FastifyReply, FastifyRequest } from 'fastify';

import { AuthUser } from '../../../../../../../definitions/auth.interfaces';
import { hasCompanyFinancialInstitutionsGetPermission } from '../../../../../../../utils/permissions';
import { CREDENTIALS_FIELDS_TO_MASK, ERROR_RESPONSES } from '../../../financial-institutions.endpoints.constants';
import { STEPS } from '../financial-institutions.get.handler.constants';
import { getFinancialInstitutionHandler } from '../financial-institutions.get.handler';
import { GetCompanyFinancialInstitutionParams } from '../financial-institutions.get.handler.interfaces';

jest.mock('@repo/shared/domain');
jest.mock('@repo/shared/utils', () => ({
  ...jest.requireActual('@repo/shared/utils'),
  maskFields: jest.fn(),
}));
jest.mock('../../../../../../../utils/permissions', () => ({
  hasCompanyFinancialInstitutionsGetPermission: jest.fn(),
}));

describe(getFinancialInstitutionHandler.name, () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockLogger: any;
  let mockService: Partial<CompaniesService>;
  const logGroup = getFinancialInstitutionHandler.name;
  const mockParams: GetCompanyFinancialInstitutionParams = { 
    companyId: 'company123', 
    id: 'fi-relation-123' 
  };
  const mockUser = { app_user_id: 'user123' } as AuthUser;
  const mockFinancialInstitution = {
    id: 'fi-relation-123',
    companyId: 'company123',
    credentials: { username: 'test', password: 'secret' },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    financialInstitution: {
      id: 'fi1',
      name: 'Bank 1',
    },
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
      params: mockParams,
      user: mockUser,
    };

    mockReply = {
      code: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    mockService = {
      getFinancialInstitution: jest.fn(),
    };

    (CompaniesService.getInstance as jest.Mock).mockReturnValue(mockService);
    (maskFields as jest.Mock).mockImplementation((credentials) => ({
      ...credentials,
      password: '***',
    }));
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe('permission check', () => {
    it('should return forbidden when user lacks permission', async () => {
      (hasCompanyFinancialInstitutionsGetPermission as jest.Mock).mockReturnValue(false);

      await getFinancialInstitutionHandler(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      );

      expect(hasCompanyFinancialInstitutionsGetPermission).toHaveBeenCalledWith(mockParams.companyId, mockUser);
      expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.FORBIDDEN);
      expect(mockReply.send).toHaveBeenCalledWith({
        code: FORBIDDEN_ERROR.responseCode,
        message: FORBIDDEN_ERROR.responseMessage,
      });
      expect(mockService.getFinancialInstitution).not.toHaveBeenCalled();
    });
  });

  describe('successful financial institution retrieval', () => {
    beforeEach(() => {
      (hasCompanyFinancialInstitutionsGetPermission as jest.Mock).mockReturnValue(true);
    });

    it('should get financial institution successfully with masked credentials', async () => {
      jest.spyOn(mockService, 'getFinancialInstitution').mockResolvedValue(mockFinancialInstitution);

      await getFinancialInstitutionHandler(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      );

      expect(mockLogger.child).toHaveBeenCalledWith({
        handler: getFinancialInstitutionHandler.name,
      });
      expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_FINANCIAL_INSTITUTION.id, logGroup);
      expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_FINANCIAL_INSTITUTION.id);

      expect(mockService.getFinancialInstitution).toHaveBeenCalledWith(
        mockParams.companyId,
        { financialInstitutionRelationId: mockParams.id },
        mockLogger,
      );

      expect(maskFields).toHaveBeenCalledWith(mockFinancialInstitution.credentials, CREDENTIALS_FIELDS_TO_MASK);

      const expectedResponse = {
        ...mockFinancialInstitution,
        credentials: { ...mockFinancialInstitution.credentials, password: '***' },
      };

      expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.OK);
      expect(mockReply.send).toHaveBeenCalledWith(expectedResponse);
    });
  });

  describe('error handling', () => {
    beforeEach(() => {
      (hasCompanyFinancialInstitutionsGetPermission as jest.Mock).mockReturnValue(true);
    });

    it('should return not found when financial institution relation does not exist', async () => {
      jest.spyOn(mockService, 'getFinancialInstitution').mockResolvedValue(null);

      await getFinancialInstitutionHandler(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      );

      expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_FINANCIAL_INSTITUTION.id, logGroup);
      expect(mockService.getFinancialInstitution).toHaveBeenCalledWith(
        mockParams.companyId,
        { financialInstitutionRelationId: mockParams.id },
        mockLogger,
      );
      expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_FINANCIAL_INSTITUTION.id);
      expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.NOT_FOUND);
      expect(mockReply.send).toHaveBeenCalledWith({
        code: ERROR_RESPONSES.FINANCIAL_INSTITUTION_RELATION_NOT_FOUND.code,
        message: ERROR_RESPONSES.FINANCIAL_INSTITUTION_RELATION_NOT_FOUND.message,
      });
    });

    it('should handle service errors gracefully', async () => {
      const error = new Error('Service error');
      jest.spyOn(mockService, 'getFinancialInstitution').mockRejectedValue(error);

      await expect(
        getFinancialInstitutionHandler(
          mockRequest as FastifyRequest,
          mockReply as FastifyReply,
        ),
      ).rejects.toThrow(error);

      expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_FINANCIAL_INSTITUTION.id, logGroup);
      expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_FINANCIAL_INSTITUTION.id);
      expect(mockReply.code).not.toHaveBeenCalled();
      expect(mockReply.send).not.toHaveBeenCalled();
    });
  });
}); 