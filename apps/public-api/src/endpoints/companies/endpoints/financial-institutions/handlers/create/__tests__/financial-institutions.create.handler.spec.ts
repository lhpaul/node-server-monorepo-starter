import { FORBIDDEN_ERROR, STATUS_CODES } from '@repo/fastify';
import { AddFinancialInstitutionError, AddFinancialInstitutionErrorCode, CompaniesService } from '@repo/shared/domain';
import { FastifyReply, FastifyRequest } from 'fastify';

import { hasCompanyFinancialInstitutionsCreatePermission } from '../../../../../../../utils/auth/auth.utils';
import { STEPS } from '../financial-institutions.create.handler.constants';
import { createFinancialInstitutionHandler } from '../financial-institutions.create.handler';
import { CreateCompanyFinancialInstitutionBody, CreateCompanyFinancialInstitutionParams } from '../financial-institutions.create.handler.interfaces';

jest.mock('@repo/shared/domain', () => ({
  ...jest.requireActual('@repo/shared/domain'),
  CompaniesService: {
    getInstance: jest.fn(),
  },
  AddFinancialInstitutionError: jest.fn(),
}));
jest.mock('../../../../../../../utils/auth/auth.utils', () => ({
  hasCompanyFinancialInstitutionsCreatePermission: jest.fn(),
}));

describe(createFinancialInstitutionHandler.name, () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockLogger: any;
  let mockService: Partial<CompaniesService>;
  const logGroup = createFinancialInstitutionHandler.name;
  const mockParams: CreateCompanyFinancialInstitutionParams = { companyId: 'company123' };
  const mockUser = { userId: 'user123' };
  const mockBody: CreateCompanyFinancialInstitutionBody = {
    credentials: { username: 'test', password: 'secret' },
    financialInstitutionId: 'fi123',
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
      addFinancialInstitution: jest.fn(),
    };

    (CompaniesService.getInstance as jest.Mock).mockReturnValue(mockService);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe('permission check', () => {
    it('should return forbidden when user lacks permission', async () => {
      (hasCompanyFinancialInstitutionsCreatePermission as jest.Mock).mockReturnValue(false);

      await createFinancialInstitutionHandler(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      );

      expect(hasCompanyFinancialInstitutionsCreatePermission).toHaveBeenCalledWith(mockParams.companyId, mockUser);
      expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.FORBIDDEN);
      expect(mockReply.send).toHaveBeenCalledWith({
        code: FORBIDDEN_ERROR.responseCode,
        message: FORBIDDEN_ERROR.responseMessage,
      });
      expect(mockService.addFinancialInstitution).not.toHaveBeenCalled();
    });
  });

  describe('successful financial institution creation', () => {
    beforeEach(() => {
      (hasCompanyFinancialInstitutionsCreatePermission as jest.Mock).mockReturnValue(true);
    });

    it('should create a financial institution successfully', async () => {
      const mockFinancialInstitutionId = 'fi-relation-123';
      jest.spyOn(mockService, 'addFinancialInstitution').mockResolvedValue(mockFinancialInstitutionId);

      await createFinancialInstitutionHandler(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      );

      expect(mockLogger.child).toHaveBeenCalledWith({
        handler: createFinancialInstitutionHandler.name,
      });
      expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.ADD_FINANCIAL_INSTITUTION.id, logGroup);
      expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.ADD_FINANCIAL_INSTITUTION.id);

      expect(mockService.addFinancialInstitution).toHaveBeenCalledWith(
        mockParams.companyId,
        {
          financialInstitutionId: mockBody.financialInstitutionId,
          credentials: mockBody.credentials,
        },
        mockLogger,
      );

      expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.CREATED);
      expect(mockReply.send).toHaveBeenCalledWith({ id: mockFinancialInstitutionId });
    });
  });

  describe('error handling', () => {
    beforeEach(() => {
      (hasCompanyFinancialInstitutionsCreatePermission as jest.Mock).mockReturnValue(true);
    });

    it('should handle AddFinancialInstitutionError', async () => {
      const error = new AddFinancialInstitutionError({
        code: AddFinancialInstitutionErrorCode.INVALID_CREDENTIALS_FORMAT,
        message: 'Invalid credentials format',
      });
      jest.spyOn(mockService, 'addFinancialInstitution').mockRejectedValue(error);

      await createFinancialInstitutionHandler(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      );

      expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.BAD_REQUEST);
      expect(mockReply.send).toHaveBeenCalledWith({
        code: error.code,
        message: error.message,
        data: error.data,
      });
    });

    it('should handle service errors gracefully', async () => {
      const error = new Error('Service error');
      jest.spyOn(mockService, 'addFinancialInstitution').mockRejectedValue(error);

      await expect(
        createFinancialInstitutionHandler(
          mockRequest as FastifyRequest,
          mockReply as FastifyReply,
        ),
      ).rejects.toThrow(error);

      expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.ADD_FINANCIAL_INSTITUTION.id, logGroup);
      expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.ADD_FINANCIAL_INSTITUTION.id);
      expect(mockReply.code).not.toHaveBeenCalled();
      expect(mockReply.send).not.toHaveBeenCalled();
    });
  });
}); 