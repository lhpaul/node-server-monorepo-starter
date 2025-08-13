import { FORBIDDEN_ERROR, STATUS_CODES } from '@repo/fastify';
import { CompaniesService } from '@repo/shared/domain';
import { maskFields } from '@repo/shared/utils';
import { FastifyReply, FastifyRequest } from 'fastify';

import { AuthUser } from '../../../../../../../definitions/auth.interfaces';
import { hasCompanyFinancialInstitutionsListPermission } from '../../../../../../../utils/permissions';
import { CREDENTIALS_FIELDS_TO_MASK } from '../../../financial-institutions.endpoints.constants';
import { STEPS } from '../financial-institutions.list.handler.constants';
import { listFinancialInstitutionsHandler } from '../financial-institutions.list.handler';
import { ListCompanyFinancialInstitutionsParams } from '../financial-institutions.list.handler.interfaces';

jest.mock('@repo/shared/domain');
jest.mock('@repo/shared/utils', () => ({
  ...jest.requireActual('@repo/shared/utils'),
  maskFields: jest.fn(),
}));
jest.mock('../../../../../../../utils/permissions', () => ({
  hasCompanyFinancialInstitutionsListPermission: jest.fn(),
}));

describe(listFinancialInstitutionsHandler.name, () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockLogger: any;
  let mockService: Partial<CompaniesService>;
  const logGroup = listFinancialInstitutionsHandler.name;
  const mockParams: ListCompanyFinancialInstitutionsParams = { companyId: 'company123' };
  const mockUser = { app_user_id: 'user123' } as AuthUser;
  const mockFinancialInstitutions = [
    {
      id: 'fi-relation-1',
      companyId: 'company123',
      credentials: { username: 'test1', password: 'secret1' },
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      financialInstitution: {
        id: 'fi1',
        name: 'Bank 1',
      },
    },
    {
      id: 'fi-relation-2',
      companyId: 'company123',
      credentials: { username: 'test2', password: 'secret2' },
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
      financialInstitution: {
        id: 'fi2',
        name: 'Bank 2',
      },
    },
  ];

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
      listFinancialInstitutions: jest.fn(),
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
      (hasCompanyFinancialInstitutionsListPermission as jest.Mock).mockReturnValue(false);

      await listFinancialInstitutionsHandler(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      );

      expect(hasCompanyFinancialInstitutionsListPermission).toHaveBeenCalledWith(mockParams.companyId, mockUser);
      expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.FORBIDDEN);
      expect(mockReply.send).toHaveBeenCalledWith({
        code: FORBIDDEN_ERROR.responseCode,
        message: FORBIDDEN_ERROR.responseMessage,
      });
      expect(mockService.listFinancialInstitutions).not.toHaveBeenCalled();
    });
  });

  describe('successful financial institutions listing', () => {
    beforeEach(() => {
      (hasCompanyFinancialInstitutionsListPermission as jest.Mock).mockReturnValue(true);
    });

    it('should list financial institutions successfully with masked credentials', async () => {
      jest.spyOn(mockService, 'listFinancialInstitutions').mockResolvedValue(mockFinancialInstitutions);

      await listFinancialInstitutionsHandler(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      );

      expect(mockLogger.child).toHaveBeenCalledWith({
        handler: listFinancialInstitutionsHandler.name,
      });
      expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_FINANCIAL_INSTITUTIONS.id, logGroup);
      expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_FINANCIAL_INSTITUTIONS.id);

      expect(mockService.listFinancialInstitutions).toHaveBeenCalledWith(mockParams.companyId, mockLogger);

      expect(maskFields).toHaveBeenCalledTimes(2);
      expect(maskFields).toHaveBeenNthCalledWith(1, mockFinancialInstitutions[0].credentials, CREDENTIALS_FIELDS_TO_MASK);
      expect(maskFields).toHaveBeenNthCalledWith(2, mockFinancialInstitutions[1].credentials, CREDENTIALS_FIELDS_TO_MASK);

      const expectedData = mockFinancialInstitutions.map(fi => ({
        ...fi,
        credentials: { ...fi.credentials, password: '***' },
      }));

      expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.OK);
      expect(mockReply.send).toHaveBeenCalledWith(expectedData);
    });

    it('should handle empty list', async () => {
      jest.spyOn(mockService, 'listFinancialInstitutions').mockResolvedValue([]);

      await listFinancialInstitutionsHandler(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      );

      expect(mockService.listFinancialInstitutions).toHaveBeenCalledWith(mockParams.companyId, mockLogger);
      expect(maskFields).not.toHaveBeenCalled();
      expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.OK);
      expect(mockReply.send).toHaveBeenCalledWith([]);
    });
  });

  describe('error handling', () => {
    beforeEach(() => {
      (hasCompanyFinancialInstitutionsListPermission as jest.Mock).mockReturnValue(true);
    });

    it('should handle service errors gracefully', async () => {
      const error = new Error('Service error');
      jest.spyOn(mockService, 'listFinancialInstitutions').mockRejectedValue(error);

      await expect(
        listFinancialInstitutionsHandler(
          mockRequest as FastifyRequest,
          mockReply as FastifyReply,
        ),
      ).rejects.toThrow(error);

      expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_FINANCIAL_INSTITUTIONS.id, logGroup);
      expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_FINANCIAL_INSTITUTIONS.id);
      expect(mockReply.code).not.toHaveBeenCalled();
      expect(mockReply.send).not.toHaveBeenCalled();
    });
  });
}); 