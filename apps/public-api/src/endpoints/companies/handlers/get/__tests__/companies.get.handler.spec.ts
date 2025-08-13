import { FORBIDDEN_ERROR, STATUS_CODES } from '@repo/fastify';
import { CompaniesService } from '@repo/shared/domain';
import { FastifyBaseLogger, FastifyReply, FastifyRequest } from 'fastify';

import { AuthUser } from '../../../../../definitions/auth.interfaces';
import { hasCompanyReadPermission } from '../../../../../utils/auth/auth.utils';
import { COMPANY_NOT_FOUND_ERROR } from '../../../companies.endpoints.constants';
import { STEPS } from '../companies.get.handler.constants';
import { getCompanyHandler } from '../companies.get.handler';

jest.mock('@repo/fastify', () => ({
  STATUS_CODES: {
    OK: 200,
    FORBIDDEN: 403
  },
  FORBIDDEN_ERROR: {
    responseCode: 'forbidden',
    responseMessage: 'Forbidden request'
  }
}));

jest.mock('@repo/shared/domain');

jest.mock('../../../../../utils/auth/auth.utils', () => ({
  hasCompanyReadPermission: jest.fn(),
}));

describe(getCompanyHandler.name, () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockLogger: {
    startStep: jest.Mock;
    endStep: jest.Mock;
  } & Partial<FastifyBaseLogger>;
  let mockService: Partial<CompaniesService>;

  const logGroup = getCompanyHandler.name;
  const mockParams = { id: '123' };
  const mockUser: AuthUser = {
    companies: { 'company-1': ['read'] },
  } as unknown as AuthUser;

  beforeEach(() => {
    mockLogger = {
      child: jest.fn().mockReturnThis(),
      startStep: jest.fn(),
      endStep: jest.fn(),
    };

    mockRequest = {
      log: mockLogger as FastifyBaseLogger,
      params: mockParams,
      user: mockUser,
    };

    mockReply = {
      code: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    mockService = {
      getResource: jest.fn(),
    };

    (CompaniesService.getInstance as jest.Mock).mockReturnValue(
      mockService,
    );

    (hasCompanyReadPermission as jest.Mock).mockReturnValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully retrieve a company', async () => {
    const mockCompany = {
      id: mockParams.id,
      name: 'Test Company',
      countryCode: 'US',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    jest.spyOn(mockService, 'getResource').mockResolvedValue(mockCompany);

    await getCompanyHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(hasCompanyReadPermission).toHaveBeenCalledWith(mockParams.id, mockUser);
    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_COMPANY.id, logGroup);
    expect(mockService.getResource).toHaveBeenCalledWith(mockParams.id, mockLogger);
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_COMPANY.id);
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.OK);
    expect(mockReply.send).toHaveBeenCalledWith(mockCompany);
  });

  it('should handle forbidden access', async () => {
    (hasCompanyReadPermission as jest.Mock).mockReturnValue(false);

    await getCompanyHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(hasCompanyReadPermission).toHaveBeenCalledWith(mockParams.id, mockUser);
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.FORBIDDEN);
    expect(mockReply.send).toHaveBeenCalledWith({
      code: FORBIDDEN_ERROR.responseCode,
      message: FORBIDDEN_ERROR.responseMessage,
    });
    expect(mockService.getResource).not.toHaveBeenCalled();
  });

  it('should throw error when company not found', async () => {
    jest.spyOn(mockService, 'getResource').mockResolvedValue(null);

    await expect(
      getCompanyHandler(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      ),
    ).rejects.toThrow(COMPANY_NOT_FOUND_ERROR(mockParams.id));

    expect(hasCompanyReadPermission).toHaveBeenCalledWith(mockParams.id, mockUser);
    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_COMPANY.id, logGroup);
    expect(mockService.getResource).toHaveBeenCalledWith(mockParams.id, mockLogger);
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_COMPANY.id);
    expect(mockReply.code).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });

  it('should handle service errors', async () => {
    const error = new Error('Service error');
    jest.spyOn(mockService, 'getResource').mockRejectedValue(error);

    await expect(
      getCompanyHandler(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      ),
    ).rejects.toThrow(error);

    expect(hasCompanyReadPermission).toHaveBeenCalledWith(mockParams.id, mockUser);
    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_COMPANY.id, logGroup);
    expect(mockService.getResource).toHaveBeenCalledWith(mockParams.id, mockLogger);
    expect(mockReply.code).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });
});
